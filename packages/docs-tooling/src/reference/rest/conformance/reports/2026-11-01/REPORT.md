# REST v2 数据面参数可用性验证报告（基于 PR #1005 片段）

- **日期**: 2026-11-01
- **被测物**: Milvus v2.6.26 standalone（milvus-cell vCluster，Helm 部署，REST v2 @ `:19530`）
- **用例口径**: PR #1005 分支片段 `04-vector-operations-v2.json`（附 05/07/08 的 setup 操作）的每个 request body 参数逐项造例
- **上游对照**: milvus-io/milvus @ 5f7e112（#1005 的 pin）`internal/distributed/proxy/httpserver/{request_v2,handler_v2,utils}.go` + `tests/restful_client_v2/testcases/test_{function_chain_api,search_aggregation,search_order_by,query_aggregation}.py`
- **产物**: `rest-v2-param-tests.mjs`（130 用例）、`results.json`（全量请求/响应/效果证据）

## 结果总览

| 判定 | 数量 | 含义 |
|---|---|---|
| PASS-EFFECT | 63 | 接受且效果实证 |
| PASS | 25 | 接受（无数果断言） |
| REJECTED | 16 | 预期拒绝（required/不存在资源等，行为与文档一致） |
| REJECTED(record) | 16 | 拒绝或与文档矛盾（观测记录） |
| RECORDED | 10 | 观测记录（兼容参数/未接线特性） |

## A. 核心参数面：全部可用（效果实证）

- **insert/upsert**: collectionName、dbName（跨库路由实证）、data 数组、partitionName（落分区实证）
- **delete**: filter（deleteCount 实证）、partitionName 隔离（p1/p2 双副本只删指定分区）、exprParams 模板参数、dbName
- **get**: id 标量/数组、outputFields（含 `*` 动态字段）、partitionNames、consistencyLevel ×4
- **query**: filter（含 JSON path、ARRAY_CONTAINS）、outputFields、limit/offset、partitionNames、exprParams、consistencyLevel ×4、dbName
- **search**: data 批量、ids 主键搜索（top1 实证）、annsField 可省略、filter、limit/offset、outputFields、searchParams.metricType(匹配)、searchParams.params.radius/range_filter（边界实证）、searchParams 扁平 ef、groupingField+groupSize、partitionNames、exprParams、consistencyLevel ×4、dbName
- **hybrid_search**: search[] 最小形（仅 data/annsField/limit）、子搜索 filter、rerank rrf k / weighted weights**数组**、limit/offset、partitionNames、consistencyLevel ×4、子搜索 radius/range_filter、dbName
- **functionScore**: **真实生效** —— boost 实证 distance 1→11（base+weight）；decay 接受
- **fieldOps（upsert 路径）**: REPLACE / ARRAY_APPEND（["z","w"]）/ ARRAY_REMOVE（["w"]）全部实证生效；fieldName 缺失、非法 op 被拒

## B. 文档（#1005 片段）与 2.6.26 服务端不符 —— 人审 #1005 时需要知道的

| # | 发现 | 证据 |
|---|---|---|
| B1 | `delete.id`（"可用 id 代替 filter"）**不存在于上游 struct**，发送即被忽略，filter 仍 required | C042/C043：id:"2"+filter:"id == 7" → 只删了 7，id2 存活 |
| B2 | `insert.data`/`upsert.data` 的 **object 形态**文档允许、服务端只收数组（`Data []map[string]interface{}`） | C015/C029：json unmarshal 错误 |
| B3 | `get.id` 文档为 object map、服务端收标量/数组 | C050：1806 cast 错误 |
| B4 | hybrid_search search[] 文档把 filter/groupingField/offset/ignoreGrowing 标 **required**，实际只有 data 必填；`ignoreGrowing` 字段上游 SubSearchReq 根本没有 | C113 最小形成功；C125 |
| B5 | `delete.filter` 文档称可传空串跳过过滤，服务端 binding:required 拒绝空串 | C047 |
| B6 | rerank weighted 实际需要 `params.weights` **数组**（对齐 search 顺序），片段未记载 | C115（map 形态曾报 "weight should be []float"） |
| B7 | search/hybrid 子搜索 `metricType` 与索引不一致时**静默忽略**（索引 metric 优先），文档未说明 | C090/C124 |

## C. 片段来自 master pin、2.6.26 发行版尚未接线（接受但无效果 / 拒绝）

| 特性 | 2.6.26 表现 | master pin 状态 |
|---|---|---|
| query/search `orderByFields` | code 0 但**排序不生效**（desc 仍按自然序） | request_v2.go 有字段+专项测试 test_search_order_by.py |
| query `groupByFields` | 忽略（无分组效果）；配 count(*)+sum() 报 "parse output field name failed" | 有专项测试 test_query_aggregation.py |
| search `searchAggregation` | **完全忽略**（返回普通搜索行，无 aggTopks/buckets）；与 ids 互斥报错倒是有了 | 有专项测试 test_search_aggregation.py |
| search `functionChains` | 接受但**静默不生效**（limit op 不裁剪、sort 不重排、badStage 不校验） | genFunctionChains 全链在 pin |
| hybrid_search `functionChains` | **拒绝** "unsupported rank type"（有无 rerank 均拒绝） | 同上 |
| insert/upsert `partialUpdate` 行**子集** | insert 路径 code 1804 "Syntax error no sources available"；upsert 路径 "fieldSchema(X) has no corresponding fieldData"；**只有整行才成功**（此时与普通写入无差别） | pin 处 buildFieldPartialUpdateOps 完整 |
| fieldOps `PATH_REPLACE`+path | 拒绝 "unsupported partial update op: PATH_REPLACE" | pin 处 V2 parser 已支持 |
| search 顶层 `params` | 接受、无效果（上游注释：compat only） | 一致 |

## D. 2.6.26 观察到的实现怪象（对文档响应示例有影响）

1. **search/hybrid_search 响应 `data` 是扁平数组**（nq 条查询的 hits 顺序拼接，每段 limit 条）——不是嵌套二维数组。
2. JSON 字段在 query/get 输出中是**字符串**（需二次 parse）。
3. 经 fieldOps/partial-update 写过的 Array 字段，回读呈 proto-JSON 信封（`{"Data":{"StringData":{"data":[...]}}}`）。
4. insert 路径 fieldOps ARRAY_APPEND 表现为**替换**而非追加（upsert 路径追加正常）；insert 路径 ARRAY_REMOVE **无效**（upsert 路径正常）。
5. growing 数据上的 delete 返回 `deleteCount=0` 但实际删除成功。
6. 一个失败的 partial-update 可能把旧行覆写成 proto 编码形态（数据完整性风险，2.6.26 特性不完整）。

## E. 复现方式

```bash
export KUBECONFIG=~/.milvus-cell/kubeconfig
kubectl port-forward svc/milvus 19530:19530 -n default   # 如未在跑
node /tmp/pr1005-tests/rest-v2-param-tests.mjs           # ~90s, 幂等（自动 drop 重建）
```

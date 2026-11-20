# node 手册 Phase 2：上游标记 PR 与云段落恢复证据矩阵

日期：2026-11-19
状态：**已执行闭环**。两个上游 PR 已合并（web-content#1326 → 67ef614ba，milvus-docs#3859 → 31f29508c）；zdoc 引擎 PR #1363 + 栈式内容 PR #1364 已开（repin 至 a0fa765e1 + 9 条 transforms + cloud_pages +2 + 转正 +4）。§3 时序的"步骤 4"（引擎包）已随 #1363 完成。

## 0. 已交付

| PR | 内容 | 状态 |
|---|---|---|
| [milvus-io/milvus-docs#3859](https://github.com/milvus-io/milvus-docs/pull/3859) | 新建 AGENTS.md（Reserved markers 节，保护存量 56 文件/235 对标记）+ CONTRIBUTING.md AI-agent 节一句话指引 | open，base=v3.0.x，分支 `docs/agents-reserved-markers`（AnthonyTsu1984 fork） |
| [milvus-io/web-content#1326](https://github.com/milvus-io/web-content/pull/1326) | node v3.0.x 参考页 9 对 doc:block 标记 + AGENTS.md Reserved markers 节（含 SDK 刷新流保标记条款）+ CONTRIBUTING.md 指引 | open，base=master，分支 `sdk/milvus-sdk-node-v3.0.x-reserved-markers`，单 commit DCO |

标记清单（9 对，`@zilliz/mdtomd` parseBlocks 全过、id 唯一、零错误）：

| 文件 | id | 锚区域 |
|---|---|---|
| Collections/createCollection.md | node-create-collection-external-source-createcollectionreq | external_source 参数描述（CreateCollectionReq 节） |
| | node-create-collection-external-spec-createcollectionreq | external_spec 参数描述（同节） |
| | node-create-collection-external-source-createcolwithschema | external_source 参数描述（第三节） |
| | node-create-collection-external-spec-createcolwithschema | external_spec 参数描述（第三节） |
| Collections/refreshExternalCollection.md | node-refresh-external-collection-external-source | external_source 参数描述 |
| | node-refresh-external-collection-external-spec | external_spec 参数描述 |
| Client/MilvusClient.md | node-milvus-client-ssl-config | ssl 参数描述（config 节，8 空格缩进） |
| | node-milvus-client-ssl | ssl 参数描述（顶层参数，4 空格缩进） |
| | node-milvus-client-example | ## Example 代码块整段（add-after 重建 Admonition） |

引擎语义实证（zdoc 侧已验，载荷落 PR 时直接用）：
- 标记可缩进（scan.js:29 正则 `^[ \t]*`）；**注入内容缩进 = 标记行缩进**（transforms/index.ts `contentIndent = indent(lines[block.startLine-1])`，即标记行）→ 列表项内锚点须把标记缩进到描述行同级。
- level-0 add：position before/after，自动补空行分隔；replace：原位换内容、**保留标记行**（发布前 stripMappedMarkers 剥除，已验证 dev 发布产物 0 标记）。
- Admonition 在 transform content 中合法（注册组件，import 由 generator 生成，transforms/index.ts 注释）。

## 1. 证据判定矩阵（被丢弃云内容全集 → 恢复/改写/放弃）

被删内容全集 = fa8d368f2~1 树云信号扫描（8 页 24 处）− 迁移后幸存（仅 DataImport 两页 upstream 自带 Zilliz Cloud 参数句 + landing）。

### B 组：external_source/external_spec（恢复，措辞按 REST 权威口径改写）

| 断言 | 判定 | 证据 |
|---|---|---|
| createCollection："On Zilliz Cloud, external_source accepts two schemes: volume://… and milvus://…" | **真实，恢复**。REST 片段 zilliz include 有一字不差同款句且更细（小写/三段必填/尾斜杠） | zdoc REST `05-collection-operations-v2.json` CollectionSchema.externalSource.description；kite `externalsnapshots.go:729-731` BuildMilvusURI 三段形状；`AsyncCreateCollectionService.java:141-150` volume_uri 构造 |
| createCollection 补充：create 时 external_source 对外部集合必填（旧句没写） | 恢复时带上 | REST 片段 "Required when creating an external collection." |
| 旧句"milvus-table sources are used with the milvus:// scheme" | **前半句过强，改写**：milvus:// → format 必为/默认 milvus-table 真；milvus-table 专属 milvus:// 无证据（kernel 白名单 s3+显式快照+milvus-table 可过、云侧未见封禁） | REST 片段 refresh zilliz include "For a milvus:// source, format must be milvus-table (or omitted)"；kernel `external_spec.go:143-149,234-248`、`milvus_table.go:103` |
| refresh 外层规则："Provide both or omit both; both omitted → reuse persisted source and spec" | **真实，恢复**（scheme 无关硬校验+回退持久值） | kite `proxy/impl.go:6785-6792`（配对校验）、`:6807-6813`（空则报错需初始化）、`datacoord/external_collection_refresh_manager.go:743-748`（回退）、`:919,943`（每次现场列源=仍同步最新数据） |
| "For a volume:// URI, the rule above applies. For a milvus:// source, the same rule applies — omitting it reuses…still syncs the latest data" | **真实，恢复**；milvus:// 省略=prepare 读持久源**新建快照**（usesStoredSource 仅无记录兜底） | `externalsnapshots.go:32-51,88-103` 包注释契约；REST 片段 RefreshExternalCollectionRequest zilliz include 两句 |

### A 组：一致性级别（放弃恢复——上游现句已是云的准确描述）

- 旧句"三档/无 Session"**过时**：云数据面实收五档（kite `common.proto:437-443`、`handler_v2.go:2632-2662` 错误文案含五档 default Bounded）、控制台 UI 四档含 Session（`Milvus.tsx:164-190`）、现网 guides 已写四档（`consistency-level.md:24,44,62`）、11-18 实测 modifyCollections 1→Session 回读成功（线索）。
- 上游现句 "Milvus supports four… default Bounded Staleness" 对云同样成立 → 无信息损失。
- 唯一残差 = Customized 仅 UI/REST spec 不暴露（无服务端硬 gate 证据），上游句子本就未列 → 无需恢复。
- **遗留（zdoc REST 轨独立问题）**：REST 片段集合级 enum 仍把 Session 标 milvus-only（`05-…json:6796-6809,7360-7373` 等），与 proxy 代码/UI/guides/同片段 Query 端点（`04-…json:1956-1977` 无条件含 Session）自相矛盾——疑 gate 滞后产品，另立任务核对。

### C 组：alias 三页（放弃恢复）

- "one alias ↔ one collection / 一集合多别名"：OSS 与云代码逐行同源（milvus `meta_table.go:1669-1710` ≡ kite `meta_table.go:1440-1482`），upstream createAlias.md:32 已有同语义句（"In Milvus, a collection alias is a globally unique identifier…"）→ 恢复=重复。
- "globally unique" 本就不准：唯一性作用域是 database（云控制台方案文档 `docs/plans/2026-07-10-collection-alias-support.md:43` "Alias 在 Database 内唯一"）。

### D 组：连接指引（恢复 2 句，放弃框架句）

| 句 | 判定 | 证据 |
|---|---|---|
| "Always set this to `true` (ssl) on Zilliz Cloud" ×2 | **恢复（改写）**：云 endpoint 是 TLS；SDK ssl 默认 false（`BaseClient.ts:87`）但 `https://` 前缀自动开 TLS（`BaseClient.ts:164-167`）→ 准确句是"endpoint 带 https:// 时自动 TLS；不带 scheme 时须 ssl:true" | SDK 代码行号如上；云 endpoint 形态 `https://…zillizcloud.com:19540`（新旧页示例均在） |
| "Set configOrAddress to your cluster endpoint… Cluster details on the Zilliz Cloud console"（Example 后 Admonition） | **恢复**：endpoint 仅 console 可得，信息不可从 SDK 推导 | 旧页 L231；新页 Example 节裸结束（222 行止） |
| 其余 "Zilliz Cloud cluster" 框架句 ×5（页首/address/username/password/RETURNS） | **放弃**：通用措辞替换，新句更准确；且新版反增 global-cluster mode + session() 云专属文档（迁移并非系统性去云化） | git diff fa8d368f2~1..fa8d368f2 |

### 证据不足（不得写进载荷）
1. milvus:// URI 小写/三段/尾斜杠细则仅 REST 片段背书（解析器在闭源 milvus-cloud-plugin）——REST 是权威口径，可写，注明出处。
2. 云上 s3:// 显式快照 + milvus-table 组合是否允许：kernel 允许、云侧未见封禁也未见背书 → 不写"milvus-table 仅用于 milvus://"。
3. volume:// 源是否可用 MANAGED volume：控制台路径仅 EXTERNAL（`AsyncCreateCollectionService.java:216-218`），REST 数据面无等价校验证据 → 不写。
4. zilliz-cloud-config manifest 级约束：搜索无命中（部分因限流）→ 以 cloud-data-service 校验与 REST 片段为准。

## 2. transform 载荷映射（zdoc 侧 PR 的输入草案）

通道规则：全部 `channel` 留空（两通道都加）；锚标记进 pin 后才可落（TRANSFORM_TARGET_NOT_FOUND fail-closed 对 pin 内容断言）。

| 标记 id | operation | 载荷（content/ 文件）要点 |
|---|---|---|
| node-create-collection-external-source-{createcollectionreq,createcolwithschema} | add after | B 组推荐句（two schemes + 小写/三段/尾斜杠 + create 必填），REST 口径 |
| node-create-collection-external-spec-{createcollectionreq,createcolwithschema} | add after | 改写句："On Zilliz Cloud, `external_spec` is optional when creating an external collection: for a `milvus://` source, omitting it defaults `format` to `milvus-table`; for other sources, provide the spec with the matching `format` (`parquet`, `vortex`, `lance-table`, `iceberg-table`)." |
| node-refresh-external-collection-external-source | add after | refresh 配对/省略规则 + 按 scheme 分句（volume 省略复用持久源；milvus:// 省略=复用+重快照），"still syncs the latest data" |
| node-refresh-external-collection-external-spec | add after | "For a `milvus://` source, `format` must be `milvus-table` (or omitted). For a `volume://` source, provide `external_spec` together with `external_source`, or omit both."（REST 口径） |
| node-milvus-client-ssl{,-config} | add after | "On Zilliz Cloud, always connect over TLS: pass the `https://` cluster endpoint (the SDK enables TLS automatically), or set `ssl` to `true` when the endpoint has no scheme." |
| node-milvus-client-example | add after | `<Admonition type="info" title="Notes">` 一条：endpoint 从 Zilliz Cloud console 的 Cluster details 获取 |

## 3. 时序（zdoc 侧后续）——已全部执行

1. ✅ 两个上游 PR 合并（web-content#1326→67ef614ba→Generate en docs a0fa765e1；milvus-docs#3859→31f29508c）。
2. ✅ 未走 bot 候选通道，直接以 update→promote 命令流产出锁（双通道 a0fa765e1）+ transforms + cloud_pages + exclude 释放，一条内容 PR 交付。
3. ✅ zdoc #1363（引擎，0af0aadc8）+#1364（内容，2f9f9fdde）CI 全绿合并；sync #1365/#1366 由工作流自动合并落 dev（e82dc3e86/dc9cacee2 + e0324c500/a2ef52831）。
4. ✅ 引擎包（manual transforms 支持 + manualScan 审计 + promote 清扫）随 #1363 先行落地。
5. ✅ 沙盒断言全过：145 页、On Zilliz Cloud 0→8 处（createCollection×4/refresh×2/ssl×2）、console Admonition ×1、`volume://` 出现在 create/refresh 两页、输出 0 标记、product-names 绿、record=145 页全 current。
6. 生产 fetch run 44433746506（dispatch node，publish=true）验证中。

## 5. 缺口盘点结论（2026-11-19 二轮，agent 报告摘要）

已落地：VolumeManager（新 Volume 模块 position 10）、getTelemetry 恢复（+5 个新成员：registerCommandHandler/recordOperation/getRecentErrors/getMetricsSnapshots/processCommands，SDK origin/main 81f5823 实证）、4 页转正（reconnectToPrimary/selectGrant/getIndexStatistics/getImportJobProgress——前两页修复"别名已发布本名被 exclude"的自相矛盾）。

维持 exclude（证据/产品口径）：FileResources/（REST 片段 37-…json 为 milvus include 域，云站不发布）、ResourceGroup/、privilege-group create/add 不对称（待产品拍板）、Vector-deleteEntities（已发布 delete 的别名）、batchUpdateManifest/ColumnBuffer（实现细节）。

upstream 缺口（建议另提 upstream PR，不属 cloud_pages）：computePhraseMatchSlop（GrpcClient.ts:769，代理已路由、upstream 与云站均无页）、exportSnapshot/getExportSnapshotState/restoreExternalSnapshot（Collection.ts:2388+，REST 参考缺 export-state 轮询路径）、FunctionChain DSL（FunctionChain.ts:88）。HttpClient 93 方法已全部由 REST 参考覆盖（零缺口）。SearchAggregation/Grantor/ObjectEntity 悬空页在新上游头已不存在（reconcile 已删），无需处理。

**301 集合更新**：原 9 个被删页中 getTelemetry 因 cloud_pages 恢复而回归，剩余 8 页需 301（alterRole、addFunctionField、alterCollectionSchema、dropCollectionField、dropFunctionField、FileResources×3）→ milvus.io 对应页。

## 4. 取证现场

- 两 agent 克隆：/tmp/zdoc-forensics（milvus@0c421ad7, zilliz-cloud@40948f515）、/tmp/zdoc-cloud-forensics-b（sparse）；sdk-node origin/main@81f5823（本地 main 落后 214 commits 未动）。
- 标记工作树：/tmp/md-docs-agents（milvus-docs）、/tmp/wc-markers（web-content）——PR 若需返工可复用。
- 上游基线：web-content origin/master=d3d90149（= zdoc lock pin）；milvus-docs origin/v3.0.x=af96e290e（#3856 已含）。

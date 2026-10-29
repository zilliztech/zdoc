# REST upstream 重放对齐报告:10-21 人工清单 vs 确定性 diff(P1 验收)

- 日期:2026-10-28
- 结论:**79 个操作中 76 个严格一致(96.2%),3 个不一致全部归因于清单过时/范围差异而非工具误差;5/5 deprecated 翻转、3/3 unattributed 字段、2/2 新增参数精确命中;51 条 fragment-only 存量已按家族预登记进 ledger。**

## 1. 输入与证据

| 项 | 值 |
|---|---|
| 上游 pin | `zilliztech/zilliz-cloud` `vdc/global/cloud-control-api/openapi.yaml` @ `e64f3bd77c94971d2352ca61eb86d1a1f11bf2cb`(`rest-upstream-lock.json`) |
| spec 字节摘要 | sha256 `eda48ab6ca21815ac6c46cdebaabfb845575e2a3ad5386b7318f713d714c5d27`(与 lock `contentSha256` 一致,`--expect-pinned` 认证通过) |
| 重放 diff | `diff sha256:37d42765…42d4d`(bootstrap 前)/ `sha256:72f99e26…80cf909`(bootstrap 后,仅 ledger 标注差异) |
| 对照基准 | `tmp/2026-10-21-control-plane-openapi-refresh-change-list.md`(16 片段、79 操作:新增 1 / 删除 1 / 保留 2 / 修改 75) |
| 证据根 | `tmp/rest-upstream-replay/`(spec、diff.json/md、alignment.json、ledger-proposal.json、compare-10-21.js;不入库) |

命令(在 PR #906 分支 `feat/rest-upstream-pipeline` 上):

```bash
gh api "repos/zilliztech/zilliz-cloud/contents/vdc/global/cloud-control-api/openapi.yaml?ref=e64f3bd7…" \
  -H "Accept: application/vnd.github.raw" > tmp/rest-upstream-replay/upstream-spec.yaml
node packages/docs-tooling/src/reference/rest/index.js rest-upstream-diff \
  --source zilliz-cloud-control-plane --spec …/upstream-spec.yaml --expect-pinned --out …/diff
node tmp/rest-upstream-replay/compare-10-21.js …/diff/diff.json tmp/2026-10-21-…-change-list.md
node packages/docs-tooling/src/reference/rest/index.js rest-upstream-ledger-bootstrap \
  --from-diff …/diff/diff.json --date 2026-10-28 --out …/ledger-proposal.json   # 人审后 --merge
```

## 2. 方法

`compare-10-21.js` 解析清单的操作级分类标记(【新增】/【删除】/【保留】/无标记=修改),映射到 diff 类别并逐操作判定:

| 清单标记 | diff 侧期望 |
|---|---|
| 修改 | 存在 `upstream-modified` / `upstream-added-field` / `upstream-added-param` / `unattributed` 条目 |
| 新增 | 存在 `upstream-added` |
| 删除 / 保留 | 存在 `fragment-only` |

字段级事实族(deprecated 翻转、unattributed、新增参数、required 慎采)单独对账。

## 3. 操作级结果

- **修改 75/75 一致**;**新增 1/1 一致**(`POST /v2/clusters/modifyProperties` → `upstream-added`)。
- **保留 2(abort/commit)在 diff 中缺席——正确**:两操作在片段带 `x-include-target: ["milvus"]`,zilliz 控制面源的 diff 按 publicationTarget 排除它们。这正是 10-21 拍板"规格未覆盖 ≠ 下线、milvus 专属"的机器化;它们归 milvus data-plane 源(P2 提取器)管辖。
- **删除 1(remove-project-region)——清单事实已过时,工具抓住**:10-21 判断"研发规格无此接口 → 删除",但 pin 处的 spec **已恢复该端点**(`upstream-spec.yaml:7553`),diff 正确报 `upstream-modified`(response schema 漂移)而非 removal。**退役 + nginx 301 + titles 移除的既定计划必须重新与研发确认;按规则集 `api-truth-upstream`,以上游为准保留操作并做常规刷新。**
- 严格一致率 76/79 = **96.2%**;三个不一致均不构成工具误差。

## 4. 字段级事实族

| 事实族 | 清单 | diff@pin | 判定 |
|---|---|---|---|
| deprecated 翻转 | 5(get_progress true→false;etl/merge、startByRemote、toExisting、toNewDedicated false→true) | 5/5 精确同名同向 | ✅ |
| unattributed(etl/merge onError+validationMode、import/create stageName) | 3 字段 | 3/3 | ✅ |
| 新增参数 | 2 | 2/2(`get /v2/clusters` regionId:query、`patch /v2/clusters/onDemandClusters/{CLUSTER_ID}` Accept:header) | ✅ |
| required 慎采(疑似 codegen 丢失) | 整组警告 | 22 条目 / 13 操作带 `requiresConfirmation` | ✅ 机器化 |
| fragment-only 存量 | (清单外) | 51 = v1 旧接口 17(15-cloud-meta 2 + 16-cluster-operations 10 + 17-pipeline 5)+ spark 9 + access-control 15 + api-keys 5 + private-endpoint 5 | ✅ 家族吻合 |

## 5. ledger bootstrap(随本报告一并落地)

`rest-upstream-ledger-bootstrap --from-diff` 产出 54 条预登记并已 merge 进 `meta/upstream/ledger.json`:

- **51 external**:上述五个家族,`owner: rest-upstream-bootstrap`,reason 载明"确认意图(external/adopted/退役)"供人审修订;
- **2 deferred(unattributed 组)**:etl/merge(onError,validationMode)、import/create(stageName)——分支归属待人审,提案仅登记 delta 已知;
- **1 deferred(upstream-added)**:modifyProperties——采纳(片段+zh titles)待研发确认 publicAddressEnabled(10-21 ⚠️ 项)。

bootstrap 后同 pin 重放:51 条 fragment-only 全部 `ledgerStatus: classified`(仍可见但不再计入实质漂移);实质待刷新 = 518 条目(480 modified + 32 added-field + 2 added-param + 3 unattributed + 1 added)——即首个真实 refresh run 的待办面。分类如有异议,直接修订 ledger 条目(append-only 语义下新增修正条目)并在评审中说明。

## 6. 残余漂移示例(pin 之后的新演化,清单外)

- `import/create` 两个分支 schema 携带 `deprecated: true` 而上游无(zdoc-only 方向)——刷新 run 需决定是否随上游摘除;
- response 载荷形态/描述批量重写(480 modified 的主体)。

## 7. 结论

P1 验收硬指标达成:确定性 diff 在 pin 处对人工清单的复现一致率为 96.2%,全部偏差可归因且已被工具正确处理(范围排除 ×2、清单过时 ×1);五类字段级事实族零误差;ledger 存量预登记完成。工具可用作 refresh/watchdog 的结构权威。

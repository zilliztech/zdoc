# 设计：REST 参考上游接入 —— rest-upstream lock / 刷新 PR / 漂移 watchdog 与双 producer

日期：2026-10-28
状态：设计稿（待评审确认，未实施）
背景：REST 参考现状为 38 个手写 OpenAPI 片段（master-owned，人可 PR）。调研（同日报告）确认：zilliz-cloud 上游已有 CI 治理的 OpenAPI 3.1.0 真值规格，milvus 上游零 spec 但代码形态可机械提取。本设计把"上游真值 → zdoc 片段 → 文档"的对齐流程自动化：机制层复用 shared-docs 的 lock/PR/ledger/watchdog 模式；cloud 控制面先行（人工版流程已被 10-21 清单验证），milvus 数据面次之。

前置阅读：
- `.claude/specs/2026-10-28-rest-openapi-source-to-docs-research.md`（调研结论与工具选型）
- `.claude/specs/2026-10-21-control-plane-openapi-refresh-change-list.md`（人工版刷新全流程 + 已拍板规则集——本设计 agent 规则集的来源）
- `.claude/specs/2026-10-25-sdk-shared-docs-pipeline-design.md`（lock/PR 门/ledger/T 矩阵的机制蓝本）
- `packages/docs-tooling/src/reference/rest/CUSTOM_ATTRIBUTES.md`（x-\* 契约，含 §1.10 生命周期属性）
- `packages/docs-tooling/src/reference/rest/contracts/rest-fragment-collection.schema.json`（canonical provenance 契约）

## 0. 已定决策（不再作为开放项）

| # | 决策 | 来源 |
|---|---|---|
| 1 | **oneOf/anyOf 场景分支是文档层资产，全链路保留**：分支=场景、同名参数按场景重复罗列；上游/代码合并对象=分支并集，不采纳；字段级刷新逐分支独立；新字段分支归属=agent 提案+人审；scenario-branched 操作禁结构级改写 | 用户拍板 2026-10-28 |
| 2 | **shared-docs 机制层复用、渲染层不复用**：lock/PR 门/T3 watchdog/ledger 四件套照搬语义；md2md 组合、翻译 lane、页级激活不复用；REST 不建 shared-docs/rest-\* 手册目录，平行同构 | 用户拍板 2026-10-28 |
| 3 | **结构与 API 真值只来自确定性提取/上游规格，agent 永不发明结构**（spec-forge 原则）；agent 只改 prose 与做分支归属提案 | 调研红线 |
| 4 | **片段停留现址** `meta/openapi/*.json`，不迁移目录（避免最重契约面搬家） | 本设计 |
| 5 | **lock 语义对齐 shared-docs**：lock 不动 = 只报告漂移；采纳上游 = bump pin 的刷新 PR（单 PR 原子） | 本设计 §3 |
| 6 | **发布链零改动**：fragment → fetch-apifox-docs / generate-integrated-spec、sync 的 REST 重生成（#787 机制）、site-validation 的 REST_DERIVATION_FRAGMENT_DRIFT 闸全部不动；新工作流不进 `docs-production-dev` 队列、无发布写路径 | AGENTS.md 第 4 条 + 本设计 |
| 7 | zh-CN REST 语义是刻意的产品 SKU 定义，严禁向 en/上游对齐；ja 随英改同步，上游无 ja 由 agent 自写+人审 | 既定规则 |
| 8 | 内部字段 accessKey/secretKey/token/innerCall 禁入文档（黑名单硬校验） | 10-21 拍板 |
| 9 | 上游 required 数组/约束缺失逐接口与研发确认后才落地，不默认采纳也不默认拒绝 | 10-21 拍板 |
| 10 | OAS 3.1→3.0.x 降级在 diff 工具内确定化并 golden 测试锁定，agent 不做版本判断 | 本设计 §4 |
| 11 | cloud spec 未覆盖 ≠ 下线：upstream-removed 一律走 ledger 决策 + 研发确认 + 退役清单（nginx 301），不自动删 | 10-21 拍板（abort/commit 先例） |

## 1. 资产映射

| 现有资产 | 在本设计中的角色 |
|---|---|
| `tmp/control-plane-diff5.js`（10-21 清单生成器） | diff 工具内核，工程化进 docs-tooling |
| 上游 `openapi-zdoc-compare.sh`（zilliz-cloud 仓内） | 交叉对照参考，不构成依赖 |
| `fragmentCollection.js` loader + collection schema | 门禁与 canonical provenance 出口 |
| `fragment-migration.json` 状态机（legacy-shadow-required → shadow-equivalent → canonical） | P3 转正通道，零改动 |
| rest-derivation.json + REST_DERIVATION_FRAGMENT_DRIFT（write-provenance） | 发布期一致性闸（不动）；刷新 PR 经 sync 重生成通路落 dev |
| shared-docs `parseLock`/`planLock`/`GitMilvusDocsReader` | lock 语义蓝本；REST 版 reader 换 GitHub API contents@pin |
| shared-docs T3 watchdog / report-card 通道 | 漂移报告蓝本 |
| `product-doc-links-watchdog.yml` 私有仓访问（PRODUCT_DOC_LINKS_GITHUB_TOKEN contents:read + api.github.com） | token 与访问模式直接复用 |
| `.github/prompts/codex-*-agent*.md` 惯例 + `_translate-content-group.yml` 的 codex 调用形态 | agent 指令包与工作流调用形态蓝本 |
| titles.json / admonitions.json / positions.json 等 meta | 保留；新增 op 的 zh 标题映射纳入刷新门禁 |
| `restCompletenessReceipt` | P3 扩展 ledger 会计字段（开放决策 D2） |

## 2. 归属与契约

### 2.1 四层模型（shared-docs 三层模型的 REST 版）

| 层 | 位置 | 归属 | 写者 |
|---|---|---|---|
| 上游真值 | zilliz-cloud `vdc/global/cloud-control-api/openapi.yaml`；milvus-io/milvus httpserver 代码+proto | 上游仓 owned | 研发/社区 PR；zdoc 只读 pin |
| 采纳协调（新增） | `packages/docs-tooling/src/reference/rest/meta/upstream/`（`rest-upstream-lock.json`、`ledger.json`） | master-owned（tooling 语义） | 人 + agent，PR + 既有校验链 |
| 文档层 | `meta/openapi/*.json` + `meta/*`（现状） | master-owned | 人 PR（现状不变）+ agent 刷新 PR |
| 生成产物 | `generated/<site>/**`（现状） | dev-owned | 既有 fetch/build/sync（零改动） |

### 2.2 契约改动清单

- `devOwnedPaths` / `masterAuthoritativePaths`：**零改动**（新目录在 packages/ 下天然 master-owned）。
- `test:for-change` 矩阵：`meta/upstream/**`、`upstreamDiff/**`、两个新 workflow 的脚本全部登记；未映射 = 矩阵缺口同 PR 修复。
- `docs-tooling` CLI（cli.ts DocsToolingCommand）：新增 `rest-upstream-diff` / `rest-upstream-lock` 子命令；契约测试同步。
- 无新增 evidenceGroups（diff 证据 = PR 内容本身；watchdog 运行记录 = workflow artifact）。

## 3. 上游接入与 lock 契约

### 3.1 `rest-upstream-lock.json`

```json
{
  "schemaVersion": "1.0",
  "sources": [
    {
      "id": "zilliz-cloud-control-plane",
      "repository": "zilliztech/zilliz-cloud",
      "artifact": { "kind": "spec-file", "path": "vdc/global/cloud-control-api/openapi.yaml" },
      "pin": { "commit": "<40hex>", "contentSha256": "<64hex>" },
      "trackedRef": "master",
      "apiSurface": "control-plane",
      "upstreamOasVersion": "3.1.0",
      "lastVerifiedAt": "2026-11-02T03:00:00Z"
    },
    {
      "id": "milvus-data-plane",
      "repository": "milvus-io/milvus",
      "artifact": { "kind": "source-tree", "paths": ["internal/distributed/proxy/httpserver/"] },
      "pin": { "commit": "<40hex>" },
      "trackedRef": "master",
      "apiSurface": "data-plane"
    }
  ]
}
```

语义（对齐 shared-docs lock，差异声明见 §14）：
- `pin.commit` 为 40hex 且必须可达 trackedRef（GitHub API commit 校验，不可达 fail-closed）；
- `contentSha256` 仅 spec-file 源记录，作为 watchdog 零 diff 快速路径；
- **lock 不动 = 采纳不变**：watchdog 发现 HEAD 漂移只报告；采纳 = 刷新 PR 同时 bump pin + 落片段变更 + ledger 登记，单 PR 原子；
- 双通道（current/next）REST 不需要（无预发内容预览诉求）——单通道，登记为对 shared-docs 的刻意简化。

### 3.2 读取

- spec-file 源：GitHub API `contents@pin.commit`（token 复用 `PRODUCT_DOC_LINKS_GITHUB_TOKEN`，权限审计不便则新增 `REST_UPSTREAM_GITHUB_TOKEN` contents:read，见 D6）；下载后校验 contentSha256。
- source-tree 源：`actions/checkout` ref=pin.commit（公开仓免 token），路径级读取；提取器见 §6。

## 4. diff 工具（P0 核心）

新增 `packages/docs-tooling/src/reference/rest/upstreamDiff/`，CLI：`pnpm docs-tooling rest-upstream-diff --source <id> [--out <dir>]`。模块划分：

1. **读取与 pin 校验**（§3.2）。
2. **OAS 归一化**：3.1→3.0.x 确定性降级（`type` 数组、`examples` 语义、ref 形态），独立模块 + golden 测试锁定（决策 10）；对未知构造 fail-closed（不猜）。
3. **branch-aware 比对**（决策 1 的实现落点）：
   - 识别 scenario-branched 操作（request/response oneOf/anyOf 且 ≥2 object 分支）；
   - 分支内字段级 diff（新增/删除/约束/类型/描述重写），分支键 = `x-tab-label` 或分支序；
   - 上游 merged object 对分支 diff 时，字段仅归入语义匹配分支；无法归属者进 `unattributed` 候选区（→ ledger），**永不自动落分支**；
4. **操作级分类输出**：`upstream-added` / `fragment-only`（片段有而上游无；**只对与源同 apiSurface 的片段判定**，数据面片段缺席于控制面规格是预期而非漂移，匹配到的操作则跨全部片段比对）/ `upstream-modified`（字段级明细）/ `zdoc-only`（刻意文档设计或待研发确认；ledger 已分类则静默）/ `unattributed`；required 疑似 codegen 丢失条目单独标注（决策 9）；每条带上游 JSON path + 值证据。
5. **确定性**：同输入字节同输出；输出 = 机器可读 JSON + 人读 markdown 清单（10-21 清单同构），直接作为 PR 内容与 agent 输入。

milvus 源的 diff 输入不同（骨架 JSON 而非 spec，§6），比对与输出层（模块 3–5）共用。

## 5. Producer A：cloud 控制面刷新（P1）

watchdog 报告漂移后，人 dispatch `rest-upstream-refresh.yml --source zilliz-cloud-control-plane`：

1. pin 校验 + 拉上游@HEAD → diff → 变更包 artifact（JSON + md + fragment patch 候选）；
2. codex agent 在 staging 内产 change-set（§8.1），applier 确定性应用到片段树；
3. 门禁全绿：`loadFragmentCollection`（digest/冲突校验）→ `restCompletenessReceipt` → `pnpm test:for-change -- <改动路径>` union + `test:rest-publication-contract` + `test:workflow-policy` + `build:en`/`build:zh-CN` + `git diff --check`；
4. **titles.json 联动断言**：upstream-added 每个 op 必须新增 zh 标题映射（缺失 = 中文构建必炸，AGENTS.md 明文）；upstream-removed 必须删映射并触发退役清单（nginx 301 流程 + `fragment-migration.json` operationCount 更新，决策 11）；
5. 人审要点（PR 模板固化）：oneOf 分支结构零 diff、`x-*` 零意外 diff、内部字段黑名单、zh 仅 SKU 合理变化、ja 与 en 改动一一对应、required 标注组未确认不落；
6. 合并（含 lock bump）后既有机制自动接力：push sync → regenerate-sync-candidate 重生成 REST 产物 → 落 dev → 镜像发布（#787 机制，零改动）。

## 6. Producer B：milvus 数据面（P2/P3）

1. **骨架提取器**：Go 单文件（`go/ast` 解析 handler_v2.go 路由表 + `request_v2.go` struct 的 json/binding 标签），源码 vendored 在 `upstreamDiff/milvus/extractor.go`；运行 = `actions/setup-go`（pinned 版本）+ `go run`，输入 pinned checkout 的 httpserver 目录，输出 skeleton JSON（path/method/params/required/requestSchema/handler 名）。选型理由：Node 侧无 Go AST、反向解析不可靠；Go 仅在 dispatch workflow 安装，不进常规构建链（开放决策 D3）。
2. **reconcile 规则**（diff 模块 3–5 复用）：代码赢结构（新 op/新 param/类型变化），存量片段赢 prose/`x-*`/oneOf 场景设计——骨架是合并形态，场景分支化在文档层完成（存量基线 + agent 提案 + 人审，决策 1）。
3. **生命周期属性**：diff 对 data-plane 变更计算 `x-added-at`/`x-last-modified`/`x-deprecated-since` 建议（按 CUSTOM_ATTRIBUTES §1.10 校验序与当前 managed track），人审确认后落片段。
4. **可选增强（P4）**：protoc-gen-jsonschema 于 milvus-proto@pin 产辅助 schema 组件；本地 milvus 实例流量录制（har-to-openapi）交叉验证响应 schema。

## 7. 触发矩阵与 ledger 分类门（对齐 shared-docs T1–T4）

| # | 触发 | 动作 |
|---|---|---|
| T1 | 每日定时 `rest-upstream-drift-watchdog.yml`（+workflow_dispatch） | 对每个 source：HEAD sha == pin → 零成本退出；≠ pin → 拉@HEAD 跑 diff（只读）；有实质漂移 → 报告（report-card/issue，含分类清单摘要）；无漂移 → 顺带刷 lastVerifiedAt |
| T2 | 人 dispatch refresh（watchdog 报告后） | §5/§6 流程，产出刷新 PR |
| T3 | 人直接 PR 改片段（文档层修改） | 现状流程不变，零新机制 |
| T4 | 上游新增 op 未分类 | ledger 无登记 → receipt 会计失败（P3 起，D2）：upstream@pin 有而片段无的 op 必须有 ledger 条目 |

ledger（`meta/upstream/ledger.json`，append-only）：`{opKey, source, firstSeenPin, firstSeenAt, classification: adopted|rejected|deferred|external, reason, owner, decidedAt, fragment?}`。`external` 覆盖"上游不覆盖面"（10-21 abort/commit 先例；milvus 源则相反——cloud-only op 对 milvus 源为 external）。**bootstrap**：P1 首跑对当前 pin 全量 diff 一次，把存量差异（多为 adopted/external）预登记，之后纯增量。

## 8. agent（codex）集成与保险机制

隔离模型对齐翻译管线先例（prepare 批次目录 → agent 只在批次目录内工作 → 确定性验证 → 末尾单点落地），并针对 REST 特性做一处关键改动：**agent 不重写整文件，只产 schema 化 change-set**——翻译对象是自包含新文件，可以整篇重写；REST 片段是手维护 JSON，未触碰的 90% 必须字节稳定，整篇重写必然引入格式噪声。

### 8.1 隔离：staging 定界

1. **prepare（确定性步骤）**：为本次 run 建 staging 目录，只放四类内容——① 目标片段副本（仅 diff 触及的片段文件）；② diff JSON（唯一结构权威）；③ 规则集与指令包（`codex-rest-refresh-agent.md`，对齐 `.github/prompts/` 惯例）；④ titles/ledger/lock 当前副本。agent 工作目录钉在 staging，真实仓 checkout 不进 agent 上下文。
2. **agent 产物 = change-set**（schema 化 JSON patch 提案），不直接改片段文件。每条：`{diffEntryId, targetFragment, opPath, kind: prose|constraint|title|ledgerDraft|lifecycle, value, evidence}`。分支归属提案是 `ledgerDraft` 条目（人审拍板后才由人/后续 run 落片段），不是片段编辑——决策 1 的 agent 侧落点。
3. **apply（确定性步骤，非 agent）**：applier 脚本把 change-set 手术式应用到真实片段树。
4. **PR 由确定性步骤创建**：agent 不持有 git/gh 写权限（D1 随之收敛：v1 也允许人工本地跑同一 prepare→agent→apply 链后手动开 PR，工具面相同）。

### 8.2 产物契约与越权检测（fail-closed）

- change-set schema 校验失败 → **整体拒收**，run 终止、无 PR；重试 = 重新 dispatch，成本 = 一次 codex run。
- **对账检测（"无来源变更"）**：每条 change-set 条目必须**绑定**到它引用的 diff 条目——kind 与叶子对应（prose 只能引用 summary/description 漂移并写该叶子；constraint 只能引用 constraint/required/deprecated 漂移并写被报告的键）、位置对应（被报告的参数/字段、分支内、同一片段）、**约束值必须等于 diff 记录的上游值**；偏离上游值、采纳带 `requiresConfirmation` 的条目（上游缺 required 数组、required 放宽）或写生命周期属性，都必须 `override: true` + `overrideReason`，并全部列入 applied.json 供人审。多一条、少一条、错位一条、改值一条都拒收——这是"agent 永不发明结构/内容"（决策 3）的机器化。
- applier 内置断言：内部字段黑名单（决策 8）、`x-*` 属性集合不变、**oneOf/anyOf 分支数与键集不变**（决策 1 的机器化）。

### 8.3 formatter round-trip 不变量（REST 特有）

applier 对片段"加载 → 修改子树 → 再序列化"必须满足**未触碰区域字节不变**。P0 落地：全 38 片段 round-trip 测试；若现状序列化不规整，先落一次性规范化 PR（人审），applier 序列化器以该规范为准，此后不变量恒真。

### 8.4 入库前验证闸（顺序固定，逐级 fail-closed）

| 级 | 闸 | 性质 |
|---|---|---|
| 1 | change-set schema 校验 | 确定性 |
| 2 | applier + 对账检测 + 黑名单/`x-*`/oneOf 结构断言 | 确定性 |
| 3 | 片段校验器（digest/冲突、`x-i18n` 形状按 JSON path 拒收——既有校验器） | 确定性 |
| 4 | `restCompletenessReceipt` | 确定性 |
| 5 | titles.json 联动断言（新增 op 必有 zh 标题、删除 op 映射清除） | 确定性 |
| 6 | 生命周期校验序（`x-added-at` ≤ `x-last-modified` 等，CUSTOM_ATTRIBUTES §1.10） | 确定性 |
| 7 | `test:for-change` union + `test:rest-publication-contract` + `test:workflow-policy` | 确定性 |
| 8 | `build:en`/`build:zh-CN`（临时目录产物） | 确定性 |
| 9 | `git diff --check` + 运行报告生成 | 确定性 |

任何一级失败 run 终止并保留证据 artifact；全绿才由确定性步骤开 PR。PR 侧再跑同 union 作为 merge 门（注意 **bot-PR 幻影 CI 教训**：用 PAT/App token 开 PR 使检查真实触发，或 PR 内 self-dispatch——D5）。

### 8.5 证据与可重放

run artifact 固定包含：staging 快照、diff JSON、change-set、applier 日志、九级门禁逐级输出。同输入重跑字节一致；审计 = 三件套互指（diff JSON ↔ change-set ↔ 片段 diff），每条变更可追到上游证据与批准人。

### 8.6 隔离实证与护栏

- **隔离必须可测**（#746 P1 教训：翻译管线曾出现"声称结构性隔离但 validator 把仓库路径嵌进 prompt"的落差）：P0 加 harness 断言——staging 之外的仓库绝对路径不出现在 agent 上下文、指令包与 prompt 中（指令一律用 staging 相对路径）。
- 一次 PR 一个 source；PR 标签 `rest-upstream-refresh`；watchdog 对自开 PR 不再告警（label 过滤）；凭据走既有 agentic provider 内部网关（与翻译 agent 同暴露面，上游内容不外发第三方）。

## 9. 测试与证据

- hermetic 套件 `pnpm test:rest-upstream`：lock/ledger schema 解析与 fail-closed（pin 不可达、sha 不符、非法分类）；3.1→3.0 降级 golden；**branch-aware diff fixture（import create 四分支 vs 上游 merged 对象——决策 1 的回归锁）**；change-set schema 与对账检测（合法/越权/缺条三向 fixture）；**全 38 片段 formatter round-trip 测试（§8.3）**；隔离 harness（staging 外仓库路径不入 prompt，§8.6）；分类输出 snapshot；确定性（同输入两次运行字节一致）。
- 真实验收（P1 硬指标）：用当前上游 master pin 重放 10-21 清单——diff 输出与人工清单（16 片段 79 操作）的分类一致率报告。
- 矩阵登记：全部新路径进 `test:for-change`；同 PR 更新 replay 契约测试与 README operator 段落。

## 10. 工作流与 secret 清单

| 对象 | 动作 |
|---|---|
| `.github/workflows/rest-upstream-drift-watchdog.yml` | 新增（scheduled 每日 + dispatch；只读，不进 `docs-production-dev` 队列、无发布路径） |
| `.github/workflows/rest-upstream-refresh.yml` | 新增（dispatch；checkout pin → diff → codex → PR） |
| `REST_UPSTREAM_GITHUB_TOKEN` / 复用 `PRODUCT_DOC_LINKS_GITHUB_TOKEN` | contents:read on zilliztech/zilliz-cloud（D6） |
| fetch-docs / site-validation / recover-translation / sync 系 | **零改动** |

## 11. 排期与依赖

| 阶段 | 内容 | 依赖 |
|---|---|---|
| P0 | lock/ledger schema + diff 工具工程化（归一化 + branch-aware）+ 规则集机器可读化 + hermetic 套件 | 无 |
| P1 | watchdog + refresh workflow + ledger bootstrap + cloud 首次真实刷新演练（验收 = 10-21 重放对齐 + 一次真实漂移采纳） | P0 |
| P2 | milvus 骨架提取器 + reconcile 试点演练（单版本/单片段族） | P0 |
| P3 | milvus 全量采纳 + lifecycle 计算 + receipt ledger 会计（D2）+ 首个 producer-backed canonical collection 转正 | P2 |
| P4 | proto 辅助组件 / 流量交叉验证 / ledger 通用层收编评估（等 shared-docs T-1~T4 落地后） | P3 |

## 12. 风险

1. **agent 幻觉/越权**：staging 定界 + change-set 契约 + 对账检测 + 九级闸 + PR 人审五层兜底（§8）；agent 无 git 写权限，结构越权由对账检测拒收。
2. **上游 schema 大版本/结构跳变**：归一化对未知构造 fail-closed，watchdog 报告升级人工，不静默跳过。
3. **私有仓内容暴露面**：上游内容只进私有仓 PR 与 workflow 日志；agent 走既有内部网关（与翻译 agent 同面），不外发第三方。
4. **required/约束缺失争议**（决策 9）：refresh PR 内按"疑似 codegen 丢失"标注分组，未与研发确认不落。
5. **titles.json 漏配**：门禁断言（§5 第 4 步）挡在构建前。
6. **lock 双轨技术债**：接受（调研 §4.4），P4 评估收编进 shared-docs 通用层。
7. **watchdog API 配额**：每日 2 source × ≤3 calls，可忽略。
8. **cloud spec 覆盖 ≠ 下线**（决策 11）：upstream-removed 全走 ledger + 研发确认 + 退役清单（301），不自动删。

## 13. 验收清单

- [ ] P0 合并：schema + diff + hermetic 全绿，矩阵登记完整
- [ ] 10-21 重放对齐报告（P1 验收硬指标）
- [ ] watchdog 首跑：pin 一致零成本路径 + 一次人为漂移的报告路径各验一次
- [ ] refresh 首个真实 PR：门禁全绿 + 人审合并 + lock bump 原子 + sync 链路落 dev + 双站 build 绿
- [ ] titles/退役联动演练各一次（新增 op + 删除 op）
- [x] milvus 试点 reconcile 演练（P2）— pin 6d833a67 全量演练，证据 `.claude/specs/2026-10-29-rest-upstream-milvus-extractor-p2.md` + `tmp/rest-upstream-p2-milvus/`
- [x] receipt ledger 会计上线（P3，D2 已关闭；证据 `.claude/specs/2026-10-29-rest-upstream-p3-lifecycle-accounting-migration.md`）
- [ ] operator 文档落 README（watchdog/refresh 的运行说明与报告解读）

## 14. 开放决策与对 shared-docs 的差异声明

| # | 事项 | 推荐 |
|---|---|---|
| D1 | refresh PR 创建方式 | **确定性步骤开 draft PR**（agent 无 git 写权限，§8.1 第 4 条）；v1 允许人工本地跑同一 prepare→agent→apply 链后手动开 PR |
| D2 | receipt ledger 会计上线时点 | **已关闭（v7）**：随 P3 上线（receipt schemaVersion 2 内嵌 `upstreamAccounting`，`rest-upstream-accounting` 严格闸）；canonical 转正时点独立，见 `rest-upstream-migration --canonical-ready` |
| D3 | milvus 提取器运行体 | setup-go pinned + `go run`（理由 §6.1） |
| D4 | watchdog 报告通道 | report-card（对齐既有 6 个 watchdog 模式） |
| D5 | refresh PR 的 token 策略 | PAT/App token 开 PR（规避 bot-PR 幻影 CI）；无 PAT 则 self-dispatch 校验 |
| D6 | token 复用 vs 新 secret | 复用 PRODUCT_DOC_LINKS_GITHUB_TOKEN（同权限面） |

**对 shared-docs 的刻意差异**（对齐其 §7 声明风格）：单通道 lock（无 current/next）；无页级激活/active.json（片段→页面确定性生成）；zh 不走翻译 lane（titles.json + x-i18n，SKU 语义独立）；reader 换 GitHub API（无祖先校验，代以 pin 可达性 + contentSha256）；ledger 粒度 = operation 而非 page/block；无组合 stage（消费链 = 既有 refGen，零改动）。

## 15. 实施状态与验收证据（2026-10-28）

| 阶段 | 状态 | 证据 |
|---|---|---|
| P0（lock/ledger/change-set 契约 + diff 工具 + applier + hermetic 套件 + 矩阵登记） | 已实现 | PR #906 前 13 提交（`ec29f1de7`→`27b44c0b7`），36 测试；code-reviewer 三 P1 已修并复核 |
| P1 workflows | 已实现 | `.github/workflows/rest-upstream-drift-watchdog.yml`（每日 04:17 + dispatch，只读）、`.github/workflows/rest-upstream-refresh.yml`（dispatch；prepare→codex→apply→门禁→PAT 开 PR）；二者过 `test:workflow-policy` 118 项与 actionlint |
| P1 agent 面 | 已实现 | `rest-upstream-prepare`（staging + 隔离断言 + 无漂移 fail-closed）、`scripts/rest-upstream/rest-refresh-agent.js`（单 turn codex，digest 绑定校验）、`.github/prompts/codex-rest-refresh-agent.md` 指令包 |
| P1 ledger bootstrap | 已落地 | 54 条入 `meta/upstream/ledger.json`（51 external 存量 + 3 deferred）；CLI 子命令 `rest-upstream-ledger-bootstrap`（generate/merge 双模式） |
| 10-21 重放对齐（P1 硬指标） | **96.2% 严格一致**（76/79；三偏差=范围排除×2+清单过时×1，零工具误差）；deprecated 5/5、unattributed 3/3、新增参数 2/2、required 慎采 13 操作机器化 | [重放对齐报告](2026-10-28-rest-upstream-replay-10-21-alignment.md)；证据根 `tmp/rest-upstream-replay/` |
| P1 首次真实刷新演练 | 待办（需 operator 配置 secrets/vars 后 dispatch） | gate 全绿 + 人审合并 + lock bump 原子 + sync 落 dev 尚未实证 |

**待 operator 配置**：`REST_UPSTREAM_GITHUB_TOKEN`（可回退 `PRODUCT_DOC_LINKS_GITHUB_TOKEN`）、`REST_UPSTREAM_REFRESH_PAT`、`AGENTIC_PROVIDER_API_KEY`、vars `REST_UPSTREAM_AGENT_MODEL`/`REST_UPSTREAM_AGENT_BASE_URL`（可回退 `AGENTIC_TRANSLATION_MODEL`/`AGENTIC_BASE_URL`）。

---


---

## 变更记录

- v7（2026-10-29，P3 落地后修订）：§6.3 lifecycle 建议定稿——diff 以 `--lifecycle-track` 派生 `x-added-at`/`x-last-modified`/`x-deprecated-since` 建议并绑定进 change-set 契约（applier 对派生叶子做值绑定，偏离须 override；仅契约性漂移产建议，prose/unattributed 永不产；片段侧时间线先校验，建议永不回拨且不得越过 x-deprecated-since）；§7 T4 定稿——`rest-upstream-accounting` 严格闸（任何分类都算"已决策"，缺条目即 fail-closed 列出 op 清单）+ receipt schemaVersion 2 内嵌 `upstreamAccounting`（unaccounted>0 即不完整）；**D2 关闭**（receipt ledger 会计随 P3 上线）；ledger 草稿定稿为"刷新提交内以 deferred 原子落地、人审在 PR 里改分类"（解开 T4 与单 PR 原子性的互锁：否则每个发现新 op 的 refresh 都会被闸挡住、被迫拆第二个 ledger PR）；fragment-migration 状态机门禁定稿（`rest-upstream-migration`：一致性常开——契约校验/文件存在/operationCount 真值；`--canonical-ready` 需候选 collection 按 service id 配对（canonical collection 片段名是 `*.openapi.json`，legacy 树是 `NN-name.json`）+ 字节一致 + T4 会计完备）；refresh workflow 增 milvus source-tree lane（GitHub contents 拉取→setup-go 1.27→vendored 提取器）与 `lifecycle_track` dispatch 输入，lock bump 对 source-tree 源只写 commit（按 §3.1 锁契约）。证据：`.claude/specs/2026-10-29-rest-upstream-p3-lifecycle-accounting-migration.md`。

- v6（2026-10-29，P2 实施后）：§6 落地于 PR #906，验收证据 `.claude/specs/2026-10-29-rest-upstream-milvus-extractor-p2.md`。实施要点与 §6.1 的差异：①骨架=最小 JSON Schema 词表（{type}/{type,items}/{type,properties,required}/$ref/{}）——首次试点含 additionalProperties/format 时 346 条 upstream-modified 中 324 条是 description 噪音，最小词表把同一 diff 收敛到 22 条实质条目；②structure-only 模式下沉进 diff（`source.artifact.kind === 'source-tree'` 跳过 summary/description/parameter/response 比对，§6.2"存量片段赢 prose"的机器表达）；③新增跨片段组件解析：片段 $ref 悬空时回退全片段合并组件视图（镜像发布装配语义），API 真值等价的同名变体容忍（x-tab-label 等文档属性差异是既有事实），真值冲突 fail-closed（REST_UPSTREAM_SHARED_SCHEMA_CONFLICT）；④watchdog 对 source-tree 源的 `pin-behind` 占位退役：漂移时下载非测试 .go 文件→go run 提取→同 diff 分类，workflow 补 actions/setup-go@v6（pinned 1.27）；⑤试点实证 pin 6d833a67：113 操作/84 组件精确对齐路由表，diff 信号分类齐全（11 upstream-added/24 added-field/9 unattributed/22 modified/48 zdoc-only），ledger bootstrap 提案 26 条待人审合并；⑥已知限制：source-tree pin 无内容摘要（P3 可选）、Go 注释 prose 不入骨架、UnmarshalJSON 覆写形状不提取（P4 流量录制候选）。
- v5（2026-10-29，P1 code-review 评审后修订）：修复评审 2 P0/3 P1/4 P2——①refresh workflow 的 stdin heredoc 混用 require 与顶层 await 在 Node 22 触发 ERR_AMBIGUOUS_MODULE_SYNTAX，改 async IIFE（本地同版本实测）；②REPOSITORY_ROOT 差一级致默认指令包 ENOENT 且隔离扫描锚错根，改六级并加 prepare 指令包存在性断言+无 `--instructions` 回归测试；③bootstrap `--date` 默认值改为 action 内 `||`（commander coercion 仅在旗标出现时调用）；④**lock pin bump 进 refresh 提交实现原子采纳**（§3.1/§5 兑现：land 步骤写 pin.commit+contentSha256+lastVerifiedAt）；⑤**ja-JP 降范围**：ja 文本在片段 x-i18n 内而 applier 冻结全部 x-* 叶子，change-set 无法表达——规则集 `ja-jp-follows-en` 改写为"en prose 变更在 evidence 记录需跟改的 ja 页，由 ja lane 跟进"，指令包规则 8/PR 清单同步（复核项改 ja 跟进而非 ja 同步）；⑥P2 加固：私有仓身份常量 PRIVATE_TOKEN_REPOSITORIES、spec_path 由 node 写 GITHUB_OUTPUT（修扩展名硬编码）、两个 workflow checkout persist-credentials:false、base_ref 白名单 master、titles 门禁注释改指 build:zh-CN（refGen）。
- v4（2026-10-28，P1 实施后）：P0+P1 均在 PR #906（`feat/rest-upstream-pipeline`）实现并登记验收证据（§15）。D5/D6 落定：refresh PR 由 `REST_UPSTREAM_REFRESH_PAT` 打开（bot-PR 幻影 CI 教训），上游读取 token = `REST_UPSTREAM_GITHUB_TOKEN` 回退 `PRODUCT_DOC_LINKS_GITHUB_TOKEN`（同权限面，D6 推荐采纳）。一处对 §7 T1 的修订：watchdog 对"无漂移"**不**回写 lock 的 `lastVerifiedAt`（master 只经评审 PR 写入；该字段随 refresh PR 的 pin bump 一并推进），watchdog 报告工件内记录本次核验日期。
- v3（2026-10-28，code-reviewer 评审后修订）：§8.2 对账从"引用 id 存在"升级为"绑定被引用条目"（kind/叶子/位置/值 + override 日志）；diff 条目 id 加入 fragment 与 response status 分量；required 放宽一律 `requiresConfirmation: required-relaxation`（决策 9 的成员级覆盖）；登记 P0 已知限制（嵌套属性内分支不比对、描述空白折叠、上游自身分支化时 required 不比对）。
- v2（2026-10-28，评审问答后修订）：§8 重写为"staging 定界 + change-set 契约 + 确定性 applier + 九级入库前验证闸"（对齐翻译管线隔离先例；agent 不重写整文件、不持 git 写权限）；新增 §8.3 formatter round-trip 不变量与 §8.6 隔离实证 harness（#746 P1 教训）；D1 收敛为确定性步骤开 PR；§5/§9/§12 联动更新。
- v1（2026-10-28）：初稿，基于同日调研报告与两条用户拍板（oneOf 场景分支全链路保留；shared-docs 机制层复用）。

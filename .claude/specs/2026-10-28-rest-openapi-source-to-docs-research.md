# 调研：REST 接口源码 → OpenAPI spec → zdoc 参考文档的端到端自动化

日期：2026-10-28
状态：调研报告（未实施，待评审）
范围：milvus（Go/gin，开源）与 zilliz-cloud（私有 monorepo）REST 接口的 spec 生产与文档化；评估开源工具、codex 类 coding agent 集成方式。只调研，不改发布架构。

## 0. 结论摘要

1. **zilliz-cloud 侧不需要"代码转 spec"工具**。上游 `vdc/global/cloud-control-api/openapi.yaml` 已经是权威 OpenAPI **3.1.0** 规格（约 650KB），带 Spectral + Redocly 的 PR CI 门禁（`openapi-lint.sh`）和 snapshot keeper，且**已携带 zdoc 的文档扩展**（`x-include-target`、`x-i18n.zh-CN`）。缺的不是生成，而是"上游 spec → zdoc 片段"的自动化对齐——2026-10-21 控制面刷新清单就是这件事的人工版（人肉 diff + 手改 16 片段 79 操作），自动化条件已完全成熟。
2. **milvus 侧上游完全没有 spec**（代码、docs 仓库、issue/PR 全部核实为零），且 handler 无任何 swagger 注解。可行的自动提取路径有三条，都不完美：
   - **ehabterra/apispec**（OAS 3.1，静态分析 gin 路由→handler 调用图，零注解）是唯一在维护的免注解工具，但仅 96★，产出自述为"需人工复核的草稿"；
   - **proto 直接转 OpenAPI 不可行**（已核实关键不匹配：REST v2 线格式是 `request_v2.go` 里的手写 Go struct，不是 proto message；proto 只能贡献辅助 schema 组件）；
   - **LLM/coding agent 直读代码生成 spec 无成熟开源**，但学术论文（OOPS，F1>98%）与 spec-forge 的架构验证了正确分工：**确定性工具产结构骨架，agent 只补自然语言（summary/description/示例），永不发明结构**。
3. **spec → 文档这半程本仓库已经解决**，不需要引入 redocly / docusaurus-plugin-openapi-docs 等外部生成器：38 个片段 + `x-*` 扩展契约 → `fetch-apifox-docs`（MDX+侧栏）/ `generate-integrated-spec`（三语集成 spec + S3）。更关键的是 canonical 契约 `contracts/rest-fragment-collection.schema.json` **已经预留了 producer 位**（`source{repository,revision}` / `generator{...}` / `review{approvalDigest}`），现有片段全部处于 `legacy-shadow-required` 迁移态——本调研的推荐架构就是把两个"真 producer"接上这个早就设计好的插槽。
4. **推荐端到端形态**：两个确定性 producer（cloud-reconciler / milvus-extractor）+ codex 只做 prose 与格式映射 + 机器校验门 + 人工 review（approvalDigest），产出 manifest-backed collection，走既有发布管线。分三阶段：cloud 控制面自动化先行（ROI 最高）、milvus 提取器次之、最后 watchdog 化成定时漂移侦测。

## 1. 现状盘点（本地实证）

### 1.1 zdoc 的 spec→docs 管线（已存在，勿重建）

- 输入：`packages/docs-tooling/src/reference/rest/meta/openapi/*.json`，38 个 OpenAPI 3.0.x 片段（data-plane 14 + control-plane 24）。
- 片段内嵌文档语义（`CUSTOM_ATTRIBUTES.md` 为权威契约）：`x-i18n`（zh-CN/ja-JP 三语）、`x-include-target`（zilliz/milvus）、`x-include-langs`、`x-beta`、`x-admonition`、`x-tab-label`、`x-base-urls`/`x-base-url-target`、生命周期 `x-added-at`/`x-last-modified`/`x-deprecated-since`（milvus track 发布）、描述内 `<include>`/`<exclude>` 条件标签。
- meta 文件：`titles.json`（223 条 zh 页标题→slug，缺失即中文构建失败）、`positions.json`、`admonitions.json`、`descriptions.json`、`plane-config.json`、`fileNameRuleSet.json`（milvus 目标 slug 规则）、`fragment-migration.json`（迁移状态账本）。
- 消费链：`fetch-apifox-docs`（片段→MDX，legacy 输入仍接受）与 `generate-integrated-spec`（manifest-backed collection → 三语集成 spec + S3，**要求 producer-backed provenance，明确不接受 meta/openapi 现有片段**）。

### 1.2 canonical 契约已预留 producer 位（本调研的落点）

`contracts/rest-fragment-collection.schema.json` 要求：

```text
source:   {repository, revision(40hex)}      ← 上游真值仓库 + pinned SHA
generator:{repository, revision, configDigest} ← 生成工具 + 配置摘要
review:   {manifestDigest, approvalDigest}   ← 人审批准摘要
services: [{id, fragment, sha256, operationCount}]
```

现有 38 片段的 `migrationState` 全部是 `legacy-shadow-required`：等的就是一个真正的 producer。**本调研的架构结论 = 填补这个空位，而不是新发明管线。**

### 1.3 zilliz-cloud：上游规格已是治理过的真值

- `vdc/global/cloud-control-api/` 是完整 Maven 模块：`openapi.yaml`（**3.1.0**，15 tags/77+ ops）+ `openapi-lint.sh`（Spectral + Redocly 2.53.0 PR 门禁 + master snapshot keeper 双模式）+ `openapi_schema_contract.py` + `openapi-required-exceptions.json` + **`openapi-zdoc-compare.sh`**（上游已自带与 zdoc 的比对脚本）。
- pom 无 springdoc/swagger 依赖 → spec 为 static-first 维护（README 流程：飞书 wiki 起草 → 研发 → Apifox 登记 → 通知文档组），`x-i18n.zh-CN` 等扩展直接沉淀在规格里。
- 10-21 刷新清单沉淀了对齐规则集：API 真值（路径/参数/字段/约束/弃用）以规格为准；标签结构、oneOf 文档化设计（11 处）、`x-*`、zh 按 SKU 定义审核、ja 随英自写以 zdoc 为准；`accessKey/secretKey/token/innerCall` 内部字段禁入文档。**这套规则就是未来 agent 的指令集与校验器规格。**
- 规格侧 `required` 数组/约束缺失与 springdoc 类 codegen 缺口的典型特征吻合（见 §3.3），清单中"疑似 codegen 丢失需与研发确认"的条目应按接口逐个跟研发确认，不能默认采纳。

### 1.4 milvus：代码形态（决定提取方案）

浅克隆实测（master @ 2026-10-28，`internal/distributed/proxy/httpserver` + `pkg/proto`）：

- **v2 路由是规整的路由表**：`handler_v2.go` 113 处 `router.POST(CollectionCategory+ListAction, timeoutMiddleware(wrapperPost(func() any { return &DatabaseReq{} }, wrapperTraceLog(h.listCollections))))`——路径=常量拼接，请求体=结构体指针直接挂在注册处。
- 请求 struct 集中在 `request_v2.go`：手写 `json`（camelCase）+ `binding:"required"` 标签（114 处校验标签）。v1 另有 47+10 条路由。
- 响应侧弱类型：handler 内联拼 `gin.H{...}`（如 `HTTPReturnData: gin.H{"insertCount":…}`），包 `commonpb.Status` 信封——**响应 schema 无法从 Go 类型机械导出**，是最需要 agent/存量片段/流量验证补齐的部分。
- proto 在独立仓 `milvus-proto`（~180 RPC、200+ message，无 `google.api.http`、无 validate 规则、注释不全）。
- 上游（milvus、milvus-docs、issue/PR、社区）**零 spec 存在**；milvus.io 官方 REST 参考是手写 Markdown。

## 2. 方案空间总览

```text
                    ┌─[A] zilliz-cloud 控制面──────────────┐
上游真值             │ openapi.yaml 3.1.0 @ pinned SHA     │
                    └──────────────┬──────────────────────┘
                                   │ 确定性 diff（扩展现有 control-plane-diff 工具）
milvus 路由表+struct ─[B] 机械骨架提取─┐        │
(proto=辅助组件)                     ├─→ 分类变更清单 → codex 按规则集改片段
流量录制(可选,响应形状) ─[C] 交叉验证──┘        │
                                   ▼
                    manifest-backed fragment collection
                    (source/generator/review provenance)
                                   │ 机器校验门(片段加载器/completeness/契约测试)
                                   ▼ 人审 approvalDigest
                    fetch-apifox-docs / generate-integrated-spec（既有）
                                   ▼
                    MDX + 侧栏 + 三语集成 spec（既有）
```

核心原则（四条红线）：
1. **结构与 API 真值只来自确定性提取/上游规格，agent 永不发明**（spec-forge 的 "never invents types or changes structure" 原则）；
2. **agent 只改 prose**（en summary/description、示例、zh/ja 翻译补齐）且必须通过机器校验器后才进人审；
3. **每次刷新均以 pinned SHA 为源**，provenance 链写入 collection manifest，可复现、可审计；
4. **oneOf/anyOf 场景分支是文档层资产（用户已拍板保留）**：分支=场景、同名参数按场景重复罗列，是刻意的文档设计——任何工具或 agent 不得合并、归一化分支，也不得以"上游合并对象"覆盖分支结构（详见 §4.0）。

## 3. 工具调研明细（全部经 web 核实，2026-10-28）

### 3.1 Go 代码 → OpenAPI

| 工具 | OAS | 方式 | 对 milvus 的适用性 |
|---|---|---|---|
| **ehabterra/apispec** (96★, 活跃) | 3.1 | 静态分析 `go/packages` 调用图：路由注册→handler，提取 `c.ShouldBindJSON`/`c.JSON`，读 `binding` 标签与注释 | **唯一可用的免注解起点**；产出自述为草稿（错误契约/可选性偏保守），milvus 的 `gin.H` 响应与 merr 错误映射会落在"欠陈述"区 |
| antst/go-apispec (39★) | 3.1 | 上者 fork，+跨函数状态码解析/oneOf 合并 | 更聪明但更年轻，无 release，可作备选 |
| swaggo/swag v2 (13k★) | 2.0 稳定 / 3.0 RC / 3.1 实验性 | 注解式 | 需给 113 个 handler 逐个加注解=上游 PR，**不现实**；3.x 未出 RC |
| go-swagger (10k★) | 2.0 永久 | 注解式 | 明确不演进 3.x，死路 |
| huma / fuego | 3.1 | 框架式（重写全部路由） | 非改造路径，仅划界 |
| gin 运行时内省 | — | `Routes()` 仅返回 handler 名 | **不存在**能把 gin 运行时转成带 schema 的 spec 的成熟工具（已核实） |

### 3.2 proto → OpenAPI（辅助组件源，非主路径）

- **protoc-gen-openapiv2**（grpc-gateway，稳定）：`generate_unbound_methods=true` 可对零注解 proto 产出全量 `definitions`，但为 Swagger 2.0、gRPC 形状、无约束（不读 PGV/protovalidate）。**可用作 message 级 schema 原料**，需 2.0→3.x 转换。
- **gnostic protoc-gen-openapi**：只认 `google.api.http`，milvus.proto 零注解 → 空文档，不可用；其 **protoc-gen-jsonschema** 可独立产出 message JSON Schema，是更干净的原料源。
- **关键不匹配（已核实）**：REST v2 请求体是手写 Go struct（camelCase/`binding`），响应是 `gin.H` 拼 proto 字段子集——**proto 不能描述 REST v2 线格式**，只能贡献深层字段组件（如 `schemapb` 的 collection schema 字段）。10-21 清单里"规格有而分支无"的判断逻辑同理适用于 proto 原料：只能作参考，不能整块采纳。

### 3.3 Java → OpenAPI（背景：解释上游规格的缺口）

springdoc-openapi（运行时 dump `/v3/api-docs`）与 swagger-maven-plugin（JAX-RS 限定）是 checked-in spec 的两种常见来源；无 bean-validation 注解的 DTO 产出的 spec **天然缺 `required` 数组与 minLength/maxLength**（springdoc #166/#459、openapi-generator #4579 佐证）。Redocly 甚至有专门规则 `required-string-property-missing-min-length` 治理这种缺口。→ 上游控制面规格的"疑似丢失"条目应视为生成器行为的可能信号，逐接口与研发确认，这与 10-21 清单的处置一致。

### 3.4 LLM / coding agent 生成 spec

- **无成熟开源**。现状 = 两篇论文（OOPS 2026-01，LLM agent 工作流，F1>98%；IBM OASBuilder 2025-07，从文档页而非代码）+ 一个 1★ 个人 CLI（spencercjh/spec-forge）+ 若干 prompt pack。
- **spec-forge 的架构即正确答案**：确定性解析产结构 → LLM 仅做描述 enrich → 校验 → 发布；README 明言 LLM "never invents types or changes structure"。
- 结论：不自建"LLM 直出 spec"工具；用 codex/claude 在确定骨架之上做 prose 与片段格式映射，配机器校验门。

### 3.5 流量录制 → spec（响应形状的交叉验证）

- **mitmproxy2swagger**（9.7k★，OAS 3.0，两遍法、可安全合并不覆盖人工描述）；
- **jonluca/har-to-openapi**（OAS 3.0/3.1 可选、schema 推断、敏感值脱敏、Overlay 支持）；
- Specmatic Proxy Mode（重，需代理）。postman-to-openapi 已 archived。
- 定位：对本地起一个 milvus 实例录制全接口流量，**验证机械提取的响应 schema**（响应是最弱环节），非主路径。

### 3.6 spec → docs 生成器（对比后结论：保留自研）

| 工具 | OAS 3.1 | 产出 | 状态 | 结论 |
|---|---|---|---|---|
| docusaurus-plugin-openapi-docs (1.1k★) | 部分支持 | **每操作 MDX** + 侧栏，模板/回调可扩展 | 活跃 | 最接近自研管线的参考架构，可借鉴模板分层；引入即放弃 x-i18n/zh 生成契约与 ja 通路，**不引入** |
| widdershins (1.6k★) | 3.x | Slate 风 Markdown，doT 模板 | 上游停更(fork 继续) | 模板模型可借鉴 |
| Redoc/Redocly | 3.0-3.2 | 单页 HTML 运行时 | 活跃 | 形态不符；其 lint 规则可借用于片段校验 |
| Slate / Stoplight Elements | — | 归档/运行时组件 | — | 不适用 |

自研管线独有的能力（外部均无）：`x-include-target` 双目标、zh-CN SKU 定义刻意不一致、ja 内联三语、track 生命周期裁剪、集成 spec S3 发布与 provenance。

## 4. 推荐架构

### 4.0 场景分支（oneOf/anyOf）的处理约定（全链路保留）

**设计语义（用户拍板，全链路保留）**：zdoc 片段在 request/response 中使用 oneOf/anyOf，各子分支是**场景**（如 `POST /v2/vectordb/jobs/import/create` 的 Volume (Serving) / Volume (On-demand) / External storage (Serving) / External storage (On-demand) 四分支），同名参数**刻意在各分支重复出现**，每个分支只罗列该场景必要的参数。渲染层把 oneOf/anyOf 渲染为 tab：`x-tab-label` 命名场景，`x-target-request`/`x-target-response` 把示例绑定到对应 tab，`x-include-target` 还可按 zilliz/milvus 过滤分支——最终效果是用户选中场景后只看到该场景的参数集与对应示例。**分支结构与字段重复是实现这个体验的载体，不是冗余。**

由此对自动化管线的具体约定：

1. **上游/代码侧的"合并对象"不是结构真值**。上游 spec 的单一 object 等于全分支字段的并集；diff 工具必须 branch-aware：识别 zdoc 侧 scenario-branched 操作后，把上游字段**按语义归入分支**（依据 target 注解、参数语义，必要时问研发），绝不把"规格有而分支无"的字段落进分支（10-21 已拍板），也绝不合并分支。
2. **字段级刷新在分支内进行**。同一参数出现在 N 个分支即 N 份独立拷贝；约束/类型/描述刷新逐分支应用，且允许分支间刻意不同（10-21 清单中同一字段在不同分支变化不同，正是场景语义的体现）。
3. **新字段的分支归属是人工决策点**。机械 diff 只负责发现"上游新增字段 X"；X 属于哪个/哪些分支需要场景知识 → agent 提案（附理由）+ 人审拍板，不自动落。
4. **示例绑定随分支保持**。agent 刷新 example 时必须同步维护 `x-target-request`/`x-target-response`/`x-tab-label` 与分支的对应关系，不得打散。
5. **milvus extractor 同样适用**：机械骨架天然产出"合并形态"，场景分支化是**文档层创作步骤**——以存量片段的场景设计为基线，新接口由 agent 提案分支结构、人审拍板后落入片段；不把代码或上游的 merged object 直接当作片段结构。
6. **机器护栏**：diff/校验链新增一条硬规则——对标记为 scenario-branched 的操作禁用结构级改写（仅允许分支内字段级变更），防止 codex 或未来工具"好心合并"；该标记即片段现状 + `fragment-migration.json` 可扩展一个 `scenarioBranched: true` 注记。


### 4.1 Producer A：cloud-reconciler（控制面，先行）

1. **取源**：复用 `product-doc-links-watchdog.yml` 的私有仓访问模式（`PRODUCT_DOC_LINKS_GITHUB_TOKEN` contents:read + GitHub API），pin `openapi.yaml` 到 40hex SHA 写入 manifest。
2. **确定性 diff**：把 10-21 清单的生成器（`tmp/control-plane-diff5.js`）+ 上游 `openapi-zdoc-compare.sh` 整理成 `packages/docs-tooling` 内的可复用命令：上游 vs 片段逐操作分类（新增/删除/字段增删/约束类型变化/描述改写），输出机器可读 JSON + 人读清单（即变更清单的自动化）。
3. **codex 应用刷新**：以 §1.3 规则集为指令（oneOf 文档结构保留、`x-*` 保留、内部字段禁入、zh 按 SKU 审、ja 随英自写），只改字段级内容；3.1.0→3.0.x 片段降级映射在 diff 工具内确定化处理。
4. **门禁**：`loadFragmentCollection`（digest/冲突校验）→ completeness receipt → `test:rest-publication-contract` + `test:workflow-policy` + 双站 build → 人审后在 manifest 记 `review.approvalDigest`。

### 4.2 Producer B：milvus-extractor（数据面，第二阶段）

1. **骨架**：首选小而确定的专用提取器（milvus 路由表形态极其规整：常量路径 + `wrapperPost(&Req{}, handler)` + struct 标签，Go AST 可机械解析出 路径/方法/请求 schema/required）；ehabterra/apispec 作为对照/补充（它能追进 handler 体提取响应线索）。proto 组件用 protoc-gen-jsonschema 产原料。
2. **agent 映射+enrich**：骨架 → zdoc 片段格式；存量 38 片段作为 prose/翻译的 overlay 基线（代码赢在结构真值，存量赢在文档化设计）——与 cloud 侧同一条真值分配规则；**场景分支化按 §4.0 在文档层完成**（以存量片段的场景设计为基线，新接口 agent 提案分支结构 + 人审拍板）；响应 envelope/示例由 agent 参照 handler 体与存量片段补写；ja 用翻译管线语义种子复用。
3. **交叉验证**（可选）：本地 milvus 实例全接口流量录制 → har-to-openapi 推断响应 schema → 与片段 diff 报告。
4. **门禁**：同 4.1；另外生命周期属性（`x-added-at` 等）需按 milvus release track 维护规则由 diff 工具计算、人审确认。

### 4.3 codex 集成形态

- **CI 外批处理**（推荐起步）：人触发/定时 dispatch 的 workflow job 里跑"取源→diff→生成变更包"，codex（或 claude agent）在 PR 内按规则集改片段，机器门禁全绿后人工 review。与现有 PR-based 工作流、bot-PR 校验体系自然兼容。
- **防漂移 watchdog**（第三阶段）：对齐 broken-links 系列 watchdog 模式，每日拉上游 pinned spec 跑 diff，有漂移才开 issue/PR（含分类清单），无漂移零成本。参考 2026-10-10 overlay 调研的"分类门 + append-only ledger + fail-closed"设计，REST 侧等价物 = 上游新增操作先入 ledger 分类，未分类前阻断发布。

### 4.4 与 shared-docs 机制的关系：机制层复用，渲染层不复用（用户关切：人可提 PR 修改）

先澄清现状：**"人提 PR 修改"对 REST 片段今天已经成立**——38 个片段是 master-owned 文件，10-21 控制面刷新就是标准 master PR 流（人工 diff + 手改 + 矩阵验证）；而且 REST 恰恰是 shared-docs 沿用的"rest 式特判"先例（fetch 矩阵剔除、ja 翻译剔除），不是这个体系的缺位者。shared-docs 能给 REST 真正补的是**上游层的四件套**：

| shared-docs 已落地机制（WP0–8b + 两个 workflow） | REST 侧对应物 | 复用方式 |
|---|---|---|
| lock 锁上游：`parseLock`/`planLock`/`GitMilvusDocsReader`（pin 完整 SHA + 祖先校验；lock 不动=每轮 fetch 组合幂等；**采纳上游=bump lock 的 PR**） | 上游真值 pin（zilliz-cloud openapi.yaml @SHA、milvus 仓 @SHA） | **照搬语义**：rest 侧 `rest-upstream-lock.json`（per 源仓 pin），采纳=刷新 PR（Producer diff + agent + 人审） |
| master-owned 输入 + `shared-docs-validate.yml` 门 + `shared-docs-lock.yml` 自动写 lock 的 PR 工作流 | 片段 PR（现状）+ 刷新 PR（Producer A/B） | 模式相同；门换成 REST 既有校验链（`loadFragmentCollection` → completeness receipt → publication contract → 双站 build） |
| 每日漂移 watchdog（T3：上游 vs lock.next 只报告，report-card 通道） | 上游 spec 漂移侦测（§4.3 P3 已规划） | T3 语义同构，报告通道可复用 |
| ledger 分类门（上游新增页/块未分类前组合阻断；include\|exclude\|annotate+zilliz-add，append-only 带审核人） | 上游新增操作先分类再入片段 | **直接照搬**，ledger 粒度=operation |

per-page 记录（`generated/*/manifests/shared-pages/<page>.json` + active.json）与 REST 既有的 rest-derivation.json / canonical collection manifest 形状同源（upstreamRepo/upstreamCommit/toolingSha），字段对齐即可，不必共用文件。skill 纪律同样通用：只写 master 侧输入、永不直写 `content/`；确定性/生成性二分——与本报告 codex 红线同构，纪律文本可直接沿用。

**不复用的部分（形状不匹配，强套会破坏 REST 契约）**：

1. md2md 组合与 overlay transforms（命名块/行级替换/Variables.json/links.yaml）——REST 的"overlay"是结构化 spec 字段（`x-*`、oneOf 场景分支、titles.json），需要 JSON/YAML-path 语义的 transform，不是 md 块级；
2. 翻译 lane——REST zh 由 titles.json + `x-i18n` 生成、ja 内联片段（zh SKU 语义刻意不随 en），正是被 rest 式剔除保护的翻译例外面，不能并入"组合后译"；
3. 页级 active.json 激活——REST 片段→页面是确定性生成，不存在页级激活问题，对应物是 `fragment-migration.json` 状态机 + completeness receipt。

**落点**：REST **不建** `shared-docs/rest-*/` 手册目录——把发布契约最重的面挂进为 md 设计的管线得不偿失，且 T-1~T4（多手册/多源仓改造）是 shared-docs 侧在途工作，REST 不应给它加依赖。采用**平行同构**：在 rest 域内实现 lock 文件 + 采纳 PR 流 + drift watchdog + ledger 分类门，字段语义对齐 shared-docs。**登记技术债**：短期内 lock 语义双轨（shared-docs 的 md 版 vs REST 的 spec 版）；若未来 shared-docs 抽象出通用"git 源 + lock + ledger"层（T-1~T4 落地后），再评估把 REST 收编为一种 manual，届时双轨合一。

## 5. 分阶段落地建议

| 阶段 | 内容 | 依据 |
|---|---|---|
| P0 | diff 工具进 `packages/docs-tooling`（复用 control-plane-diff5 + 上游 compare 脚本，**branch-aware**，§4.0），固化 10-21 规则集为机器可读规则 + agent 指令；定义 `rest-upstream-lock.json`（语义对齐 shared-docs lock，§4.4） | 工具已存在 80%，只差工程化 |
| P1 | cloud 控制面刷新自动化（Producer A 全链路 + 首次真实刷新演练） | ROI 最高；上游规格权威且带 CI；人工版流程已被 10-21 验证 |
| P2 | milvus 骨架提取器 PoC（handler_v2.go 113 路由全量骨架 + 片段 reconcile 演练） | 路由表规整度高，风险集中在响应 schema |
| P3 | watchdog 化 + manifest-backed collection 转 canonical（legacy-shadow-required → canonical 状态机走完） | 复用既有迁移契约，无架构扩展 |

## 6. 风险与护栏

- **发布架构红线**：AGENTS.md 明确"未经明确任务不扩展发布架构"。本报告只提议 producer，全部走既有 collection 契约与消费链；canonical 切换按 fragment-migration.json 既定状态机渐进。
- **agent 幻觉**：结构零容忍（校验器拦截 + diff 只允许白名单字段类别）；prose 变更要求 diff 可逐条归因到上游/代码证据；内部字段黑名单（accessKey/secretKey/token/innerCall）硬校验。
- **场景分支保护（用户拍板保留）**：oneOf/anyOf 各分支=场景、参数按场景重复罗列是刻意的文档设计。硬规则：scenario-branched 操作禁用结构级改写（仅分支内字段级变更）；"上游/代码有而分支无"= 其它分支字段的并集，不采纳；上游新增字段的分支归属由 agent 提案 + 人审拍板；`x-tab-label`/`x-target-request`/`x-target-response` 示例绑定随分支维护。
- **zh-CN 语义红线**：zh REST 描述是刻意的产品 SKU 定义，**严禁向 en/上游对齐**（既定规则）；ja 随英改同步、规格无 ja 需自写。
- **上游规格的已知缺口**：required 数组/约束缺失（疑似 codegen 丢失）逐接口与研发确认后才落地，不默认采纳也不默认拒绝。
- **OAS 版本差**：上游 3.1.0 vs 片段 3.0.x，降级映射（如 `type` 数组、`examples` 语义）在 diff 工具内一次性确定化并测试锁定，避免 agent 现场判断。
- **tooling 依赖**：ehabterra/apispec 仅 96★，只作对照不作依赖；专用提取器代码留在本仓可控。

## 7. 参考链接

- 工具：https://github.com/ehabterra/apispec · https://github.com/swaggo/swag · https://github.com/grpc-ecosystem/grpc-gateway (protoc-gen-openapiv2/v3) · https://github.com/google/gnostic (protoc-gen-openapi / protoc-gen-jsonschema) · https://github.com/alufers/mitmproxy2swagger · https://github.com/jonluca/har-to-openapi · https://github.com/spencercjh/spec-forge · https://github.com/PaloAltoNetworks/docusaurus-openapi-docs · https://github.com/Mermade/widdershins
- 论文：OOPS（arXiv 2601.12735，LLM 生成 OAS，F1>98%）；OASBuilder（arXiv 2507.05316，IBM Research）
- 本仓：`.claude/specs/2026-10-21-control-plane-openapi-refresh-change-list.md`（人工版流程+规则集）；`packages/docs-tooling/src/reference/rest/CUSTOM_ATTRIBUTES.md`（x-* 契约）；`contracts/rest-fragment-collection.schema.json`（canonical producer 契约）；`.claude/specs/2026-10-10-git-source-overlay-migration-research.md`（git 源+overlay+ledger 模式，可借鉴其分类门设计）；`.claude/specs/2026-10-25-sdk-shared-docs-pipeline-design.md` + `packages/docs-tooling/src/shared-docs/README.md`（lock/PR 门/分类门/per-page 记录的复用来源，§4.4）
- 上游：`zilliztech/zilliz-cloud` `vdc/global/cloud-control-api/`（openapi.yaml 3.1.0 + Spectral CI + openapi-zdoc-compare.sh）；`milvus-io/milvus` `internal/distributed/proxy/httpserver/`；`milvus-io/milvus-proto`

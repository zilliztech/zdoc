# PR #964 评审 + rest-upstream refresh 合并模型修正方案

日期：2026-10-30（第二轮修订：结构跟上游 + 描述跟本地 + 分支判断交模型）· 分析基线：origin/master 93967f19a + PR #964 head 77ccb1ee2（已 close）+ 上游 spec @ 33686e212b（留档 /tmp/pr964-analysis/upstream-openapi.yaml）

## 一、PR #964 事实盘点

首次 decisions 架构真实跑通（pin 33686e21，两日漂移），diff 汇总：fragment-only 51 / unattributed 3 / upstream-added 1 / upstream-added-field 32 / upstream-added-param 3 / upstream-modified 480 / zdoc-only 48。实际落盘：16 片段 +586/-460、lock bump、lifecycle evidence。

三类问题（全部实证）：

### 问题 1：参数描述大面积退化，zh/ja 零同步

- 295 条配对 description 变更中 **153 条显著变短**（多为文档资产被代码注释级文案覆盖）。
  - `clusterName`：316 字符（含错误行为说明 + 获取入口链接）→ 38 字符 "ID of the cluster to import data into."
  - `volumeName`：180 字符（含前置条件 + `[Create Volume](/reference/...)` 文档链接）→ 34 字符，**链接丢失**。
  - `data`（bulk-import）：专用描述 → 泛化模板 "Response payload; the type varies by endpoint."（该文案是上游为 `$ref` 场景写的，搬到内联片段上语义错误）。
- **en 变更 315 处，x-i18n.zh-CN / ja-JP 叶子零改动**。渲染端 `x-i18n[lang]` 优先（RestSpecs/index.js:126/274），故 en 页显示新简短文案、zh/ja 页停留在旧详细翻译 —— 三语三个内容。
- 根因链：①`decide-batches.js` 规则 1 机械强制 adopt 描述；②`assembler.js` prose 只写 en 叶子；③`applier.js` 骨架冻结 x-*（翻译结构性写不进）；④#906 P1 修复 ⑤把 ja 定为"lane 跟进"、zh 同样无通路。

### 问题 2：type 叶子采纳 → 6 处畸形 schema

| 片段 | 端点 | 畸形 |
|---|---|---|
| 11-import | POST /v2/vectordb/jobs/import/create | data: object + **items 残留**，properties 缺失 |
| 19-extract-load | POST /v2/etl/merge | data: object + items 残留 |
| 21-project | POST /v2/projects | data: **string + properties 残留** |
| 21-project | POST /v2/projects/{projectId}/regions | data: array + properties 残留，items 缺失 |
| 22-cluster | GET /v2/clusters | data: object + items 残留 |
| 27-invoices | GET /v2/invoices | data: object + items 残留 |

- 渲染后果（RestSpecs Properties/Items 按 `prop.type` 分发）：object 无 properties → 子字段全不渲染；array 无 items → 无法展开。信息直接丢失。
- 深层诱因（上游 spec 实证）：上游把响应 `data` 重构为三形态 —— `$ref→DTO`（ImportResultDTO=object{jobId} 等）/ 直接 `array+items` / 裸 `string` —— 并统一泛化描述。**真实 API 结构变化被拆成叶子级条目**，adopt 叶子 + 骨架冻结旧结构 + 新结构 omit = 必然撕裂。

### 无害且正确的采纳（应保留）

- `format: null → "int32"`（44+ 处）、number→integer、enum/pattern 等纯元数据 —— 采纳正确。

## 二、上游 x-i18n 覆盖

上游 paths 下 782 个带描述 schema 节点：**zh-CN 覆盖 356（45.5%）、ja-JP 为 0**。
→ 新增/镜像文字的 zh 优先原样携带上游 x-i18n；缺口 + 全部 ja 走翻译网关。

## 三、合并模型（用户拍板 10-30）

> **铁律一：结构（类型、形状、字段增减、约束）= 上游说了算。**
> **铁律二：文字（描述、翻译）= 我们说了算；我们没有的，用上游的，但必须三语齐全才落盘。**
> **分支（oneOf/anyOf 场景拆分）是文档层资产：拆不拆、怎么拆 = 模型提案 + 确认闸。**

### 3.0 现有 fragments 分支形态（10-30 实扫）

240 操作中 235 个带分支容器（oneOf 139 / anyOf 103），两个世界：

- **success | failure 模板系（227 容器，2 分支为主）**：响应侧通用形态，字段级刷新已有"逐分支独立比对"规则。
- **场景创作系（8 容器，全部在 requestBody）**：文档层把上游**合并对象**按场景再拆分——
  - `import/create`：`Volume (Serving) | Volume (On-demand) | External storage (Serving) | External storage (On-demand)`（数据源 × 集群形态）
  - `etl/merge`：`use volume | use object storage`；`storageIntegrations`：`AWS S3 | GCP GCS | Azure Blob | Alibaba Cloud OSS`
  - `import/get_progress`：`Serving Cluster | On-Demand Compute`；`/v1/pipelines`（fragment-only）：`ingestion | search | deletion`
  - 另有 `05 fields/drop`、`06 alter_properties` 两个**无标签** anyOf（diff 按 branch-N 位置比对）。
- 上游 spec 对应 requestBody **全部是合并对象**（`import/create` 16 字段大杂烩，含 `accessKey/secretKey/token/innerCall` 内部字段——拆分同时承担内部字段过滤）。上游自身无 oneOf 场景结构可借鉴，拆分纯靠文档层语义判断。

### 3.1 描述跟本地

F1. decide 规则 1 改为默认保留：description/summary 候选改 instructed omission，明文 "keep local prose; never adopt"。
F2. 双闸兜底：candidates 标 `stanceExpected:false`；`assembler.stanceError` 对 prose adopt 拒收（per-line 不炸批）。
F3. 模板话术静默：上游 `$ref` 共享模板文案（"Response payload; the type varies by endpoint." 系）在 diff/candidates 层降级静默。
F4. PR body 附描述差异对照表（before/after、变长/变短标记），人工收割真增量（如 "0 indicates success"），改时三语同改。

### 3.2 结构跟上游（镜像而非叶子）

G1. **type 漂移 = 子树镜像**：不写单叶子，把该字段整个 schema 子树替换为上游形状（items→properties 对齐一步到位，畸形结构性不可能）。子树内文字按 G3 合并。
G2. **上游新增字段/参数一律采纳**（规则 7 语义反转）：`upstream-added-param` → parameters append；`upstream-added-field` → 落进所属 schema（分支归属见 3.3）。结构字节逐字来自上游 spec 真身，模型不发明结构。
G3. **镜像/新增子树的描述合并**：同名旧字段保留本地 description + x-i18n（本地富文本优先）；新字段用上游 description。
G4. **translate-additions 步骤**：镜像/新增引入且本地无翻译的文字：zh 优先携带上游 x-i18n（45.5%），缺口 + 全部 ja 调翻译网关；**fail-closed：任一语拿不到 → 该条目本轮降级人审清单，绝不落盘无翻译内容**；译文进 PR body 人审。
G5. **applier 解冻范围重构**：骨架不变量从"白名单叶子外全冻结"改为"未被结构操作（mirror/addition）引用的区域骨架不变"；每个结构操作与 diff 条目逐字对账（写入 = upstream after）。x-tab-label/x-target-*/x-include-target 等文档层扩展只在新增对象内部随上游携带、或由分支方案（3.3）显式落盘。
G6. 伴生件沿用既有链路：lifecycle evidence hash 同源重算；新增 operation 才动 titles.json。

### 3.3 分支判断交模型（branch-plan 阶段）

触发场景（语义判断，规则代码不可为）：
- J1 **新字段归属**：场景 tab 操作上出现 `upstream-added-field` → 属于哪个 tab / 多个 tab / 需新 tab？模型输出归属提案，组装器按提案从上游 spec 提取结构落位。
- J2 **场景分化提议**：结构漂移暗示语义可按场景区分（如 Serving vs On-demand 的 data 形态差异）→ 模型提议是否拆分、tab 标签（遵循现有命名风格如 "Volume (Serving)"）、各分支字段清单与理由。
- J3 **新操作分支方案**：`upstream-added` 新操作 → 响应默认 success|failure 模板；请求体字段互斥明显（import/create 形态）→ 模型给拆分提案。

确定性闸（提案不是结构）：
- 只引用真实字段名；黑名单词（accessKey/secretKey/token/innerCall）出现在提案=拒收；分支字段并集 ⊆ 上游字段集；每分支 ≥1 字段；tab 标签不复用 success/failure 语义。
- **分支重组（新增/删除/改标签 tab）带 requiresConfirmation**：分支是文档层资产（红线 4），重组改变页面结构 → PR 人审点名放行；纯"新字段进现有 tab"无重组则自动落。
- 上游合并对象的"分支并集"仍不采纳（红线 4 原文保留）——拆分是创作，不是 union 复刻。

### 3.4 删除与安全闸

H1. **上游删除字段/参数 → 确认闸**（唯一保守点，有据）：上游 spec 历史发生过 generator 丢字段（decision 9），盲目跟随丢文档内容。PR body 删除清单人工点头；用户若认为顾虑过时可改全自动。
H2. **形状校验闸（新，land 前）**：校验每个 schema 节点 type 与形状键匹配（object 无 items / array 无 properties / 标量无形状键），畸形到不了页面。
H3. format/enum/min-max/pattern 等无结构耦合标量约束维持机械 adopt（#964 已验证）。
H4.（二期防御纵深）RestSpecs 渲染 object 无 properties 时降级显示描述而非空白。

## 四、PR #964 处置（已执行）

**已于 10-30 close**（附根因评论）。管线按本方案修复合入 master 后**同 pin（33686e21）重 dispatch**——上游 spec 已留档、diff 全量可复现，作为新形态回归夹具。预期产出：结构镜像对齐（含 6 处 data）+ 新字段/参数带三语 + 描述差异对照表 + 分支提案与删除清单待人审。

## 五、实施顺序（建议单 PR，矩阵登记）

1. `candidates.js` / `decide-batches.js`：F1/F3 规则与基数、G2 规则 7 反转、J 阶段 prompt。
2. 新 `branchPlan.js`（J1-J3 提案 + 确定性闸），decide 后调用。
3. `assembler.js`：F2 stanceError 拒 prose adopt、G1 镜像组装、G2 addition 组装、PR body 三清单（描述差异/删除/分支提案）。
4. `translate-additions` 脚本 + workflow 步骤（G4，复用 decide 网关回退链与容错解析）。
5. `applier.js`：G5 解冻范围重构 + H1 确认闸 + H2 形状校验闸。
6. 测试：#964 真实 diff 本地重放断言新形态；`pnpm test:rest-upstream` + `pnpm test:for-change` union + 矩阵登记。

## 六、遗留判断（不阻塞）

- 142 条变长 description 里的真增量由 F4 清单人工收割。
- 上游 `data` 泛化模板描述的 zh 版（"响应负载，类型随端点而变化。"）在镜像子树里若属"新字段"则按 G4 走翻译并优先上游 zh 原文——模板文案是否值得保留由 F3 静默 + 人审清单双管。
- `05 fields/drop`、`06 alter_properties` 两个无标签 anyOf 的分支化（补 x-tab-label）是一次性内容清理候选，不阻塞管线。

# Zilliz Cloud 中文 Reference 文档 House Style 指南 v1

- 生成日期: 2026-09-11
- 语料: checkpoint `6603236582efbec5aaa83eefccd085ef523209ca` 的 12 对已发布 EN→ZH 平行页面（python 4 对 + java 3 对 + node 1 对 + go 1 对 + cli 2 对 + CLI 总览 1 对；REST spec 生成内容未选样）
- 蒸馏方式: DeepSeek `deepseek-v4-pro`（temperature 0.2 / max_tokens 8192 / thinking disabled）分 4 批归纳 + 人工逐条例句核验（所有 ✅ 例句均经 grep 回查语料原文；LLM 误报已标 ⚠ 并纠正）
- 合并来源: (a) LLM 语料蒸馏；(b) 生产契约 `config/translation/zh-CN-reference.json`；(c) 生产翻译/polish 提示词（`.github/prompts/codex-translation-agent.zh-CN-reference.md`、`codex-polish-agent.zh-CN-reference.md`）；(d) 蒸馏过程中的教训（LLM 空格/句号/标题判断 3 处误报，均经 grep 纠正）

**规则来源标签**: `[语料]` = 平行语料中验证；`[契约]` = 生产 locale contract；`[polish]` = 生产 translation/polish agent 提示词；`[教训]` = 蒸馏过程教训。⚠ = LLM 曾给出相反结论，经 grep 回查语料纠正，或语料存在少量反例（配合「待人工裁决」）。

---

## 0. 总则

**R0.1 使用自然、简洁的简体中文开发者文档文体；读者代词一律用「您」** `[契约][语料]`
语料统计: 「您」44 处 vs 「你」0 处。操作步骤中常省略主语（见 R1.2）。
- ✅ `提供了一个命令行工具，用于管理您的 Zilliz Cloud 资源并执行数据操作。`（cli-overview）
- ✅ `**ConnectConfig** 允许您在一处配置连接属性`（ja-client）
- ❌ `管理你的 Zilliz Cloud 资源`（语料中未出现「你」，属禁止形态）

**R0.2 严禁增译・删译・改变语义强度** `[契约][polish]`
"Preserve source meaning, conditions, product scope, and intensity without additions or omissions." 措辞改写只允许发生在措辞/语序/自然度层面。
- 禁止把 Global 独有的产品声明、配额、区域、行为引入中国站文档 `[polish]`。

**R0.3 fenced 代码块（含自然语言注释）是受保护字节** `[契约][polish][语料]`
代码块的 fence、语言标签、缩进、字符串、示例输出、注释、末尾换行逐字节保留。
- ✅ ZH 侧代码注释保持英文: `# 1. Set up a milvus client`、`// replace this with your token`（py-search / ja-client）
- ❌ 翻译代码注释（契约 example `zh-code-comment`: `// Create a collection` 不得译为 `// 创建 Collection`）。

**R0.4 protected marker 的恒等性与计数** `[polish]`
marker 不得改写、复制、删除；同一 semantic unit 内允许为中文语序重排，但不得跨 unit 移动。无 marker 的 unit 不得凭空新增 marker（不得擅自添加反引号）。

**R0.5 中文标点 + 术语周围可读空格** `[契约][语料]`
正文用中文标点；中文与英文/数字之间加半角空格（见 R6.3）。

---

## 1. 人称、敬体与操作句式

**R1.1 「您」是唯一读者代词；「你」禁止** `[契约][语料]`
- ✅ `您也可以根据需要使用其他名称。`（py-create-collection）
- ✅ `LocalBulkWriter 实例会在本地将您的原始数据重写为 Zilliz Cloud 可识别的格式。`（py-bulkwriter）

**R1.2 操作说明用无主语祈使句，「将/把 + 宾语 + 动词」结构** `[语料]`
- ✅ `将 **uri** 设置为您的集群 Endpoint。`（py-client Admonition）
- ✅ `将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。`（py-create-collection）

**R1.3 条件/目的从句前置：「如果……请……」「要……您需要……」** `[语料]`
- ✅ `如果您需要使用自定义 Schema 设置 Collection，请跳过此参数。`（py-create-collection）
- ✅ `要使用自定义 Schema 设置 Collection，您需要先创建一个 **[CollectionSchema](./MilvusClient-CollectionSchema)** 对象，并在此处引用它。`（py-create-collection）
- ✅ `如果使用 \`zilliz context set\` 配置了集群，而此选项未配置，则会自动应用其所属的 Database。`（cli-collection-list）

**R1.4 情态分层：硬性约束用「必须」，一般要求用「应/需要/请」** `[语料]`
语料频次: 「请」50、「应」34、「必须」6，且「必须」集中在硬性命名规则与数值上限。
- ✅ 硬约束: `副本数的乘积必须小于或等于 32。`（cli-cluster-create）；`该值必须是长度为 1 的字符串`（py-bulkwriter）
- ✅ 一般要求: `此值与 **param** 中 **offset** 的总和应小于 16,384。`（py-search）
- ✅ `应与 **password** 一起使用。`（py-client）

**R1.5 并列动词短语用顿号，最后两项用「和」连接** `[语料]`
- ✅ `创建、暂停、恢复和删除集群`（cli-overview）
- ✅ `创建、读取、更新和删除（CRUD）操作`（ja-client）
- ✅ `可选值为 **L2**、**IP** 和 **COSINE**。`（py-create-collection）

**R1.6 描述系统行为时省略主语，动作主体是产品/组件** `[语料]`
- ✅ `在重写您的原始数据时，Zilliz Cloud 会将原始数据拆分为多个 Segment。`（py-bulkwriter）
- ✅ `此操作会列出所有 Collection。`（cli-collection-list description）

---

## 2. 参数 / 返回值 / 异常区块文体

**R2.1 区块表头译法固定：`**参数：**` `**返回类型：**` `**返回：**` `**异常：**`（加粗 + 全角冒号）** `[语料]`
- ✅ `**参数：**`（py-client / py-create-collection / py-search）；`**构建器方法：**`、`**公共方法：**`（ja-client）

**R2.2 参数条目格式：`- **参数名** （*类型*） -`，参数名加粗、类型保留英文、括号一律全角（D4 裁决）** `[语料]`
- ✅ `- **collection_name** (*str*) -`（py-create-collection）
- ✅ `- **timeout** (*float* | *None*) -`（py-client）
- ✅ `- **--database** (*string*) -`（cli-collection-list）

**R2.3 必填标记 `[REQUIRED]` 统一译为 `**[必需]**`（保留方括号与加粗）** `[语料]`
语料统计: `**[必需]**` 11 处 vs `[REQUIRED]` 0 处（python/java/node/cli 全组一致）。

**R2.4 参数说明是完整句，句末带句号** `[语料]` ⚠（LLM 第二批曾误报「句末不加句号」，grep 回查全部实例均带「。」）
- ✅ `要创建的 Collection 的名称。`（py-create-collection）
- ✅ `用于连接指定 Zilliz Cloud 集群的有效用户名。`（py-client）
- ✅ `目标 Collection 的 Schema，重写后的数据将导入到该 Collection 中。`（py-bulkwriter）

**R2.5 默认值固定句式：「该值默认为 **X**。」** `[语料]`
- ✅ `该值默认为 **id**。`（py-create-collection）
- ✅ `该值默认为 **536,870,912** 字节，即 **512** MB。`（py-bulkwriter）

**R2.6 互斥/条件关系固定句式：「此参数与 **X** 互斥。」「如果 **X** 不为 **None**，则会忽略此参数。」** `[语料]`
- ✅ `此参数与 **ids** 互斥。`、`此参数与 **data** 互斥。`（py-search）
- ✅ `此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。`（py-create-collection）

**R2.7 返回值/异常说明允许多句连排，句内句号分隔、句末收句号** `[语料]`
- ✅ `返回完整的 RBAC 元数据快照，包括用户、角色、授权和权限组。如果操作失败，则返回错误。`（go-backuprbac）

---

## 3. 代码示例与说明的衔接

**R3.1 示例章节标题译为「## 示例\{#example}」，锚点保留英文** `[语料]`
- ✅ `## 示例\{#examples}`（py-client）；`## 示例\{#example}`（cli-collection-list）

**R3.2 代码块前引导句：「示例配置如下：」（全角冒号收尾）或直接给出代码块** `[语料]` ⚠（两种衔接并存，倾向有引导句；ja-client 无引导句直接给代码块）
- ✅ `示例配置如下：` + 代码块（py-bulkwriter）

**R3.3 代码块内命令、参数、注释、示例输出逐字节保留** `[契约][polish][语料]`（同 R0.3）
- ✅ `zilliz cluster create --name my-cluster \\`（cli-cluster-create，ZH 原样）

**R3.4 代码块后的说明句用无主语句承接，解释关键参数** `[语料]`
- ✅ `**token** 参数可以是具有足够权限的 Zilliz Cloud API key，也可以是格式为 \`username:p@ssw0rd\` 的集群用户凭据。`（py-client Admonition）

---

## 4. 术语与中英混排

**R4.1 契约强制术语保留英文（大小写按契约）** `[契约][语料]`
`Compaction`（case-sensitive）、`collection→Collection`、`entity→Entity`、`schema→Schema`、`database→Database`、`partition→Partition`、`segment→Segment`、`analyzer→Analyzer`、`endpoint→Endpoint`（case-sensitive）。
语料统计: `Collection` 98 处 vs 「集合」0 处；`Entity` 22 处 vs 「实体」0 处；正文 `Database` 全部保留（「数据库」仅出现在 frontmatter keywords，见 D8）。
- ✅ `要创建的 Collection 的名称。`
- ✅ `返回当前正在使用的 Database 名称。`（ja-client）
- ❌ 契约 forbidden: `Compaction → 压缩/压实`；普通 compression 仍译「压缩」。

**R4.2 固定短语按普通语义翻译，不被术语表劫持** `[契约][polish]`
- `garbage collection` → `垃圾回收`（❌ `垃圾 Collection`，契约 example `zh-garbage-collection`）。
- 普通响应压缩 → `启用响应压缩`（❌ `启用响应 Compaction`，契约 example `zh-compression-general`）。

**R4.3 doNotTranslate 清单** `[契约]`
`Zilliz Cloud`、`Milvus`、`BYOC`、`Serverless`、`AUTOINDEX`。

**R4.4 「cluster」译「集群」，不保留英文** `[语料]` ⚠（与 R4.1 形成对照；产品枚举名后的 cluster 也译「集群」）
语料统计: 「集群」51 处；大写 `Cluster` 仅出现在链接文字/URL/标题锚点（8 处），小写 `cluster` 仅在代码块命令内。
- ✅ `**MilvusClient** 实例表示一个连接到特定 Zilliz Cloud 集群的 Python 客户端。`（py-client）
- ✅ `### Performance-optimized 集群`（cli-cluster-create，产品枚举保留 + 集群译出）
- ✅ `（仅 Dedicated）`（cli-cluster-create，Dedicated 按契约 contextualTerms 保留）

**R4.5 通用技术名词正常译出：向量、索引、字段、用户名、密码、快照、集群、按需计算** `[语料]`
语料统计: 「向量」49、「索引」18（`Index` 仅 10 处且全在链接文字/类名 `IndexParam`）、「按需计算」4（on-demand compute）。
- ✅ `Zilliz Cloud 会搜索与指定 Entity 中向量嵌入最相似的结果。`（py-search）
- ✅ `此方法适用于专用服务集群和按需计算。`（py-create-collection）

**R4.6 代码标识符（参数名、方法名、类名、枚举值、度量类型）保留英文，加粗或反引号** `[语料]`
- ✅ `- **auto_id** (*bool*) -`（py-create-collection）
- ✅ `可选值包括 **BulkFileType.JSON**、**BulkFileType.PARQUET**、**BulkFileType.CSV**。`（py-bulkwriter）
- ✅ `可选值为 **DataType.INT64** 和 **DataType.VARCHAR**。`（py-create-collection）
- ✅ `` `zilliz login` ``、`` `--database` ``（cli-overview / cli-collection-list）

**R4.7 凭据类词按语境分流：`API key` 保留；`token` 参数说明可译「访问令牌」** `[语料]` ⚠（样本少，2:30，见 D9）
- ✅ `Zilliz Cloud API key`（py-client）
- ✅ `用于访问指定 Zilliz Cloud 集群的有效访问令牌。`（py-client `token` 参数说明）

---

## 5. 标点

**R5.1 中文正文一律全角标点：。，：？！** `[契约][语料]`
grep 全语料未发现中文后紧跟半角逗号/句号的实例。
- ✅ `指示输出格式。可选值包括：`（cli-collection-list）

**R5.2 顿号列举中文项与英文枚举名；末项用「和」** `[语料]`
- ✅ `可选值为 **L2**、**IP** 和 **COSINE**。`
- ✅ `不允许使用以下字符串：`"\0"`、`"\n"`、`"\r"`、`"""`。`（py-bulkwriter）

**R5.3 中文注释性括号用全角；类型标注括号用半角** `[语料]` ⚠（分工明确但属约定，见 D4）
- ✅ 全角: `创建、读取、更新和删除（CRUD）操作`（ja-client）、`（仅 Dedicated）`（cli-cluster-create）、`（已禁用）`（ja-client）
- ✅ 半角: `(*str*)`、`（`number[]`）` 中包裹代码时也用全角外括号 `` （`number[]`） ``（node-hybridsearch）

**R5.4 中文与英文/数字之间加半角空格** `[语料]` ⚠（LLM 两个批次均误报「不加空格」，其引用例句本身带空格；grep 回查 12:0 支持加空格，见 D5）
- ✅ `Zilliz Cloud 集群`（12 处，无一例 `Zilliz Cloud集群`）
- ✅ `**MilvusClient** 实例表示一个连接到特定 Zilliz Cloud 集群的 Python 客户端。`
- ✅ `Tiered-storage 集群在 BYOC 项目中不可用。`——注意：真实语料为 `BYOC 项目中不可使用 Tiered-storage 集群。`（cli-cluster-create；LLM 曾把词序改写后当作引句，引用语料时必须逐字核对）`[教训]`

**R5.5 粗体/反引号标记两侧的空格同样保留** `[语料]`
- ✅ `将 **uri** 设置为您的集群 Endpoint。`

---

## 6. 数字与单位

**R6.1 数字一律半角，千分位用英文逗号** `[语料]`
- ✅ `16,384`、`536,870,912`、`1,024`

**R6.2 数字与中文量词、英文单位之间加半角空格** `[语料]` ⚠（LLM 误报「不加空格」，语料 8+ 处全部加空格、0 处连写，见 D5）
- ✅ `不超过 **255** 个字符`（cli-cluster-create）
- ✅ `该值默认为 **536,870,912** 字节，即 **512** MB。`（py-bulkwriter）
- ✅ `**1** 到 **16,384**`（py-search）

**R6.3 数值范围用「到」连接，不用「~」「-」「至」** `[语料]`
- ✅ `**1** 到 **16,384**`；语料中 `N~N`/`N 至 N` 为 0 处。

**R6.4 日期/区域代码等字面量按代码处理原样保留** `[语料]`
- ✅ `aws-us-east-1`（cli-cluster-create 代码块内）。

---

## 7. 链接

**R7.1 URL、路径、锚点逐字保留** `[polish][语料]`
- ✅ `[相似度度量说明](/docs/search-metrics-explained)` ← `[similarity metrics explanation](…)`（py-create-collection）

**R7.2 正文引导性链接文字译为中文** `[语料]`
- ✅ `有关这些度量类型的详细信息，请参见 [相似度度量说明](/docs/search-metrics-explained)。`
- ✅ `[身份验证](./Configuration/Configuration-Auth/Auth-login)`、`[创建集群](./CloudManagement/CloudManagement-Cluster/Cluster-create)`（cli-overview）

**R7.3 命令类别名/页面标题类链接文字可保留英文** `[语料]` ⚠（双语策略并存，见 D3）
- ✅ `[Cloud Management](./CloudManagement/CloudManagement-Cluster/Cluster-create)`、`[Filtering Overview](/docs/filtering-overview)`（py-search）
- ✅ `[entity.RBACMeta](./v2-Authentication-RBACMeta)`（go-backuprbac，代码标识符链接）

**R7.4 导航列表里「英文链接 + ` - ` + 中文描述」的固定版式** `[语料]`
- ✅ `[Cluster](./CloudManagement/CloudManagement-Cluster/Cluster-create) - 创建、暂停、恢复和删除集群`（cli-overview）

**R7.5 参照句式固定：「请参见 [X]。」** `[语料]`
- ✅ `要构建标量过滤条件，请参见 [Filtering Overview](/docs/filtering-overview)。`（py-search）

---

## 8. Note / Warning / Admonition

**R8.1 Admonition 的 `title` 属性保留英文** `[语料]` ⚠（语料 16:0 一致；LLM 曾误报 cli-cluster-create 有「备注」，grep 回查无此字样；是否本地化见 D1）
语料统计: `title="Notes"` ×12、`title="Note"` ×4，全部保留英文。
- ✅ `<Admonition type="info" icon="📘" title="Notes">`（py-client / py-search / cli-cluster-create 等）

**R8.2 Admonition 正文是中文完整句，与正文文体相同（可用「您」或无主语句）** `[语料]`
- ✅ `BYOC 项目中不可使用 Tiered-storage 集群。`（cli-cluster-create Notes 正文）
- ✅ `将 **uri** 设置为您的集群 Endpoint。**token** 参数可以是具有足够权限的 Zilliz Cloud API key，…`（py-client Notes 正文）

**R8.3 Admonition 组件属性（type/icon/id）是受保护属性，不改写** `[polish][语料]`
- ✅ `import Admonition from '@theme/Admonition';` 与组件标签原样保留（cli-cluster-create）。

---

## 9. 标题与 frontmatter

**R9.1 H1 保留英文：类名、方法名、命令名** `[语料]`
- ✅ `# LocalBulkWriter`、`# MilvusClientV2`、`# addField()`、`# create`、`# list`、`# Zilliz CLI`

**R9.2 H2/H3 译为中文，词表固定** `[语料]`
`Constructor→构造函数`、`Request Syntax→请求语法`、`Examples/Example→示例`、`Properties→属性`、`Methods→方法`、`Description→说明`、`Synopsis→概要`、`Options→选项`。
- ✅ `## 构造函数\{#constructor}`（py-client / ja-client）
- ✅ `## 请求语法\{#request-syntax}`（py-search）

**R9.3 标题锚点 `\{#...}` 保留英文原样** `[语料]`
- ✅ `## 说明\{#description}`（cli-cluster-create）

**R9.4 产品枚举名开头的标题：英文枚举 + 中文「集群」** `[语料]`
- ✅ `### Performance-optimized 集群`、`### Capacity-optimized 集群`、`### Tiered-storage 集群`（cli-cluster-create）

**R9.5 frontmatter: `description` 译出；`title`/`slug`/`token`/`sidebar_position` 等标识符字段保留** `[语料]`
- ✅ `description: "MilvusClient 实例表示一个连接到特定 Zilliz Cloud 集群的 Python 客户端。 | Python | MilvusClient"`
- ✅ `description: "此操作会列出所有 Collection。 | Cloud"`（cli-collection-list）
- ⚠ `sidebar_label` 与 `keywords` 策略不一致（概述 vs list；向量数据库 vs 向量 Database），见 D8。

---

## 10. 粗体与反引号

**R10.1 原文的粗体标记在译文中保留，作用于对应译语或保留的英文术语** `[语料]`
- ✅ `**Cloud Management** - 管理集群、项目、存储卷和备份`（cli-overview）
- ✅ `可选值为 **L2**、**IP** 和 **COSINE**。`

**R10.2 命令、选项、代码字面量用反引号包裹** `[语料]`
- ✅ `` `zilliz login` ``、`` `--output, -o` ``、`` `zilliz context set` ``

**R10.3 普通类 code-like token 保持纯文本，不得新增反引号/保护语法** `[polish]`
- "Never add backticks or create other protected Markdown/MDX syntax that is absent from the supplied unit."

---

## 11. CLI 专页补充规则

**R11.1 Options 表参数名保留英文（含 `-`/`--` 前缀），说明以「指示……」开头** `[语料]`
- ✅ `- **--database** (*string*) -` + `指示 Database 名称。`（cli-collection-list）
- ✅ `指示输出格式。`（cli-collection-list）

**R11.2 概览页命令类别段落：「英文粗体类别 + 空格短横 + 中文功能描述」** `[语料]`
- ✅ `- **Cloud Management** - 管理集群、项目、存储卷和备份`（cli-overview）

**R11.3 CLI 示例代码块只含命令本身，不翻译** `[语料]`
- ✅ ` ```bash ` + `zilliz collection list`（cli-collection-list）

---

# 已裁决（zh style guide v1.1，2026-09-11）

> 原「待人工裁决」10 条已全部定稿，规则如下，与正文条款同等效力。冲突处以本节为准。

**D1 → B**：Admonition `title` 统一本地化：`Notes→注意`、`Warning→警告`、`Tips→提示`；语义化标题照常翻译。存量 16 处英文标题需回改（内容侧任务，单独跟踪），并确认管线不把 title 属性当作保护字节。

**D2 → B**：术语白名单扩大：**serving**（serving 集群）、**API key**、**token**（凭据语义的参数名与代码标识符）保留英文；消除「serving 集群/服务集群」同文混用，白名单条目登记进契约 contextualTerms 后对全管线生效。

**D3 → B**：链接文字一律译出，与目标页中文标题同步（存量英文链接文字按此原则回改）。

**D4 → B**：括号一律全角：中文注释与类型标注均用全角（`（str）`、`（CRUD）`）。存量半角类型标注需回改，类型标注的半角括号规则从 R2.2 中移除。

**D5 → A**：中文与英文/数字之间强制加半角空格（现状语料 100% 一致，直接明文化入契约 styleRules）。

**D6 → A**：短枚举行内顿号 + 「和」连末项；长枚举（≥4 项）用 bullet 列表。

**D7 → A**：保持区分：Quick Start→快速开始、Get Started→开始使用。

**D8 → B**：`sidebar_label` 跟随 H1（命令名等代码标识符保留英文）；keywords 全译。frontmatter 保护字节边界以管线实际契约为准并在落地时核验。

**D9 → A**：制定简体用字倾向表并入契约 examples（哈希、内存、加载、快照；「令牌」仅用于凭据语义的散文，代码标识符保留 token）。

**D10 → A**：情态词明文映射：must→必须、should→应、please/祈使→请（与现状语料分布一致，写入契约 styleRules）。
### 附: 语料选样清单

全部 12 对在 checkpoint `6603236582efbec5aaa83eefccd085ef523209ca` 经 `git cat-file -e` 验证两侧同时存在，无替代选样（EN 与 ZH 路径一一对应，REST 生成内容未选）。

| # | 组 | 页面（content/{en,zh-CN}/reference/ 下同路径） | EN bytes | 批次 |
|---|----|----------------------------------------------|----------|------|
| 1 | python | api/python/python/MilvusClient/MilvusClient-Client/Client-MilvusClient.md | 3,529 | 1 |
| 2 | python | api/python/python/MilvusClient/MilvusClient-Collections/Collections-create_collection.md | 15,781 | 1 |
| 3 | python | api/python/python/MilvusClient/MilvusClient-Vector/Vector-search.md | 17,394 | 1 |
| 4 | python | api/python/python/DataImport/DataImport-LocalBulkWriter/DataImport-LocalBulkWriter.md | 3,778 | 2 |
| 5 | java | api/java/java/v2/v2-Client/v2-Client-MilvusClientV2.md | 6,542 | 2 |
| 6 | java | api/java/java/v2/v2-Collections/v2-Collections-CollectionSchema/v2-CollectionSchema-addField.md | 6,729 | 2 |
| 7 | java | api/java/java/v2/v2-Vector/v2-Vector-SearchIteratorV2.md | 5,317 | 3 |
| 8 | node | api/nodejs/nodejs/Vector/Vector-hybridSearch.md | 6,279 | 3 |
| 9 | go | api/go/go/v2/v2-Authentication/v2-Authentication-BackupRBAC.md | 1,705 | 3 |
| 10 | cli | cli/cli/CloudManagement/CloudManagement-Cluster/Cluster-create.md | 4,596 | 4 |
| 11 | cli | cli/cli/DataOperations/DataOperations-Collection/Collection-list.md | 1,396 | 4 |
| 12 | 总览 | cli/cli/Overview.md | 1,878 | 4 |

蒸馏调用: 6 次（batch1/2/3/4 各一次 + batch1/2 因首轮输出在 max_tokens 截断丢失「不一致」节各重跑一次），模型 `deepseek-v4-pro`，thinking disabled。完整原始输出与核实记录见同目录 `distill-evidence.json`。

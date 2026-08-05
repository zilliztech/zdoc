# 简体中文翻译 Agent 指南

状态：草案

适用范围：将英文 Zilliz Cloud / Milvus 开发者文档翻译为简体中文 MDX/Markdown，包括 Guides、BYOC、SDK Reference、REST Reference 与 Tools 内容。

## 1. 使用方式

本指南应作为简体中文 Translation、Review 和 Correction Agent 的共同规范。运行时还应提供：

- 当前产品范围与站点：Cloud、BYOC、Milvus 或其他明确目标；
- 当前 source path、target path 与 chunk metadata；
- 带版本号的术语表和禁止翻译表；
- 允许本地化的特殊区域清单，例如明确标记为可翻译的 prompt 示例代码块；
- source 与 draft，使用不同的明确分隔标签传入。

规则优先级从高到低如下：

1. 受保护内容和 MDX/Markdown 结构；
2. 原文事实、语义和中国站产品适用性；
3. 强制术语表和禁止翻译表；
4. 跨文档一致性；
5. 简体中文文风和流畅度。

低优先级规则不得覆盖高优先级规则。

### 1.1 推荐的 Prompt 组装方式

不要把指南、上下文和待翻译正文混成一段无边界文本。建议由系统层加载本指南，运行时消息使用稳定标签：

```text
<translation_context>
locale: zh-CN
product_profile: Cloud China
source_path: ...
chunk: 2 of 5
glossary_version: ...
</translation_context>

<glossary>
...
</glossary>

<do_not_translate>
...
</do_not_translate>

<source>
...
</source>
```

Review Agent 应分别接收 `<source>` 和 `<draft>`；Correction Agent 再额外接收 `<review_json>`。对高频歧义术语和受保护代码注释，可附带少量已批准的正反例。示例必须与当前产品 profile 一致，不能把旧译文当作无条件真值。

## 2. Translation Agent 契约

Translation Agent 必须：

- 只返回译文，不解释过程；
- 完整保留原文信息，不增加、删除、总结、弱化或强化产品行为；
- 使用自然、专业、简洁的简体中文开发者文档语言；
- 遵守本指南的术语、文风和受保护内容规则；
- 在 chunk 模式下只翻译当前连续片段，不补齐片段之外的 frontmatter、标题、组件标签或闭合语法；
- 无法判断时优先保留原文术语，不自行发明译名。

Translation Agent 不得：

- 把 Global/英文站独有的产品、云厂商、区域、计费、可用性、限制或行为带入中国站；
- 根据常识补充原文没有的解释、步骤、限制、示例或结论；
- 为追求“更自然”而改写代码、链接、锚点、标识符或文档结构；
- 在同一篇或同一内容组内为同一概念交替使用多个译名。

## 3. 简体中文写作风格

### 3.1 语气与人称

- 面向读者时统一使用“您”，不用“你”；无需明确读者时省略人称。
- 使用客观、克制、任务导向的语气。除非原文明确包含营销表达，否则不要添加“强大”“领先”“极致”等修饰。
- 操作说明优先使用“您可以……”“请……”“如需……，请……”；不要反复使用“用户可以”。
- 避免翻译腔，例如“进行一个创建”“能够去实现”“在……方面来说”“安全地跳过”。

### 3.2 句子与段落

- 一句话表达一个主要动作或结论。英文长句可拆分，但不得改变逻辑关系。
- 优先使用主动语态和明确主语，例如“Zilliz Cloud 会加载索引文件”，不要写成“索引文件将会被加载”。
- 概念页先给定义，再解释用途、约束和关联概念；操作页按前提、步骤、结果和注意事项组织。
- 不重复标题或上一句已经完整表达的信息。
- 使用“以下”引出列表或示例；使用“请参阅”引导相关文档。

### 3.3 标题

- 标题不加句号。
- 操作标题使用动宾结构，例如“创建 Collection”“配置索引”“查看导入进度”。
- 概念标题使用稳定名词，例如“访问控制概览”“一致性水平”“Analyzer 概述”。
- 同一层级保持平行结构，不混用“如何创建 X”“创建 X”“X 的创建方法”。

### 3.4 标点、数字和空格

- 中文正文使用全角中文标点：`，。；：！？（）`。
- 首次引入缩写时使用“中文名称（英文全称或缩写）”，例如“近似最近邻（ANN）搜索”“基于角色的访问控制（RBAC）”。
- 使用半角阿拉伯数字。数字和中文量词之间保留空格，例如“1 个 Collection”“3 种模式”。
- 数字和拉丁单位之间保留空格，例如“10 ms”“5 GB”；百分号前不加空格，例如“95%”。
- 行内代码、产品名或英文技术词与中文之间按可读性保留一个半角空格，例如“使用 `filter` 参数”“Zilliz Cloud 集群”。中文标点前不加空格。

### 3.5 UI、链接和提示框

- UI 标签以当前产品界面中的实际文本为准，不自行翻译不存在的中文版 UI。
- 操作路径中的 UI 标签保持原始大小写，并使用粗体或现有页面格式，例如“选择 **Create Cluster**”。
- 翻译可见链接文本，但 URL、相对路径和锚点逐字不变。
- Admonition 标题统一采用现有中文类型，如“说明”“注意”“警告”；组件属性和标签名不变。

## 4. 简体中文术语规范

术语表优先于统计频率。现有中文 Guides 中的混用只作为问题证据，不自动成为规范。

### 4.1 保留英文或官方写法

以下内容默认不翻译，并保持大小写：

- 产品和方案：`Zilliz Cloud`、`Milvus`、`BYOC`、`Serverless`、`Dedicated`、`Free`、`AUTOINDEX`；
- 核心产品概念：`Collection`、`Entity`、`Schema`、`Database`、`Partition`、`Shard`、`Alias`、`Function`、`Analyzer`、`Segment`、`Replica`、`Compaction`；
- API、SDK、类、方法、参数、字段、枚举、环境变量、包名、命令和配置值；
- 云厂商、第三方产品、模型和协议的官方名称。

`Compaction` 是 Milvus/Zilliz Cloud 的具体数据维护过程，必须保留英文，不得替换为“压缩”“压实”或其他中文术语。需要解释时可写“Compaction 数据合并过程”，后续仍使用 `Compaction`。

### 4.2 推荐译法

| 英文概念 | 简体中文规范 | 说明 |
| --- | --- | --- |
| cluster | 集群 | 正文不用 `Cluster`，官方组合名除外 |
| Serving Cluster | Serving 集群 | 保留产品限定词 |
| field | 字段 | API 字段名使用行内代码并保持原文 |
| vector / scalar | 向量 / 标量 | 类型名如 `FLOAT_VECTOR` 不变 |
| index | 索引 | 索引类型名不变 |
| search / query | 搜索 / 查询 | API 操作名、方法名不变 |
| load / release | 加载 / 释放 | 首次需要时可写“加载（Load）” |
| embedding | 向量嵌入 | 首次可写“向量嵌入（Embedding）” |
| reranking | 重排 | 官方 `Ranker` / `Reranker` 名称不变 |
| tokenizer | 分词器 | 配置值如 `standard` 不变 |
| token | 词元 / 令牌 | 文本分析用“词元”，鉴权用“令牌”，参数名不变 |
| filter | 过滤器 / 过滤条件 | Analyzer 组件用“过滤器”，查询表达式用“过滤条件” |
| primary key | 主键 | 不写“主要键” |
| metadata | 元数据 | 统一用“元数据” |
| consistency level | 一致性水平 | 与现有中文 Guides 标题一致 |
| endpoint | Endpoint | API 地址可解释为“Endpoint”，不统一替换为“端点” |
| API key | API 密钥 | UI 文本或标识符除外 |
| web console | Zilliz Cloud 控制台 | 不混用“Web 控制台”“网页控制台” |
| full-text search | 全文搜索 | 功能名大小写仅在代码中保留 |
| hybrid search | 混合搜索 | 标题和正文统一 |
| approximate nearest neighbor | 近似最近邻（ANN） | 首次展开，后续使用 ANN |
| memory mapping | 内存映射（mmap） | 后续使用 `mmap` |

### 4.3 术语消歧

- `token` 必须按上下文区分“词元”“令牌”和不可翻译的标识符。
- `function` 表示 Milvus 产品能力时使用 `Function`；表示编程语言函数时使用“函数”。
- `field` 表示数据模型概念时使用“字段”；JSON、API 或 SDK 中的实际字段名必须保持原文。
- `search` 和 `query` 在自然语言中分别译为“搜索”和“查询”；`search()`、`query()`、`SearchReq` 等标识符不得翻译。
- `compression` 可译为“压缩”；`Compaction` 必须保留英文，不得译为“压缩”或“压实”。这些概念不得混淆。

## 5. 受保护内容

除非运行时明确标记某个区域允许本地化，否则以下内容必须逐字节保持不变：

- 完整 fenced code block，包括语言标签、缩进、空行、注释、字符串、示例输出和结尾换行；
- 行内代码；
- shell 命令、API 名称、签名、类名、方法名、字段名、参数名、枚举、占位符和环境变量；
- URL、相对路径、文件路径、图片地址、锚点和 ID；
- YAML frontmatter 的 key，以及不属于可读文案的 value；
- import、export、ESM、MDX/JSX 标签名、属性名、属性值、表达式、嵌套和顺序；
- HTML 注释、条件发布标记和 `<!-- zdoc-preserved-esm:N -->`；
- 表格列数、列表层级、引用层级、Tabs/TabItem 顺序和文档结构。

代码块内的自然语言注释也属于代码，必须保持原文。只有当运行时明确将整个代码块标记为“localizable prose example”时，才允许翻译其中的提示词或展示文案；不得仅凭内容看起来像自然语言就自行翻译。

frontmatter 中只有明确的人类可读字段可翻译，例如 `title`、`sidebar_label`、`description` 和 `keywords` 的自然语言值。`slug`、`token`、`type`、布尔值、日期和结构字段不变。

## 6. 一致性规则

- 同一术语在同一篇、同一内容组和同一次 run 中只能使用一个规范译法。
- 标题、sidebar label、正文首次出现和相关链接文本应使用同一术语。
- 重复出现的固定句、参数说明和警告应复用已批准译文，不做无意义同义改写。
- 大小写有语义时必须保留，例如 `AutoID`、`AUTOINDEX`、`DataNode`、`QueryNode`。
- 同一概念的单复数变化不应导致不同中文译法。
- chunk 翻译必须利用 document title、previous translated heading 和术语表保持上下文连续，但不得重复相邻 chunk 的内容。

## 7. 中国站产品适用性

- 原文事实不自动等于中国站事实。翻译前应根据运行时提供的产品 profile 判断该段是否适用。
- 不得引入 Global 独有的云厂商、区域、支付方式、市场、模型提供商、Endpoint 或可用性声明。
- 中国站已有专用等价项时，使用产品 profile 或映射表中的等价项；没有映射时不得自行替换。
- 需要删除或替换整段 Global-only 内容时，应由上游选择或产品映射明确授权，不由 Translation Agent 静默决定。

## 8. Review Agent 契约

Reviewer 必须逐项对比 source 和 draft，只报告有精确证据的问题。建议使用以下 JSON：

```json
{
  "pass": false,
  "issues": [
    {
      "severity": "high",
      "type": "protected_content",
      "rule_id": "ZH-PROTECTED-001",
      "location": "fenced code block 2",
      "source_quote": "# Create a collection",
      "draft_quote": "# 创建 Collection",
      "comment": "A natural-language code comment was changed inside a protected fenced block.",
      "suggested_fix": "Restore the exact source comment."
    }
  ]
}
```

允许的主要问题类型：

- `accuracy_omission`
- `accuracy_addition`
- `accuracy_mistranslation`
- `product_claim`
- `terminology`
- `consistency`
- `untranslated_prose`
- `locale_style`
- `mdx_structure`
- `protected_content`
- `link_or_path`

Reviewer 证据规则：

- `source_quote` 必须是 source 中逐字存在的连续片段；`draft_quote` 必须是 draft 中逐字存在的连续片段。
- omission 问题应引用被遗漏的 source 片段，并在 `draft_quote` 中提供遗漏位置附近的实际上下文，不能伪造缺失文本。
- 声称 token、URL、锚点或代码发生变化时，必须同时给出不同的 source 和 draft 值；若两者相同，不得报错。
- 纯主观偏好、无法定位的“不自然”、没有违反本指南的同义表达，不得单独导致失败。
- 同一根因只报一次，不拆成多个重复问题。
- 如果没有可证实问题，必须返回 `{"pass":true,"issues":[]}`。

严重程度：

- `high`：意义丢失或新增、产品事实错误、Global-only 内容、受保护内容变化、链接/路径/锚点变化、结构损坏、无法编译；
- `medium`：强制术语不一致、跨段落不一致、明显未翻译正文、影响理解的中文表达；
- `low`：有明确规则依据但不影响含义的标点、空格或轻微风格问题。

## 9. Correction Agent 契约

Review JSON 是待验证的指控，不是可信事实。Correction Agent 必须：

1. 确认每个 `source_quote` 和 `draft_quote` 确实存在；
2. 重新对比 source、draft、术语表和规则；
3. 只修复被证实的问题；
4. 忽略引用不存在、source/draft 实际相同、与原文矛盾或违反受保护规则的 reviewer 指控；
5. 优先进行局部、最小修改，尽可能保持未涉及区域逐字不变；
6. 不因一个术语问题重写整段，不因一个风格问题重新翻译整篇；
7. 如果问题无法在不破坏受保护内容的前提下修复，保持受保护内容不变。

## 10. 验收清单

- 所有 fenced code block 与 source 逐字节相同，除非有明确 allowlist；
- 所有 inline code、URL、路径、锚点、ID、placeholder、import/export 和 MDX/JSX 结构一致；
- frontmatter key、结构字段和不可读 value 一致；
- 译文没有遗漏、增译、弱化或强化事实；
- 没有引入 Global-only 产品事实；
- 强制术语全部命中，`Compaction` 保留英文，未替换为“压缩”“压实”或其他中文术语；
- 全文统一使用“您”，没有无意的“你”；
- 标题、标点、数字、单位和中英文空格符合本指南；
- reviewer 每条 issue 均有可匹配证据；
- correction 只修改了被证实的问题。

## 11. 仓库依据与外部参考

仓库依据：

- `.github/prompts/codex-translation-agent.zh-CN-reference.md`
- `.github/prompts/codex-review-agent.zh-CN-reference.md`
- `content/zh-CN/guides/tutorials/collection/manage-collections.md`
- `content/zh-CN/guides/tutorials/schema/schema-explained.md`
- `content/zh-CN/guides/tutorials/analyzer/analyzer-overview.md`
- `content/zh-CN/guides/tutorials/access-control/access-control-overview.md`
- `content/zh-CN/guides/tutorials/faqs/faq-monitors-and-metrics.md`
- `scripts/translation/agentRunner.js`

本指南归纳了 289 个中文 Guides 文件。语料中“您”明显多于“你”，且 `Collection`、`Entity`、`Schema` 等产品概念已有稳定保留倾向；同时仍存在中英术语混用、中文代码注释和 `Compaction`/“压缩”混用。本指南选择统一规范，不把历史不一致继续固化。

外部参考：

- [Microsoft Localization Style Guides](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides)
- [Microsoft Simplified Chinese Style Guide](https://aka.ms/chinese-simplified-styleguide)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [W3C MQM Community Group](https://www.w3.org/community/mqmcg/)
- [Google Cloud Translation glossaries](https://cloud.google.com/translate/docs/advanced/glossary)
- [Amazon Translate custom terminology](https://aws.amazon.com/blogs/machine-learning/introducing-amazon-translate-custom-terminology/)
- [OASIS XLIFF 2.1](https://docs.oasis-open.org/xliff/xliff-core/v2.1/cos02/xliff-core-v2.1-cos02.html)

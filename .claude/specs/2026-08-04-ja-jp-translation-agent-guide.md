# 日文翻译 Agent 指南

状态：草案

适用范围：将英文 Zilliz Cloud / Milvus 开发者文档翻译为日文 MDX/Markdown，包括 Guides、BYOC、SDK Reference、REST Reference 与 Tools 内容。

## 1. 使用方式

本指南应作为 ja-JP Translation、Review 和 Correction Agent 的共同规范。运行时还应提供：

- locale `ja-JP`、产品范围、source path、target path 与 chunk metadata；
- 带版本号的日文术语表、禁止翻译表和 UI 字符串表；
- 明确允许本地化的特殊区域清单；
- 使用不同标签分隔的 source、draft 和 review JSON。

规则优先级从高到低如下：

1. 受保护内容和 MDX/Markdown 结构；
2. 原文事实和语义；
3. 强制术语表和禁止翻译表；
4. 跨文档一致性；
5. 自然、专业的日文技术写作风格。

### 1.1 推荐的 Prompt 组装方式

系统层加载本指南，运行时消息使用稳定标签，避免 source、draft 和 reviewer 指令相互污染：

```text
<translation_context>
locale: ja-JP
product_profile: Global
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

Review Agent 应分别接收 `<source>` 和 `<draft>`；Correction Agent 再额外接收 `<review_json>`。对 `collection`、`cluster`、`index`、片假名长音和代码注释保护等高频问题，可附带少量已批准的正反例。示例必须遵守当前 glossary，不能直接复制历史混用。

## 2. Translation Agent 契约

Translation Agent 必须：

- 只返回译文，不解释过程；
- 完整保留原文含义、条件、因果、限制和语气强度；
- 使用自然、简洁、适合开发者文档的日文；
- 将一般技术概念译为术语表规定的日文，不得因为它们是英文技术词就全部保留；
- 在 chunk 模式下只翻译当前连续片段，不补齐片段外结构；
- 无法确认官方译名时优先查术语表；术语表没有记录时保留原文并标记给后续维护流程，不自行创造多个译法。

Translation Agent 不得：

- 保留大段本可自然翻译的英文普通名词，例如连续使用 `collection schema field vector index`；
- 逐词照搬英语语序，产生“安全にスキップできます”“自己完結型サーバー”等不自然表达；
- 增加、删除、总结或改写产品事实；
- 修改代码、链接、锚点、标识符或文档结构；
- 在同一文档中混用 `collection`、`Collection` 和“コレクション”等多个表记。

## 3. 日文写作风格

### 3.1 文体和语气

- 正文统一使用「です・ます」体，不与「である」体混用。
- 操作步骤使用「〜してください」「〜します」；能力说明使用「〜できます」；必要条件使用「〜する必要があります」。
- 一般不直译英文 `you` 为「あなた」。可省略主语；只有需要区分操作者时才使用「ユーザー」。
- 保持专业、克制、明确。原文没有营销语气时，不添加「強力な」「画期的な」「最適な」等评价。
- 避免过度敬语。开发者文档使用清晰的丁寧語即可，不使用冗长的商务敬语。

### 3.2 句子和段落

- 一个句子只承载一个主要动作或结论。英语长句可拆分，但不得改变条件和逻辑关系。
- 优先采用日文自然语序，将前提放在动作之前，将核心谓语放在句末。
- 避免名词连续堆叠。必要时使用「の」「を使用した」「向けの」明确关系。
- 避免不自然的外来语串联；已有规范日文术语时应翻译。
- 使用「次の」「以下の」引出步骤、列表和示例；相关链接使用「詳しくは、…を参照してください」。

### 3.3 标题

- 标题不加句号。
- 操作标题使用辞书形，例如「コレクションを作成する」「インデックスを設定する」。
- 概念标题使用名词结构，例如「アクセス制御の概要」「整合性レベル」。
- 同级标题保持平行，不混用「X の作成」「X を作成する」「X の作成方法」。

### 3.4 标点、字符、数字和空格

- 日文正文使用「、。」「：」「（）」等日文全角标点。
- 拉丁字母、数字、代码和单位使用半角字符。
- 半角英文产品名或行内代码与日文助词之间保留一个半角空格，例如「Zilliz Cloud では」「`filter` を設定します」。
- 片假名术语与日文助词之间不加空格，例如「クラスターを作成します」。
- 数字与助数词之间保留一个半角空格，例如「1 つ」「3 個」；数字与单位之间保留空格，例如「10 ms」「5 GB」。
- 采用现代片假名长音表记，例如「サーバー」「クラスター」「ユーザー」。不得在同一内容组混用「サーバ/サーバー」「クラスタ/クラスター」。

### 3.5 UI、链接和提示框

- UI 标签以产品实际显示文本为准。界面没有日文化时，不自行创造日文按钮名。
- UI 标签保持原始大小写，并使用现有格式，例如「**Create Cluster** を選択します」。
- 翻译可见链接文本，但 URL、相对路径和锚点逐字不变。
- Admonition 标题优先使用「注」「注意」「警告」等稳定表记；MDX 组件和属性不变。

## 4. 日文术语规范

现有 ja-JP 文档存在大量英文原词和片假名混用。本指南给出推荐统一形式，历史频率不构成继续混用的理由。

### 4.1 保留英文或官方写法

以下内容默认不翻译，并保持大小写：

- `Zilliz Cloud`、`Milvus`、`BYOC`、`Serverless`、`Dedicated`、`Free`、`AUTOINDEX`；
- API、SDK、类、方法、字段、参数、枚举、环境变量、包名、命令和配置值；
- 云厂商、第三方产品、模型和协议的官方名称；
- 产品 profile 或 UI glossary 明确要求保留的组合名，例如 `Serving Cluster`；
- `Compaction`。

`Compaction` 是具体的数据维护过程，不得泛化为「圧縮」。需要解释时可写「Compaction によるセグメント統合」，后续继续使用 `Compaction`。

### 4.2 推荐译法

| 英文概念 | 日文规范 | 说明 |
| --- | --- | --- |
| collection | コレクション | 标识符和官方 UI 文本除外 |
| entity | エンティティ | 不保留小写 `entity` |
| schema | スキーマ | API/变量名不变 |
| database | データベース | 官方组合名除外 |
| cluster | クラスター | `Serving Cluster` 等官方名按 glossary |
| partition | パーティション | 不混用英文 |
| shard | シャード | 统一长音表记 |
| segment | セグメント | `segment_id` 等标识符不变 |
| replica | レプリカ | `Replica` 角色或 UI 文本按 glossary |
| alias | エイリアス | API 名不变 |
| field | フィールド | 字段名使用行内代码并保持原文 |
| vector / scalar | ベクトル / スカラー | 类型名不变 |
| index | インデックス | 索引类型名不变 |
| search / query | 検索 / クエリ | 方法名和请求类型不变 |
| load / release | ロード / リリース | API 操作名不变 |
| embedding | 埋め込み | 首次可写「ベクトル埋め込み（Embedding）」 |
| reranking | 再ランキング | 官方 Ranker 名称不变 |
| analyzer | アナライザー | 配置 key `analyzer` 不变 |
| tokenizer | トークナイザー | 配置值不变 |
| token | トークン | 鉴权语境可写「アクセストークン」 |
| filter | フィルター / フィルタリング条件 | 组件与查询语境区分 |
| primary key | 主キー | 不使用 `primary key` 普通文本 |
| metadata | メタデータ | 统一片假名 |
| consistency level | 整合性レベル | 不混用「一貫性レベル」 |
| endpoint | エンドポイント | URL 和 placeholder 不变 |
| API key | API キー | 保留半角空格 |
| web console | Zilliz Cloud コンソール | UI 文本按实际产品 |
| full-text search | 全文検索 | 标题和正文统一 |
| hybrid search | ハイブリッド検索 | 不保留小写英文短语 |
| approximate nearest neighbor | 近似最近傍（ANN） | 首次展开，后续使用 ANN |
| memory mapping | メモリマッピング（mmap） | 后续使用 `mmap` |

### 4.3 术语消歧

- `function` 表示 Milvus 产品能力时按产品术语表使用 `Function`；表示编程语言函数时使用「関数」。
- `field` 表示概念时使用「フィールド」；实际字段名保持原文并使用行内代码。
- `search` 在自然语言中使用「検索」；`query` 作为名词使用「クエリ」。`search()`、`query()`、`SearchReq` 等保持原文。
- `token` 在文本分析中使用「トークン」，在鉴权中根据上下文使用「トークン」或「アクセストークン」；参数名不变。
- `compression` 可译为「圧縮」；`Compaction` 必须保留。

## 5. 受保护内容

除非运行时明确标记某个区域允许本地化，否则以下内容必须逐字节保持不变：

- 完整 fenced code block，包括语言标签、缩进、空行、自然语言注释、字符串、示例输出和结尾换行；
- 行内代码；
- 命令、API 名称、签名、类名、方法名、字段名、参数名、枚举、占位符和环境变量；
- URL、相对路径、文件路径、图片地址、锚点和 ID；
- YAML frontmatter key 和非人类可读 value；
- import、export、ESM、MDX/JSX 标签名、属性名、属性值、表达式、嵌套和顺序；
- HTML 注释、条件发布标记和 `<!-- zdoc-preserved-esm:N -->`；
- 表格列数、列表层级、Tabs/TabItem 顺序和文档结构。

代码块内的英文注释也必须保持英文。只有整个代码块被明确标记为可本地化的自然语言示例时，才允许翻译其中的 prompt 或展示文本。

frontmatter 只翻译明确的人类可读字段，例如 `title`、`sidebar_label`、`description` 和 `keywords` 的自然语言值。`slug`、`token`、`type`、布尔值、日期和结构字段保持不变。

## 6. 一致性规则

- 同一概念在同一篇、同一内容组和同一次 run 中只使用一个规范表记。
- 标题、sidebar label、正文首次出现和链接文本应保持一致。
- 不因英语大小写或单复数变化改变日文译法。
- 同一产品名不得在 `Serving Cluster`、`serving cluster`、`Serving クラスター` 之间随意切换；以 glossary 的精确 entry 为准。
- 片假名长音、数字与助数词空格、英文产品名与助词空格必须全文一致。
- 重复参数说明和警告应复用已批准译文，不做无意义的同义改写。
- chunk 翻译必须利用 document title、previous translated heading 和术语表保持连续性，但不得重复相邻 chunk。

## 7. Review Agent 契约

Reviewer 必须逐项对比 source 和 draft，只报告有精确证据的问题。建议 JSON：

```json
{
  "pass": false,
  "issues": [
    {
      "severity": "medium",
      "type": "terminology",
      "rule_id": "JA-TERM-001",
      "location": "paragraph after Overview heading",
      "source_quote": "Create a collection and build an index.",
      "draft_quote": "collection を作成し、index を構築します。",
      "comment": "General technical concepts should use the canonical Japanese terms.",
      "suggested_fix": "コレクションを作成し、インデックスを構築します。"
    }
  ]
}
```

允许的主要问题类型：

- `accuracy_omission`
- `accuracy_addition`
- `accuracy_mistranslation`
- `terminology`
- `consistency`
- `untranslated_prose`
- `locale_style`
- `mdx_structure`
- `protected_content`
- `link_or_path`

Reviewer 证据规则：

- `source_quote` 和 `draft_quote` 必须分别是 source 和 draft 中逐字存在的连续片段。
- omission 应引用被遗漏的 source，并引用 draft 中相邻的真实上下文，不得伪造缺失文本。
- 声称 token、URL、锚点或代码被修改时，必须展示不同的 source/draft 值；值相同则不得报错。
- 只有能指出具体不自然表达和违反的规则时，才报告 `locale_style`；笼统的「日本語が不自然」不是有效 issue。
- 纯个人偏好或术语表允许的变体不得导致失败。
- 同一根因只报一次。
- 无可证实问题时返回 `{"pass":true,"issues":[]}`。

严重程度：

- `high`：意义丢失或新增、产品事实错误、受保护内容变化、链接/锚点/路径变化、结构损坏、无法编译；
- `medium`：强制术语错误、跨段落不一致、明显未翻译普通英文、严重翻译腔或文体混用；
- `low`：有明确规则依据但不影响含义的标点、空格、长音或轻微风格问题。

## 8. Correction Agent 契约

Review JSON 是待验证的指控，不是可信事实。Correction Agent 必须：

1. 验证 `source_quote` 和 `draft_quote` 均存在；
2. 重新对比 source、draft、术语表和规则；
3. 只修复被证实的问题；
4. 忽略引用不存在、source/draft 实际相同、与原文矛盾或要求修改受保护内容的 reviewer 指控；
5. 采用局部最小修改，尽可能保持其他内容逐字不变；
6. 不因一个片假名或空格问题重写整段或整篇；
7. 无法安全修复时保持受保护内容不变。

## 9. 日文质量检查

- 是否统一使用「です・ます」体；
- 是否避免了不必要的「あなた」；
- 是否把一般技术概念翻译成规范日文，而不是大段保留小写英文；
- 是否消除了 `collection/コレクション`、`cluster/クラスター`、`index/インデックス` 等混用；
- 是否采用「サーバー」「クラスター」「ユーザー」等统一长音表记；
- 是否使用日文标点、半角数字和正确空格；
- 是否避免英语语序和不自然直译；
- 是否完整保留原文事实和语气强度；
- 是否逐字节保留所有受保护内容；
- reviewer 是否为每条 issue 提供精确可匹配证据；
- correction 是否只改动被证实问题。

## 10. 仓库依据与外部参考

仓库依据：

- `.github/prompts/codex-translation-agent.ja-JP.md`
- `.github/prompts/codex-review-agent.ja-JP.md`
- `.github/prompts/codex-correction-agent.md`
- `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/get-started/quickstarts/quick-start.md`
- `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/development/collection/manage-collections.md`
- `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/development/schema/schema-explained.md`
- `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/development/analyzer/analyzer-overview.md`
- `scripts/translation/agentRunner.js`

本指南分析了当前 358 个 ja-JP Guides 文件。现有语料中 `collection/コレクション`、`cluster/クラスター`、`index/インデックス`、`schema/スキーマ` 等大量并存，且代码块中可见被日文化的注释。因此现有日文只用于发现问题和提取稳定句式，不作为无条件术语权威。

外部参考：

- [Microsoft Localization Style Guides](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides)
- [Microsoft Japanese Style Guide](https://aka.ms/japanese-styleguide)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [W3C Requirements for Japanese Text Layout](https://www.w3.org/TR/jlreq/)
- [W3C MQM Community Group](https://www.w3.org/community/mqmcg/)
- [Google Cloud Translation glossaries](https://cloud.google.com/translate/docs/advanced/glossary)
- [Amazon Translate custom terminology](https://aws.amazon.com/blogs/machine-learning/introducing-amazon-translate-custom-terminology/)
- [OASIS XLIFF 2.1](https://docs.oasis-open.org/xliff/xliff-core/v2.1/cos02/xliff-core-v2.1-cos02.html)

---
title: "最佳实践：如何选择合适的 Analyzer | Cloud"
slug: /choose-the-right-analyzer-for-your-use-case
sidebar_label: "最佳实践：如何选择合适的 Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: Sotxw9TeRiM6U1k2aQ7cc3SUn9d
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 最佳实践：如何选择合适的 Analyzer

<Admonition type="info" icon="📘" title="说明">

本指南侧重于 Analyzer 选择的实际决策方法。关于 Analyzer 组件的技术细节以及如何添加 Analyzer 参数，请参考 [Analyzer 概述](./analyzer-overview)。

</Admonition>

## 快速了解 Analyzer\{#quick-concept-how-analyzers-work}

在 Zilliz Cloud 中，Analyzer 会处理存储在字段中的文本，使其可用于 [Full Text Search](./full-text-search)（BM25）、[Phrase Match](./phrase-match) 或 [Text Match](./text-match)。可以将它视作一个文本处理器，把原始内容转化为可搜索的 token。一个 Analyzer 的工作分为两个阶段：

![HZhjw5hTuhfOIebOsnOcmy8Hnuf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/HZhjw5hTuhfOIebOsnOcmy8Hnuf.png)

1. **分词 (Tokenization, 必需)**：通过 tokenizer 将连续的文本拆分为独立且有意义的 token。不同语言和内容类型的分词方式差异很大。

1. **Token 过滤 (可选)**：在分词后应用过滤器，用于修改、删除或优化 token。例如，将所有 token 转换为小写、去掉常见停用词，或将单词还原为词根。

**示例**：

```plaintext
输入: "Hello World!" 
       1. 分词 → ["Hello", "World", "!"]
       2. 小写与标点过滤 → ["hello", "world"]
```

## 为什么选择合适的 Analyzer 很重要\{#why-the-choice-of-analyzer-matters}

选择不当的 Analyzer 可能导致相关文档无法被搜索到，或返回无关结果。

下表总结了因错误选择 Analyzer 而导致的常见问题，并提供了可操作的解决方案：

<table>
   <tr>
     <th><p><strong>问题</strong></p></th>
     <th><p><strong>症状</strong></p></th>
     <th><p><strong>示例</strong></p></th>
     <th><p><strong>错误原因</strong></p></th>
     <th><p><strong>解决方案</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>过度分词</strong></p></td>
     <td><p>技术术语、标识符或 URL 搜索不到</p></td>
     <td><ul><li><p><code>"user_id"</code> → <code>['user','id']</code></p></li><li><p><code>"C++"</code> → <code>['c']</code></p></li></ul></td>
     <td><p><a href="./standard-tokenizer">standard</a> Analyzer</p></td>
     <td><p>使用 <a href="./whitespace-tokenizer">whitespace</a> tokenizer 并结合 <a href="./alphanumonly-filter">alphanumonly</a> 过滤器</p></td>
   </tr>
   <tr>
     <td><p><strong>分词不足</strong></p></td>
     <td><p>多词短语的一部分无法匹配完整短语</p></td>
     <td><p><code>"state-of-the-art"</code> → <code>['state-of-the-art']</code></p></td>
     <td><p>使用 <a href="./whitespace-tokenizer">whitespace</a> tokenizer</p></td>
     <td><p>使用 <a href="./standard-tokenizer">standard</a> tokenizer，并配合 <a href="./regex-filter">regex</a> 过滤器</p></td>
   </tr>
   <tr>
     <td><p><strong>语言不匹配</strong></p></td>
     <td><p>特定语言搜索无效或结果异常</p></td>
     <td><p><code>"机器学习"</code> → <code>['机器学习']</code></p></td>
     <td><p>使用 <a href="./english-analyzer">english</a> Analyzer</p></td>
     <td><p>使用特定语言的 Analyzer，如 <a href="./chinese-analyzer">Chinese</a></p></td>
   </tr>
</table>

## 第一步：你是否需要选择 Analyzer？\{#first-question-do-you-need-to-choose-an-analyzer}

如果未指定 Analyzer，在使用全文检索等功能时，Zilliz Cloud 会自动应用 **[standard** ](./standard-analyzer)[Analyzer](./standard-analyzer)。

它会：

- 按空格和标点分词

- 将所有 token 转为小写

- 移除内置的常见英文停用词和大多数标点

**示例**：

```plaintext
输入:  "The Milvus vector database is built for scale!"
输出: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'scale']
```

## 第二步：判断 Standard Analyzer 是否满足业务需求\{#step-2-check-if-the-standard-analyzer-meets-your-needs}

使用下表快速判断默认的 [Standard Analyzer](./standard-analyzer) 是否满足你的需求。如果不满足，你需要[通过不同路径](./choose-the-right-analyzer-for-your-use-case#step-3-choose-your-path)选择其他 Analyzer。

| **内容** | **standard Analyzer 是否合适？** | **原因** | **需要什么** |
| --- | --- | --- | --- |
| 英文博客 | ✅ 是 | 默认即可 | 使用默认 |
| 中文文档 | ❌ 否 | 中文无空格，整段视作单 token | 使用内置 [chinese](./chinese-analyzer) Analyzer |
| 技术文档 | ❌ 否 | 符号丢失，如 C++ → C | 使用 [whitespace](./whitespace-tokenizer) tokenizer + [alphanumonly](./alphanumonly-filter) filter |
| 法语/西班牙语 | ⚠️ 可能 | café 与 cafe 不匹配 | 使用 [asciifolding](./ascii-folding-filter) filter |
| 多语言或未知语言 | ❌ 否 | standard 无法处理不同字符集 | 使用 [icu](./icu-tokenizer) tokenizer 或多语言方案 |

## 第三步：通过不同路径选择 Analyzer\{#step-3-choose-your-path}

如果默认的标准分析器无法满足需求，请选择以下两种路径之一：

- **路径 A**：使用内置 Analyzer（开箱即用的语言专用 Analyzer）

- **路径 B**：创建自定义 Analyzer（手动定义 Tokenizer 和一组 Filter）

### 路径 A：使用内置 Analyzer\{#path-a-use-built-in-analyzers}

内置 Analyzer 是预配置方案，适合常见语言。

#### 可选内置 Analyzer\{#available-built-in-analyzers}

<table>
   <tr>
     <th><p><strong>Analyzer</strong></p></th>
     <th><p><strong>语言支持</strong></p></th>
     <th><p><strong>组件</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-analyzer">standard</a></p></td>
     <td><p>英语/法语/西班牙语等</p></td>
     <td><ul><li><p>Tokenizer: <code>standard</code></p></li><li><p>Filters: <code>lowercase</code></p></li></ul></td>
     <td><p>通用方案</p></td>
   </tr>
   <tr>
     <td><p><a href="./english-analyzer">english</a></p></td>
     <td><p>英语</p></td>
     <td><ul><li><p>Tokenizer: <code>standard</code></p></li><li><p>Filters: <code>lowercase</code>, <code>stemmer</code>, <code>stop</code></p></li></ul></td>
     <td><p>英语专用，推荐</p></td>
   </tr>
   <tr>
     <td><p><a href="./chinese-analyzer">chinese</a></p></td>
     <td><p>中文</p></td>
     <td><ul><li><p>Tokenizer: <code>jieba</code></p></li><li><p>Filters: <code>cnalphanumonly</code></p></li></ul></td>
     <td><p>默认简体字典</p></td>
   </tr>
</table>

#### 示例\{#implementation-example}

```python
# Using built-in English analyzer
analyzer_params = {
    "type": "english"
}

# Applying analyzer config to target VARCHAR field in your collection schema
schema.add_field(
    field_name='text',
    datatype=DataType.VARCHAR,
    max_length=200,
    enable_analyzer=True,
    # highlight-next-line
    analyzer_params=analyzer_params,
)
```

### 路径 B：创建自定义 Analyzer\{#path-b-create-a-custom-analyzer}

当内置选项不足时，可以通过 **tokenizer + filter** 自由组合。

#### 步骤 1：选择 tokenizer\{#step-1-select-the-tokenizer-based-on-language}

根据语言选择合适的 tokenizer：

##### 西方语言\{#western-languages}

对于通过空格分隔的语言，有以下选择：

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>工作原理</p></th>
     <th><p>适用场景</p></th>
     <th><p>示例</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a></p></td>
     <td><p>基于空格和标点拆分文本</p></td>
     <td><p>通用文本，包含混合标点的内容</p></td>
     <td><ul><li><p>输入: <code>"Hello, world! Visit example.com"</code></p></li><li><p>输出: <code>['Hello', 'world', 'Visit', 'example', 'com']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a></p></td>
     <td><p>仅基于空格字符拆分</p></td>
     <td><p>已预处理的内容，用户自定义格式的文本</p></td>
     <td><ul><li><p>输入: <code>"user_id = get_user_data()"</code></p></li><li><p>输出: <code>['user_id', '=', 'get_user_data()']</code></p></li></ul></td>
   </tr>
</table>

##### 东亚语言\{#east-asian-languages}

基于词典的语言需要专用的 tokenizer 才能进行正确的分词：

##### 中文\{#chinese}

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>工作原理</p></th>
     <th><p>适用场景</p></th>
     <th><p>示例</p></th>
   </tr>
   <tr>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a></p></td>
     <td><p>基于中文词典的分词，结合智能算法</p></td>
     <td><p>推荐用于中文内容——结合词典与智能算法，专为中文设计</p></td>
     <td><ul><li><p>输入: <code>"机器学习是人工智能的一个分支"</code></p></li><li><p>输出: <code>['机器', '学习', '是', '人工', '智能', '人工智能', '的', '一个', '分支']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p>纯词典驱动的中文形态学分析（使用 <a href="https://cc-cedict.org/wiki/">cc-cedict</a> 词典）</p></td>
     <td><p>为日韩分词设计，也可用于分词中文，但性能不如 jieba</p></td>
     <td><ul><li><p>输入: <code>"机器学习算法"</code></p></li><li><p>输出: <code>["机器", "学习", "算法"]</code></p></li></ul></td>
   </tr>
</table>

##### 日语和韩语\{#japanese-and-korean}

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>工作原理</p></th>
     <th><p>适用场景</p></th>
     <th><p>示例</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p>Japanese</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://taku910.github.io/mecab/">ipadic</a> (通用), <a href="https://github.com/neologd/mecab-ipadic-neologd">ipadic-neologd</a> (现代词汇), <a href="https://clrd.ninjal.ac.jp/unidic/">unidic</a> (学术)</p></td>
     <td><p>形态学分析，支持专有名词处理</p></td>
     <td><ul><li><p>输入: <code>"東京都渋谷区"</code></p></li><li><p>输出: <code>["東京", "都", "渋谷", "区"]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p>Korean</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/">ko-dic</a></p></td>
     <td><p>韩语形态学分析</p></td>
     <td><ul><li><p>输入: <code>"안녕하세요"</code></p></li><li><p>输出: <code>["안녕", "하", "세요"]</code></p></li></ul></td>
   </tr>
</table>

##### 多语言或未知语言\{#multilingual-or-unknown-languages}

适用于文档中语言不可预测或混合的情况：

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>工作原理</p></th>
     <th><p>适用场景</p></th>
     <th><p>示例</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./icu-tokenizer"><code>icu</code></a></p></td>
     <td><p>基于 Unicode 的分词（ICU - International Components for Unicode）</p></td>
     <td><p>混合文字、未知语言，或只需简单分词时</p></td>
     <td><ul><li><p>输入: <code>"Hello 世界 مرحبا"</code></p></li><li><p>输出: <code>['Hello', ' ', '世界', ' ', 'مرحبا']</code></p></li></ul></td>
     <td></td>
   </tr>
</table>

**icu 的使用场景**：

- 内容包含混合语言，且语言识别不可行。

- 不希望使用多语言 Analyzer 或 language identifier 带来的额外开销。

- 文本以某一主语言为主，夹杂少量外语单词，这些外语对整体语义影响不大（如英文文本中偶尔出现日语/法语品牌名或技术术语）。

**替代方案**：如果需要更精确地处理多语言内容，建议使用 [多语言 Analyzer](./multi-language-analyzers) 或 [Language Identifier](./language-identifier-tokenizer)。

#### 步骤 2：添加过滤器以提高精度\{#step-2-add-filters-for-precision}

在选择好 tokenizer 之后，根据你的具体搜索需求和内容特性应用过滤器。

##### 常用过滤器\{#commonly-used-filters}

这些过滤器在大多数以空格分隔的语言（英语、法语、德语、西班牙语等）中至关重要，并能显著提升搜索质量：

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>工作原理</p></th>
     <th><p>使用场景</p></th>
     <th><p>示例</p></th>
   </tr>
   <tr>
     <td><p><a href="./lowercase-filter"><code>lowercase</code></a></p></td>
     <td><p>将所有 token 转换为小写</p></td>
     <td><p>通用——适用于所有区分大小写的语言</p></td>
     <td><ul><li><p>输入: <code>["Apple", "iPhone"]</code></p></li><li><p>输出: <code>[['apple'], ['iphone']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stemmer-filter"><code>stemmer</code></a></p></td>
     <td><p>将单词还原为词根</p></td>
     <td><p>适用于有词形变化的语言（英语、法语、德语等）</p></td>
     <td><p>英语示例：</p><ul><li><p>输入: <code>["running", "runs", "ran"]</code></p></li><li><p>输出: <code>[['run'], ['run'], ['ran']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stop-filter"><code>stop</code></a></p></td>
     <td><p>移除常见的无意义词（停用词）</p></td>
     <td><p>大多数语言，尤其是空格分隔的语言</p></td>
     <td><ul><li><p>输入: <code>["the", "quick", "brown", "fox"]</code></p></li><li><p>输出: <code>[[], ['quick'], ['brown'], ['fox']]</code></p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

对于东亚语言（中文、日语、韩语等），请重点使用语言特定的过滤器。这些语言的文本处理方式不同，通常不需要或无法从词干提取中获益。

</Admonition>

##### 文本规范化过滤器\{#text-normalization-filters}

这些过滤器用于标准化文本差异，提高匹配一致性：

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>工作原理</p></th>
     <th><p>使用场景</p></th>
     <th><p>示例</p></th>
   </tr>
   <tr>
     <td><p><a href="./ascii-folding-filter"><code>asciifolding</code></a></p></td>
     <td><p>将带重音符的字符转换为 ASCII 等效字符</p></td>
     <td><p>国际化内容、用户生成内容</p></td>
     <td><ul><li><p>输入: <code>["café", "naïve", "résumé"]</code></p></li><li><p>输出: <code>[['cafe'], ['naive'], ['resume']]</code></p></li></ul></td>
   </tr>
</table>

##### Token 过滤\{#token-filtering}

这些过滤器控制哪些 token 会被保留，通常基于字符类型或长度：

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>工作原理</p></th>
     <th><p>使用场景</p></th>
     <th><p>示例</p></th>
   </tr>
   <tr>
     <td><p><a href="./remove-punct-filter"><code>removepunct</code></a></p></td>
     <td><p>移除单独存在的标点 token</p></td>
     <td><p>清理 <code>jieba</code>、<code>lindera</code>、<code>icu</code> 输出中的单独标点</p></td>
     <td><ul><li><p>输入: <code>["Hello", "!", "world"]</code></p></li><li><p>输出: <code>[['Hello'], ['world']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./alphanumonly-filter"><code>alphanumonly</code></a></p></td>
     <td><p>仅保留字母和数字</p></td>
     <td><p>技术类内容、干净的文本处理</p></td>
     <td><ul><li><p>输入: <code>["user123", "test@email.com"]</code></p></li><li><p>输出: <code>[['user123'], ['test', 'email', 'com']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./length-filter"><code>length</code></a></p></td>
     <td><p>移除超出指定长度范围的 token</p></td>
     <td><p>过滤噪声（如过长的 token）</p></td>
     <td><ul><li><p>输入: <code>["a", "very", "extraordinarily"]</code></p></li><li><p>输出: <code>[['a'], ['very'], []]</code> (if <strong>max=10</strong>)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./regex-filter"><code>regex</code></a></p></td>
     <td><p>基于自定义模式的过滤</p></td>
     <td><p>特定领域的 token 需求</p></td>
     <td><ul><li><p>输入: <code>["test123", "prod456"]</code></p></li><li><p>输出: <code>[[], ['prod456']]</code> (if <strong>expr="^prod"</strong>)</p></li></ul></td>
   </tr>
</table>

##### 语言特定过滤器\{#language-specific-filters}

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>Language</p></th>
     <th><p>How It Works</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./decompounder-filter"><code>decompounder</code></a></p></td>
     <td><p>德语</p></td>
     <td><p>将复合词拆分为可搜索的组成部分</p></td>
     <td><ul><li><p>输入: <code>["dampfschifffahrt"]</code></p></li><li><p>输出: <code>[['dampf', 'schiff', 'fahrt']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cnalphanumonly-filter">cnalphanumonly</a></p></td>
     <td><p>中文</p></td>
     <td><p>保留中文字符 + 字母数字</p></td>
     <td><ul><li><p>输入: <code>["Hello", "世界", "123", "!@#"]</code></p></li><li><p>输出: <code>[['Hello'], ['世界'], ['123'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cncharonly-filter"><code>cncharonly</code></a></p></td>
     <td><p>中文</p></td>
     <td><p>仅保留中文字符</p></td>
     <td><ul><li><p>输入: <code>["Hello", "世界", "123"]</code></p></li><li><p>输出: <code>[[], ['世界'], []]</code></p></li></ul></td>
   </tr>
</table>

#### 步骤 3：组合并实现\{#step-3-combine-and-implement}

要创建自定义 Analyzer，需要在 `analyzer_params` 字典中定义 tokenizer 和过滤器列表。
 这些过滤器会按照定义的顺序依次应用。

```python
# Example: A custom analyzer for technical content
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase", "alphanumonly"]
}

# Applying analyzer config to target VARCHAR field in your collection schema
schema.add_field(
    field_name='text',
    datatype=DataType.VARCHAR,
    max_length=200,
    enable_analyzer=True,
    # highlight-next-line
    analyzer_params=analyzer_params,
)
```

#### 最终步骤：使用 run_analyzer 进行测试\{#final-test-with-run_analyzer}

在将配置应用到 Collection 之前，务必先验证：

```python
# Sample text to analyze
sample_text = "The Milvus vector database is built for scale!"

# Run analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

**需要检查的常见问题**

- **过度分词**：技术术语被错误拆分

- **分词不足**：短语未被正确拆分

- **token 丢失**：重要词被过滤掉

更多用法请参考 [run_analyzer](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md)。

## 按使用场景推荐的配置\{#recommended-configurations-by-use-case}

本节为在 Zilliz Cloud 中使用 Analyzer 时的常见场景，提供推荐的 tokenizer 与 filter 组合。请选择最适合你内容类型和搜索需求的配置。

<Admonition type="info" icon="📘" title="说明">

在将 Analyzer 应用到 Collection 前，建议先使用 **run_analyzer** 来测试和验证文本分析效果。

</Admonition>

### 英文\{#english}

```json
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "english"
        },
        {
            "type": "stop",
            "stop_words": [
                "_english_"
            ]
        }
    ]
}
```

### 中文\{#chinese}

```json
{
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
}
```

### 阿拉伯语\{#arabic}

```python
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "arabic"
        }
    ]
}
```

### 孟加拉语\{#bengali}

```python
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 法语\{#french}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "french"
        },
        {
            "type": "stop",
            "stop_words": [
                "_french_"
            ]
        }
    ]
}
```

### 德语\{#german}

```json
{
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic"
    },
    "filter": [
        "removepunct"
    ]
}
```

### 印度语\{#hindi}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 韩语\{#korean}

```json
{
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
}
```

### 日语\{#japanese}

```json
{
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic"
    },
    "filter": [
        "removepunct"
    ]
}
```

### 葡萄牙语\{#portuguese}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "portuguese"
        },
        {
            "type": "stop",
            "stop_words": [
                "_portuguese_"
            ]
        }
    ]
}
```

### 俄语\{#russian}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "russian"
        },
        {
            "type": "stop",
            "stop_words": [
                "_russian_"
            ]
        }
    ]
}
```

### 西班牙语\{#spanish}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "spanish"
        },
        {
            "type": "stop",
            "stop_words": [
                "_spanish_"
            ]
        }
    ]
}
```

### 斯瓦希里语\{#swahili}

```json
{
    "tokenizer": "standard",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 土耳其语\{#turkish}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "turkish"
        }
    ]
}
```

### 乌尔都语\{#urdu}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 混合或多语言内容\{#mixed-or-multilingual-content}

当处理跨多种语言或文字体系不可预测的内容时，建议使用 `icu` analyzer。 该 Analyzer 具备 Unicode 识别能力，能有效处理混合文字和符号。

**基础多语言配置**（不包含词干提取）：

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
}
```

**高级多语言处理**：

- 使用 multi-language analyzer 配置。详情参见[多语言 Analyzer](./multi-language-analyzers)。

- 在内容中实现 language identifier。详情参见 [Language Identifier](./language-identifier-tokenizer)。

## 在 Zilliz Cloud 配置和预览 Analyzer\{#zilliz-cloud-analyzer}

你可以直接在 Zilliz Cloud 控制台中配置和测试 Analyzer，而无需编写代码。具体可参考如下演示。

<Supademo id="cmfxiu7c342st10k8ql0xi1av" title=""  />


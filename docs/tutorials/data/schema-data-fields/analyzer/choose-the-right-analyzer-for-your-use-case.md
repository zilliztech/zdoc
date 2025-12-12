---
title: "Choose the Right Analyzer for Your Use Case | Cloud"
slug: /choose-the-right-analyzer-for-your-use-case
sidebar_label: "Best Practice"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide helps you select and configure the most suitable analyzer for your text content in Zilliz Cloud. | Cloud"
type: origin
token: Pulhw06e5iXJTFkidFXcGbylnod
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - best
  - practice
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Choose the Right Analyzer for Your Use Case

This guide helps you select and configure the most suitable **analyzer** for your text content in Zilliz Cloud.

It focuses on **practical decision-making**: what analyzer to use, when to customize one, and how to verify your configuration. For background on analyzer components and parameters, see [Analyzer Overview](./analyzer-overview).

## Quick concept: How analyzers work\{#quick-concept-how-analyzers-work}

An analyzer processes textual data so that it becomes searchable for features like [full text search](./full-text-search) (BM25-based), [phrase match](./phrase-match), or [text match](./text-match). It transforms your raw text into discrete searchable tokens through a two-stage pipeline.

![JwMZwIYUwhbSZ4bjhxcc1PfNnvx](https://zdoc-images.s3.us-west-2.amazonaws.com/JwMZwIYUwhbSZ4bjhxcc1PfNnvx.png)

1. **Tokenization (required):** This initial stage applies a **tokenizer** to break a continuous string of text into discrete, meaningful units called tokens. The tokenization method can vary significantly depending on the language and content type.

1. **Token filtering (optional):** After tokenization, **filters** are applied to modify, remove, or refine the tokens. These operations can include converting all tokens to lowercase, removing common meaningless words (such as stopwords), or reducing words to their root form (stemming).

Example:

```plaintext
Input: "Hello World!" 
       1. Tokenization → ["Hello", "World", "!"]
       2. Lowercase & Punctuation Filtering → ["hello", "world"]
```

## Why the choice of analyzer matters\{#why-the-choice-of-analyzer-matters}

The analyzer you choose directly affects **search quality and relevance**.

An inappropriate analyzer can cause either under- or over-tokenization, missing terms, or irrelevant results.

<table>
   <tr>
     <th><p>Problem</p></th>
     <th><p>Symptom</p></th>
     <th><p>Example (Input &amp; Output)</p></th>
     <th><p>Cause (Bad Analyzer)</p></th>
     <th><p>Solution (Good Analyzer)</p></th>
   </tr>
   <tr>
     <td><p>Over-tokenization</p></td>
     <td><p>Technical terms, identifiers, or URLs split incorrectly</p></td>
     <td><ul><li><p><code>"user_id"</code> → <code>['user', 'id']</code></p></li><li><p><code>"C++"</code> → <code>['c']</code></p></li></ul></td>
     <td><p><a href="./standard-analyzer"><code>standard</code></a> analyzer</p></td>
     <td><p>Use a <a href="./whitespace-tokenizer"><code>whitespace</code></a> tokenizer; combine with an <a href="./alphanumonly-filter"><code>alphanumonly</code></a> filter.</p></td>
   </tr>
   <tr>
     <td><p>Under-tokenization</p></td>
     <td><p>Multi-word phrases treated as single token</p></td>
     <td><p><code>"state-of-the-art"</code> → <code>['state-of-the-art']</code></p></td>
     <td><p>Analyzer with a <a href="./whitespace-tokenizer"><code>whitespace</code></a> tokenizer</p></td>
     <td><p>Use a <a href="./standard-tokenizer"><code>standard</code></a> tokenizer to split on punctuation and spaces; use a custom <a href="./regex-filter">regex</a> filter.</p></td>
   </tr>
   <tr>
     <td><p>Language Mismatches</p></td>
     <td><p>Foreign-language results meaningless</p></td>
     <td><p>Chinese text: <code>"机器学习"</code> → <code>['机器学习']</code> (one token)</p></td>
     <td><p><a href="./english-analyzer"><code>english</code></a> analyzer</p></td>
     <td><p>Use a language-specific analyzer, such as <a href="./chinese-analyzer"><code>chinese</code></a>.</p></td>
   </tr>
</table>

## Step 1: Do you need to choose an analyzer?\{#step-1-do-you-need-to-choose-an-analyzer}

If you’re using text retrieval features (e.g., **full text search**, **phrase match**, or **text match**) but **don’t explicitly specify an analyzer**,

Zilliz Cloud automatically applies the [standard analyzer](./standard-analyzer).

**Standard analyzer behavior**:

- Splits text on spaces and punctuation

- Converts all tokens to lowercase

**Example transformation**:

```plaintext
Input:  "The Milvus vector database is built for scale!"
Output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

## Step 2: Check if the standard analyzer meets your needs\{#step-2-check-if-the-standard-analyzer-meets-your-needs}

Use this table to quickly determine if the default [`standard`](./standard-analyzer)[ analyzer](./standard-analyzer) meets your needs. If it doesn't, you'll need to [choose a different path](./choose-the-right-analyzer-for-your-use-case#step-3-choose-your-path).

<table>
   <tr>
     <th><p>Your Content</p></th>
     <th><p>Standard Analyzer OK?</p></th>
     <th><p>Why</p></th>
     <th><p>What You Need</p></th>
   </tr>
   <tr>
     <td><p>English blog posts</p></td>
     <td><p>✅ Yes</p></td>
     <td><p>Default behavior is sufficient.</p></td>
     <td><p>Use the default (no configuration needed).</p></td>
   </tr>
   <tr>
     <td><p>Chinese documents</p></td>
     <td><p>❌ No</p></td>
     <td><p>Chinese words have no spaces and will be treated as one token.</p></td>
     <td><p>Use a built-in <a href="./chinese-analyzer"><code>chinese</code></a> analyzer.</p></td>
   </tr>
   <tr>
     <td><p>Technical documentation</p></td>
     <td><p>❌ No</p></td>
     <td><p>Punctuation is stripped from terms like <code>C++</code>.</p></td>
     <td><p>Create a custom analyzer with a <a href="./whitespace-tokenizer"><code>whitespace</code></a> tokenizer and an <a href="./alphanumonly-filter"><code>alphanumonly</code></a> filter.</p></td>
   </tr>
   <tr>
     <td><p>Space-separated languages such as French/Spanish text</p></td>
     <td><p>⚠️ Maybe</p></td>
     <td><p>Accented characters (<code>café</code> vs. <code>cafe</code>) may not match.</p></td>
     <td><p>A custom analyzer with the <a href="./ascii-folding-filter"><code>asciifolding</code></a> is recommended for better results.</p></td>
   </tr>
   <tr>
     <td><p>Multilingual or unknown languages</p></td>
     <td><p>❌ No</p></td>
     <td><p>The <code>standard</code> analyzer lacks the language-specific logic needed to handle different character sets and tokenization rules.</p></td>
     <td><p>Use a custom analyzer with the <a href="./icu-tokenizer"><code>icu</code></a> tokenizer for unicode-aware tokenization. </p><p>Alternatively, consider configuring <a href="./multi-language-analyzers">multi-language analyzers</a> or a <a href="./language-identifier-tokenizer">language identifier</a> for more precise handling of multilingual content.</p></td>
   </tr>
</table>

## Step 3: Choose your path\{#step-3-choose-your-path}

If the default [standard analyzer](./standard-analyzer) is insufficient, select one of two paths:

- **Path A – Use a built-in analyzer** (ready-to-use, language-specific)

- **Path B – Create a custom analyzer** (manually define tokenizer + a set of filters)

### Path A: Use built-in analyzers\{#path-a-use-built-in-analyzers}

Built-in analyzers are pre-configured solutions for common languages. They are the easiest way to get started when the default standard analyzer isn't a perfect fit.

#### Available built-in analyzers\{#available-built-in-analyzers}

<table>
   <tr>
     <th><p>Analyzer</p></th>
     <th><p>Language Support</p></th>
     <th><p>Components</p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-analyzer"><code>standard</code></a></p></td>
     <td><p>Most space-separated languages (English, French, German, Spanish, etc.)</p></td>
     <td><ul><li><p>Tokenizer: <code>standard</code></p></li><li><p>Filters: <code>lowercase</code></p></li></ul></td>
     <td><p>General-purpose analyzer for initial text processing. For monolingual scenarios, language-specific analyzers (like <code>english</code>) provide better performance.</p></td>
   </tr>
   <tr>
     <td><p><a href="./english-analyzer"><code>english</code></a></p></td>
     <td><p>Dedicated to English, which applies stemming and stop word removal for better English semantic matching</p></td>
     <td><ul><li><p>Tokenizer: <code>standard</code></p></li><li><p>Filters: <code>lowercase</code>, <code>stemmer</code>, <code>stop</code></p></li></ul></td>
     <td><p>Recommended for English-only content over <code>standard</code>.</p></td>
   </tr>
   <tr>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a></p></td>
     <td><p>Chinese</p></td>
     <td><ul><li><p>Tokenizer: <code>jieba</code></p></li><li><p>Filters: <code>cnalphanumonly</code></p></li></ul></td>
     <td><p>Currently uses Simplified Chinese dictionary by default.</p></td>
   </tr>
</table>

#### Implementation example\{#implementation-example}

To use a built-in analyzer, simply specify its type in the `analyzer_params` when defining your field schema.

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

<Admonition type="info" icon="📘" title="Notes">

<p>For detailed usage, refer to <a href="./full-text-search">Full Text Search</a>, <a href="./text-match">Text Match</a>, or <a href="./phrase-match">Phrase Match</a>.</p>

</Admonition>

### Path B: Create a custom analyzer\{#path-b-create-a-custom-analyzer}

When [built-in](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)[ options](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers) don't meet your needs, you can create a custom analyzer by combining a tokenizer with a set of filters. This gives you full control over the text processing pipeline.

#### Step 1: Select the tokenizer based on language\{#step-1-select-the-tokenizer-based-on-language}

Choose your tokenizer based on your content's primary language:

##### Western languages\{#western-languages}

For space-separated languages, you have these options:

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>How It Works</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a></p></td>
     <td><p>Splits text based on spaces and punctuation marks</p></td>
     <td><p>General text, mixed punctuation</p></td>
     <td><ul><li><p>Input: <code>"Hello, world! Visit example.com"</code></p></li><li><p>Output: <code>['Hello', 'world', 'Visit', 'example', 'com']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a></p></td>
     <td><p>Splits only on whitespace characters</p></td>
     <td><p>Pre-processed content, user-formatted text</p></td>
     <td><ul><li><p>Input: <code>"user_id = get_user_data()"</code></p></li><li><p>Output: <code>['user_id', '=', 'get_user_data()']</code></p></li></ul></td>
   </tr>
</table>

##### East Asian languages\{#east-asian-languages}

Dictionary-based languages require specialized tokenizers for proper word segmentation:

###### Chinese\{#chinese}

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>How It Works</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a></p></td>
     <td><p>Chinese dictionary-based segmentation with intelligent algorithm</p></td>
     <td><p><strong>Recommended for Chinese content</strong> - combines dictionary with intelligent algorithms, specifically designed for Chinese</p></td>
     <td><ul><li><p>Input: <code>"机器学习是人工智能的一个分支"</code></p></li><li><p>Output: <code>['机器', '学习', '是', '人工', '智能', '人工智能', '的', '一个', '分支']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p>Pure dictionary-based morphological analysis with Chinese dictionary (<a href="https://cc-cedict.org/wiki/">cc-cedict</a>)</p></td>
     <td><p>Compared to <code>jieba</code>, processes Chinese text in a more generic manner</p></td>
     <td><ul><li><p>Input: <code>"机器学习算法"</code></p></li><li><p>Output: <code>["机器", "学习", "算法"]</code></p></li></ul></td>
   </tr>
</table>

###### Japanese and Korean\{#japanese-and-korean}

<table>
   <tr>
     <th><p>Language</p></th>
     <th><p>Tokenizer</p></th>
     <th><p>Dictionary Options</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p>Japanese</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://taku910.github.io/mecab/">ipadic</a> (general-purpose), <a href="https://github.com/neologd/mecab-ipadic-neologd">ipadic-neologd</a> (modern terms), <a href="https://clrd.ninjal.ac.jp/unidic/">unidic</a> (academic)</p></td>
     <td><p>Morphological analysis with proper noun handling</p></td>
     <td><ul><li><p>Input: <code>"東京都渋谷区"</code></p></li><li><p>Output: <code>["東京", "都", "渋谷", "区"]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p>Korean</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/">ko-dic</a></p></td>
     <td><p>Korean morphological analysis</p></td>
     <td><ul><li><p>Input: <code>"안녕하세요"</code></p></li><li><p>Output: <code>["안녕", "하", "세요"]</code></p></li></ul></td>
   </tr>
</table>

##### Multilingual or unknown languages\{#multilingual-or-unknown-languages}

For content where languages are unpredictable or mixed within documents:

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>How It Works</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./icu-tokenizer"><code>icu</code></a></p></td>
     <td><p>Unicode-aware tokenization (International Components for Unicode)</p></td>
     <td><p>Mixed scripts, unknown languages, or when simple tokenization is sufficient</p></td>
     <td><ul><li><p>Input: <code>"Hello 世界 مرحبا"</code></p></li><li><p>Output: <code>['Hello', ' ', '世界', ' ', 'مرحبا']</code></p></li></ul></td>
   </tr>
</table>

**When to use icu**:

- Mixed languages where language identification is impractical.

- You don't want the overhead of [multi-language analyzers](./multi-language-analyzers) or the [language identifier](./language-identifier-tokenizer).

- Content has a primary language with occasional foreign words that contribute little to the overall meaning (e.g., English text with sporadic brand names or technical terms in Japanese or French).

**Alternative approaches**: For more precise handling of multilingual content, consider using multi-language analyzers or the language identifier. For details, refer to [Multi-language Analyzers](./multi-language-analyzers) or [Language Identifier](./language-identifier-tokenizer).

#### Step 2: Add filters for precision\{#step-2-add-filters-for-precision}

After [selecting your tokenizer](./choose-the-right-analyzer-for-your-use-case#step-1-select-the-tokenizer-based-on-language), apply filters based on your specific search requirements and content characteristics.

##### Commonly used filters\{#commonly-used-filters}

These filters are essential for most space-separated language configurations (English, French, German, Spanish, etc.) and significantly improve search quality:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>How It Works</p></th>
     <th><p>When to Use</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./lowercase-filter"><code>lowercase</code></a></p></td>
     <td><p>Convert all tokens to lowercase</p></td>
     <td><p>Universal - applies to all languages with case distinctions</p></td>
     <td><ul><li><p>Input: <code>["Apple", "iPhone"]</code></p></li><li><p>Output: <code>[['apple'], ['iphone']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stemmer-filter"><code>stemmer</code></a></p></td>
     <td><p>Reduce words to their root form</p></td>
     <td><p>Languages with word inflections (English, French, German, etc.)</p></td>
     <td><p>For English:</p><ul><li><p>Input: <code>["running", "runs", "ran"]</code></p></li><li><p>Output: <code>[['run'], ['run'], ['ran']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stop-filter"><code>stop</code></a></p></td>
     <td><p>Remove common meaningless words</p></td>
     <td><p>Most languages - particularly effective for space-separated languages</p></td>
     <td><ul><li><p>Input: <code>["the", "quick", "brown", "fox"]</code></p></li><li><p>Output: <code>[[], ['quick'], ['brown'], ['fox']]</code></p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>For East Asian languages (Chinese, Japanese, Korean, etc.), focus on <a href="./choose-the-right-analyzer-for-your-use-case#language-specific-filters">language-specific filters</a> instead. These languages typically use different approaches for text processing and may not benefit significantly from stemming.</p>

</Admonition>

##### Text normalization filters\{#text-normalization-filters}

These filters standardize text variations to improve matching consistency:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>How It Works</p></th>
     <th><p>When to Use</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./ascii-folding-filter"><code>asciifolding</code></a></p></td>
     <td><p>Convert accented characters to ASCII equivalents</p></td>
     <td><p>International content, user-generated content</p></td>
     <td><ul><li><p>Input: <code>["café", "naïve", "résumé"]</code></p></li><li><p>Output: <code>[['cafe'], ['naive'], ['resume']]</code></p></li></ul></td>
   </tr>
</table>

##### Token filtering\{#token-filtering}

Control which tokens are preserved based on character content or length:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>How It Works</p></th>
     <th><p>When to Use</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./remove-punct-filter"><code>removepunct</code></a></p></td>
     <td><p>Remove standalone punctuation tokens</p></td>
     <td><p>Clean output from <code>jieba</code>, <code>lindera</code>, <code>icu</code> tokenizers, which will return punctuations as single tokens</p></td>
     <td><ul><li><p>Input: <code>["Hello", "!", "world"]</code></p></li><li><p>Output: <code>[['Hello'], ['world']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./alphanumonly-filter"><code>alphanumonly</code></a></p></td>
     <td><p>Keep only letters and numbers</p></td>
     <td><p>Technical content, clean text processing</p></td>
     <td><ul><li><p>Input: <code>["user123", "test@email.com"]</code></p></li><li><p>Output: <code>[['user123'], ['test', 'email', 'com']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./length-filter"><code>length</code></a></p></td>
     <td><p>Remove tokens outside specified length range</p></td>
     <td><p>Filter noise (exccessively long tokens)</p></td>
     <td><ul><li><p>Input: <code>["a", "very", "extraordinarily"]</code></p></li><li><p>Output: <code>[['a'], ['very'], []]</code> (if <strong>max=10</strong>)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./regex-filter"><code>regex</code></a></p></td>
     <td><p>Custom pattern-based filtering</p></td>
     <td><p>Domain-specific token requirements</p></td>
     <td><ul><li><p>Input: <code>["test123", "prod456"]</code></p></li><li><p>Output: <code>[[], ['prod456']]</code> (if <strong>expr="^prod"</strong>)</p></li></ul></td>
   </tr>
</table>

##### Language-specific filters\{#language-specific-filters}

These filters handle specific language characteristics:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>Language</p></th>
     <th><p>How It Works</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./decompounder-filter"><code>decompounder</code></a></p></td>
     <td><p>German</p></td>
     <td><p>Splits compound words into searchable components</p></td>
     <td><ul><li><p>Input: <code>["dampfschifffahrt"]</code></p></li><li><p>Output: <code>[['dampf', 'schiff', 'fahrt']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cnalphanumonly-filter">cnalphanumonly</a></p></td>
     <td><p>Chinese</p></td>
     <td><p>Keeps Chinese characters + alphanumeric</p></td>
     <td><ul><li><p>Input: <code>["Hello", "世界", "123", "!@#"]</code></p></li><li><p>Output: <code>[['Hello'], ['世界'], ['123'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cncharonly-filter"><code>cncharonly</code></a></p></td>
     <td><p>Chinese</p></td>
     <td><p>Keeps only Chinese characters</p></td>
     <td><ul><li><p>Input: <code>["Hello", "世界", "123"]</code></p></li><li><p>Output: <code>[[], ['世界'], []]</code></p></li></ul></td>
   </tr>
</table>

#### Step 3: Combine and implement\{#step-3-combine-and-implement}

To create your custom analyzer, you define the tokenizer and a list of filters in the `analyzer_params` dictionary. The filters are applied in the order they are listed.

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

#### Final: Test with `run_analyzer`\{#final-test-with-runanalyzer}

Always validate your configuration before applying to a collection:

```python
# Sample text to analyze
sample_text = "The Milvus vector database is built for scale!"

# Run analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

Common issues to check:

- **Over-tokenization**: Technical terms being split incorrectly

- **Under-tokenization**: Phrases not being separated properly

- **Missing tokens**: Important terms being filtered out

For detailed usage, refer to [run_analyzer](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md).

## Quick recipes by use case\{#quick-recipes-by-use-case}

This section provides recommended tokenizer and filter configurations for common use cases when working with analyzers in Zilliz Cloud. Choose the combination that best matches your content type and search requirements.

<Admonition type="info" icon="📘" title="Notes">

<p>Before applying an analyzer to your collection, we recommend you use <a href="https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md"><code>run_analyzer</code></a> to test and validate text analysis performance.</p>

</Admonition>

### English\{#english}

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

### Chinese\{#chinese}

```json
{
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
}
```

### Arabic\{#arabic}

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

### Bengali\{#bengali}

```python
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### French\{#french}

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

### German\{#german}

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

### Hindi\{#hindi}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### Japanese\{#japanese}

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

### Portuguese\{#portuguese}

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

### Russian\{#russian}

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

### Spanish\{#spanish}

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

### Swahili\{#swahili}

```json
{
    "tokenizer": "standard",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### Turkish\{#turkish}

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

### Urdu\{#urdu}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### Mixed or multilingual content\{#mixed-or-multilingual-content}

When working with content that spans multiple languages or uses scripts unpredictably, start with the `icu` analyzer. This Unicode-aware analyzer handles mixed scripts and symbols effectively.

**Basic multilingual configuration (no stemming)**:

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
}
```

**Advanced multilingual processing**:

For better control over token behavior across different languages:

- Use a **multi-language analyzer** configuration. For details, refer to [Multi-language Analyzers](./multi-language-analyzers).

- Implement a **language identifier** on your content. For details, refer to [Language Identifier](./language-identifier-tokenizer).

## Configure and preview analyzers in Zilliz Cloud\{#configure-and-preview-analyzers-in-zilliz-cloud}

In Zilliz Cloud, you can configure and test text analyzers directly from the [Zilliz Cloud](https://cloud.zilliz.com/) [console](https://cloud.zilliz.com/), without writing code.

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />


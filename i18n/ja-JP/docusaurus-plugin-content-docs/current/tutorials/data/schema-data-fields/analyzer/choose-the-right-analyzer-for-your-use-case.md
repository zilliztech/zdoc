---
title: "ユースケースに適したアナライザーの選択 | Cloud"
slug: /choose-the-right-analyzer-for-your-use-case
sidebar_key: choose-the-right-analyzer-for-your-use-case
sidebar_label: "ベストプラクティス"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud 内のテキストコンテンツに最も適したアナライザーを選択し、構成する方法を説明します。 | Cloud"
type: origin
token: Pulhw06e5iXJTFkidFXcGbylnod
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - analyzer
  - best
  - practice

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# ユースケースに合ったアナライザーの選び方

このガイドでは、Zilliz Cloud におけるテキストコンテンツに最も適した**アナライザー**の選択と設定方法を説明します。

ここでは**実用的な意思決定**に焦点を当てています。具体的には、どのアナライザーを使用すべきか、いつカスタムアナライザーを作成すべきか、そして設定をどのように検証すべきかについて解説します。アナライザーの構成要素やパラメータに関する背景情報については、[Analyzer Overview](./analyzer-overview) を参照してください。

## クイックコンセプト：アナライザーの仕組み\{#quick-concept-how-analyzers-work}

アナライザーは、テキストデータを処理して [全文検索](./full-text-search)（BM25ベース）、[フレーズ一致](./phrase-match)、または[テキスト一致](./text-match) などの機能で検索可能にします。アナライザーは、2段階のパイプラインを通じて、生のテキストを個別の検索可能なトークンに変換します。

![JwMZwIYUwhbSZ4bjhxcc1PfNnvx](https://zdoc-images.s3.us-west-2.amazonaws.com/JwMZwIYUwhbSZ4bjhxcc1PfNnvx.png)

1. **トークン化（必須）:** この最初のステージでは、**トークナイザー**を適用して、連続したテキスト文字列を意味のある個別の単位（トークン）に分割します。トークン化の方法は、言語やコンテンツの種類によって大きく異なります。

1. **トークンフィルタリング（任意）:** トークン化の後、**フィルター**を適用してトークンを変更・削除・精緻化します。これらの操作には、すべてのトークンを小文字に変換する、一般的で意味のない単語（ストップワードなど）を削除する、単語をその語幹（原形）に還元する（ステミング）などが含まれます。

例:

```plaintext
Input: "Hello World!" 
       1. Tokenization → ["Hello", "World", "!"]
       2. Lowercase & Punctuation Filtering → ["hello", "world"]
```

## アナライザーの選択が重要な理由\{#why-the-choice-of-analyzer-matters}

選択するアナライザーは、**検索品質と関連性**に直接影響します。

不適切なアナライザーを使用すると、トークン化が不十分または過剰になったり、検索語が見つからなかったり、無関係な結果が返されたりする可能性があります。

<table>
   <tr>
     <th><p>問題</p></th>
     <th><p>症状</p></th>
     <th><p>例（入力 & 出力）</p></th>
     <th><p>原因（不適切なアナライザー）</p></th>
     <th><p>ソリューション（適切なアナライザー）</p></th>
   </tr>
   <tr>
     <td><p>過剰なトークン化</p></td>
     <td><p>技術用語、識別子、URL が誤って分割される</p></td>
     <td><ul><li><p><code>"user_id"</code> → <code>['user', 'id']</code></p></li><li><p><code>"C++"</code> → <code>['c']</code></p></li></ul></td>
     <td><p><a href="./standard-analyzer"><code>standard</code></a> アナライザー</p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーを使用し、<a href="./alphanumonly-filter"><code>alphanumonly</code></a> フィルターと組み合わせる。</p></td>
   </tr>
   <tr>
     <td><p>不十分なトークン化</p></td>
     <td><p>複数語からなるフレーズが単一のトークンとして扱われる</p></td>
     <td><p><code>"state-of-the-art"</code> → <code>['state-of-the-art']</code></p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーを使用したアナライザー</p></td>
     <td><p>句読点やスペースで分割するために <a href="./standard-tokenizer"><code>standard</code></a> トークナイザーを使用し、カスタムの <a href="./regex-filter">regex</a> フィルターを適用する。</p></td>
   </tr>
   <tr>
     <td><p>言語の不一致</p></td>
     <td><p>外国語の検索結果が意味をなさない</p></td>
     <td><p>中国語テキスト: <code>"机器学习"</code> → <code>['机器学习']</code>（1 つのトークン）</p></td>
     <td><p><a href="./english-analyzer"><code>english</code></a> アナライザー</p></td>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a> のような言語固有のアナライザーを使用する。</p></td>
   </tr>
</table>

## ステップ 1: アナライザーを選択する必要があるか？\{#step-1-do-you-need-to-choose-an-analyzer}

テキスト検索機能（例：**全文検索**、**フレーズ一致**、**テキスト一致**）を使用しているが、**アナライザーを明示的に指定していない場合**、

Zilliz Cloud は自動的に [standard analyzer](./standard-analyzer) を適用します。

**標準アナライザーの動作**:

- スペースおよび句読点でテキストを分割
- すべてのトークンを小文字に変換

**変換例**:

```plaintext
Input:  "The Milvus vector database is built for scale!"
Output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

## ステップ 2: 標準アナライザーが要件を満たすか確認する\{#step-2-check-if-the-standard-analyzer-meets-your-needs}

次の表を使用して、デフォルトの [`standard`](./standard-analyzer) [アナライザー](./standard-analyzer) が要件を満たすかどうかを迅速に判断できます。満たさない場合は、[別のパスを選択](./choose-the-right-analyzer-for-your-use-case#step-3-choose-your-path)する必要があります。

<table>
   <tr>
     <th><p>コンテンツ</p></th>
     <th><p>標準アナライザーで OK?</p></th>
     <th><p>理由</p></th>
     <th><p>必要な対応</p></th>
   </tr>
   <tr>
     <td><p>英語のブログ記事</p></td>
     <td><p>✅ はい</p></td>
     <td><p>デフォルトの動作で十分です。</p></td>
     <td><p>デフォルトを使用（設定不要）。</p></td>
   </tr>
   <tr>
     <td><p>中国語のドキュメント</p></td>
     <td><p>❌ いいえ</p></td>
     <td><p>中国語の単語にはスペースがなく、1つのトークンとして扱われます。</p></td>
     <td><p>組み込みの <a href="./chinese-analyzer"><code>chinese</code></a> アナライザーを使用してください。</p></td>
   </tr>
   <tr>
     <td><p>技術ドキュメント</p></td>
     <td><p>❌ いいえ</p></td>
     <td><p><code>C++</code> のような用語から句読点が削除されます。</p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーと <a href="./alphanumonly-filter"><code>alphanumonly</code></a> フィルターを使用したカスタムアナライザーを作成してください。</p></td>
   </tr>
   <tr>
     <td><p>フランス語やスペイン語など、スペース区切りの言語のテキスト</p></td>
     <td><p>⚠️ おそらく</p></td>
     <td><p>アクセント付き文字（<code>café</code> と <code>cafe</code>）が一致しない可能性があります。</p></td>
     <td><p>より良い結果を得るには、<a href="./ascii-folding-filter"><code>asciifolding</code></a> フィルターを使用したカスタムアナライザーを推奨します。</p></td>
   </tr>
   <tr>
     <td><p>多言語または言語が不明なコンテンツ</p></td>
     <td><p>❌ いいえ</p></td>
     <td><p><code>standard</code> アナライザーには、異なる文字セットやトークン化ルールを処理するために必要な言語固有のロジックがありません。</p></td>
     <td><p>Unicode 対応のトークン化を行うには、<a href="./icu-tokenizer"><code>icu</code></a> トークナイザーを使用したカスタムアナライザーを使用してください。</p><p>あるいは、多言語コンテンツをより正確に処理するために、<a href="./multi-language-analyzers">多言語アナライザー</a>または<a href="./language-identifier-tokenizer">言語識別子</a>の構成を検討してください。</p></td>
   </tr>
</table>

## ステップ 3: パスを選択する\{#step-3-choose-your-path}

デフォルトの [standard analyzer](./standard-analyzer) が不十分な場合は、以下の 2 つのパスのいずれかを選択します。

- **パス A – 組み込みアナライザーを使用**（すぐに使える、言語固有のアナライザー）

- **パス B – カスタムアナライザーを作成**（トークナイザーとフィルターのセットを手動で定義）

### パス A: 組み込みアナライザーを使用する\{#path-a-use-built-in-analyzers}

組み込みアナライザーは、一般的な言語向けに事前設定されたソリューションです。デフォルトの standard analyzer が完全に適合しない場合でも、簡単に導入できます。

#### 利用可能な組み込みアナライザー\{#available-built-in-analyzers}

<table>
   <tr>
     <th><p>アナライザー</p></th>
     <th><p>言語サポート</p></th>
     <th><p>コンポーネント</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-analyzer"><code>standard</code></a></p></td>
     <td><p>スペース区切りのほとんどの言語（英語、フランス語、ドイツ語、スペイン語など）</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code></p></li></ul></td>
     <td><p>初期テキスト処理用の汎用アナライザー。単一言語のシナリオでは、言語固有のアナライザー（例: <code>english</code>）の方が優れたパフォーマンスを発揮します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./english-analyzer"><code>english</code></a></p></td>
     <td><p>英語専用で、ステミングとストップワード除去を適用し、英語の意味的マッチングを向上</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code>, <code>stemmer</code>, <code>stop</code></p></li></ul></td>
     <td><p><code>standard</code> よりも英語専用コンテンツには推奨されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a></p></td>
     <td><p>中国語</p></td>
     <td><ul><li><p>トークナイザー: <code>jieba</code></p></li><li><p>フィルター: <code>cnalphanumonly</code></p></li></ul></td>
     <td><p>現在は簡体字中国語辞書がデフォルトで使用されています。</p></td>
   </tr>
</table>

#### 実装例\{#implementation-example}

組み込みアナライザーを使用するには、フィールドスキーマを定義する際に `analyzer_params` でそのタイプを指定するだけです。

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

<p>詳細な使用方法については、<a href="./full-text-search">全文検索</a>、<a href="./text-match">テキストマッチ</a>、または<a href="./phrase-match">フレーズマッチ</a>を参照してください。</p>

</Admonition>

### Path B: Create a custom analyzer\{#path-b-create-a-custom-analyzer}

[ビルトイン](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)[オプション](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers) が要件を満たさない場合、トークナイザーと一連のフィルターを組み合わせることでカスタムアナライザーを作成できます。これにより、テキスト処理パイプラインを完全に制御できます。

#### Step 1: Select the tokenizer based on language\{#step-1-select-the-tokenizer-based-on-language}

コンテンツの主要な言語に基づいてトークナイザーを選択します：

##### Western languages\{#western-languages}

スペース区切りの言語の場合、以下のオプションがあります：

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>How It Works</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a></p></td>
     <td><p>スペースと句読記号に基づいてテキストを分割します</p></td>
     <td><p>一般テキスト、混合された句読点</p></td>
     <td><ul><li><p>Input: <code>"Hello, world! Visit example.com"</code></p></li><li><p>Output: <code>['Hello', 'world', 'Visit', 'example', 'com']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a></p></td>
     <td><p>空白文字のみで分割します</p></td>
     <td><p>前処理済みコンテンツ、ユーザーフォーマット済みテキスト</p></td>
     <td><ul><li><p>Input: <code>"user_id = get_user_data()"</code></p></li><li><p>Output: <code>['user_id', '=', 'get_user_data()']</code></p></li></ul></td>
   </tr>
</table>

##### East Asian languages\{#east-asian-languages}

辞書ベースの言語では、適切な単語分割のために専用のトークナイザーが必要です：

###### Chinese\{#chinese}

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>How It Works</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a></p></td>
     <td><p>中国語辞書に基づく分割とインテリジェントアルゴリズム</p></td>
     <td><p><strong>中国語コンテンツに推奨</strong> - 辞書とインテリジェントアルゴリズムを組み合わせ、中国語専用に設計されています</p></td>
     <td><ul><li><p>Input: <code>"机器学习是人工智能的一个分支"</code></p></li><li><p>Output: <code>['机器', '学习', '是', '人工', '智能', '人工智能', '的', '一个', '分支']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p>中国語辞書（<a href="https://cc-cedict.org/wiki/">cc-cedict</a>）を使用した純粋な辞書ベースの形態素解析</p></td>
     <td><p><code>jieba</code> と比較して、中国語テキストをより一般的な方法で処理します</p></td>
     <td><ul><li><p>Input: <code>"机器学习算法"</code></p></li><li><p>Output: <code>["机器", "学习", "算法"]</code></p></li></ul></td>
   </tr>
</table>

###### Japanese and Korean\{#japanese-and-korean}

<table>
   <tr>
     <th><p>言語</p></th>
     <th><p>トークナイザー</p></th>
     <th><p>Dictionary Options</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p>Japanese</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://taku910.github.io/mecab/">ipadic</a> (汎用)、<a href="https://github.com/neologd/mecab-ipadic-neologd">ipadic-neologd</a> (現代用語)、<a href="https://clrd.ninjal.ac.jp/unidic/">unidic</a> (学術用)</p></td>
     <td><p>固有名詞処理を伴う形態素解析</p></td>
     <td><ul><li><p>Input: <code>"東京都渋谷区"</code></p></li><li><p>Output: <code>["東京", "都", "渋谷", "区"]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p>Korean</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/">ko-dic</a></p></td>
     <td><p>韓国語の形態素解析</p></td>
     <td><ul><li><p>Input: <code>"안녕하세요"</code></p></li><li><p>Output: <code>["안녕", "하", "세요"]</code></p></li></ul></td>
   </tr>
</table>

##### Multilingual or unknown languages\{#multilingual-or-unknown-languages}

言語が予測できない場合や、ドキュメント内で混合されているコンテンツの場合：

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>How It Works</p></th>
     <th><p>Best For</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./icu-tokenizer"><code>icu</code></a></p></td>
     <td><p>Unicode 対応のトークン化（International Components for Unicode）</p></td>
     <td><p>混合スクリプト、不明な言語、または単純なトークン化で十分な場合</p></td>
     <td><ul><li><p>Input: <code>"Hello 世界 مرحبا"</code></p></li><li><p>Output: <code>['Hello', ' ', '世界', ' ', 'مرحبا']</code></p></li></ul></td>
   </tr>
</table>

**icuを使用する場合**:

- 言語識別が実用的でない混合言語。

- [多言語アナライザー](./multi-language-analyzers) や [言語識別子](./language-identifier-tokenizer) のオーバーヘッドを避けたい場合。

- コンテンツに主要な言語があり、全体の意味にほとんど寄与しない外国語の単語が散在している場合（例：日本語やフランス語のブランド名や専門用語が散在する英語テキスト）。

**代替アプローチ**: 多言語コンテンツをより正確に処理するには、多言語アナライザーまたは言語識別子の使用を検討してください。詳細については、[Multi-language Analyzers](./multi-language-analyzers) または [言語 Identifier](./language-identifier-tokenizer) を参照してください。

#### Step 2: Add filters for precision\{#step-2-add-filters-for-precision}

[トークナイザーを選択](./choose-the-right-analyzer-for-your-use-case#step-1-select-the-tokenizer-based-on-language) した後、特定の検索要件とコンテンツの特性に基づいてフィルターを適用します。

##### Commonly used filters\{#commonly-used-filters}

これらのフィルターは、ほとんどのスペース区切り言語設定（英語、フランス語、ドイツ語、スペイン語など）に不可欠であり、検索品質を大幅に向上させます：

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>How It Works</p></th>
     <th><p>When to Use</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./lowercase-filter"><code>lowercase</code></a></p></td>
     <td><p>すべてのトークンを小文字に変換します</p></td>
     <td><p>ユニバーサル - 大文字小文字の区別があるすべての言語に適用されます</p></td>
     <td><ul><li><p>Input: <code>["Apple", "iPhone"]</code></p></li><li><p>Output: <code>[['apple'], ['iphone']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stemmer-filter"><code>stemmer</code></a></p></td>
     <td><p>単語を語根形式に還元します</p></td>
     <td><p>語形変化のある言語（英語、フランス語、ドイツ語など）</p></td>
     <td><p>英語の場合：</p><ul><li><p>Input: <code>["running", "runs", "ran"]</code></p></li><li><p>Output: <code>[['run'], ['run'], ['ran']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stop-filter"><code>stop</code></a></p></td>
     <td><p>一般的な無意味な単語を削除します</p></td>
     <td><p>ほとんどの言語 - 特にスペース区切りの言語に効果的です</p></td>
     <td><ul><li><p>Input: <code>["the", "quick", "brown", "fox"]</code></p></li><li><p>Output: <code>[[], ['quick'], ['brown'], ['fox']]</code></p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>東アジア言語（中国語、日本語、韓国語など）の場合は、代わりに<a href="./choose-the-right-analyzer-for-your-use-case#language-specific-filters">言語固有のフィルター</a>に焦点を当ててください。これらの言語は通常、テキスト処理に異なるアプローチを使用しており、ステミングから大きな恩恵を受けない可能性があります。</p>

</Admonition>

##### Text normalization filters\{#text-normalization-filters}

これらのフィルターは、テキストの変異を標準化し、マッチングの一貫性を向上させます：

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>How It Works</p></th>
     <th><p>When to Use</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./ascii-folding-filter"><code>asciifolding</code></a></p></td>
     <td><p>アクセント付き文字を ASCII 相当文字に変換します</p></td>
     <td><p>国際的なコンテンツ、ユーザー生成コンテンツ</p></td>
     <td><ul><li><p>Input: <code>["café", "naïve", "résumé"]</code></p></li><li><p>Output: <code>[['cafe'], ['naive'], ['resume']]</code></p></li></ul></td>
   </tr>
</table>

##### Token filtering\{#token-filtering}

文字内容または長さに基づいて、どのトークンを保持するかを制御します：

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>How It Works</p></th>
     <th><p>When to Use</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./remove-punct-filter"><code>removepunct</code></a></p></td>
     <td><p>単独の句読点トークンを削除します</p></td>
     <td><p><code>jieba</code>、<code>lindera</code>、<code>icu</code> トークナイザーからの出力をクリーンアップします。これらは句読点を単一トークンとして返す場合があります</p></td>
     <td><ul><li><p>Input: <code>["Hello", "!", "world"]</code></p></li><li><p>Output: <code>[['Hello'], ['world']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./alphanumonly-filter"><code>alphanumonly</code></a></p></td>
     <td><p>文字と数字のみを保持します</p></td>
     <td><p>技術的なコンテンツ、クリーンなテキスト処理</p></td>
     <td><ul><li><p>Input: <code>["user123", "test@email.com"]</code></p></li><li><p>Output: <code>[['user123'], ['test', 'email', 'com']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./length-filter"><code>length</code></a></p></td>
     <td><p>指定された長さの範囲外のトークンを削除します</p></td>
     <td><p>ノイズのフィルタリング（過度に長いトークン）</p></td>
     <td><ul><li><p>Input: <code>["a", "very", "extraordinarily"]</code></p></li><li><p>Output: <code>[['a'], ['very'], []]</code> (<strong>max=10</strong> の場合)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./regex-filter"><code>regex</code></a></p></td>
     <td><p>カスタムパターンベースのフィルタリング</p></td>
     <td><p>ドメイン固有のトークン要件</p></td>
     <td><ul><li><p>Input: <code>["test123", "prod456"]</code></p></li><li><p>Output: <code>[[], ['prod456']]</code> (<strong>expr="^prod"</strong> の場合)</p></li></ul></td>
   </tr>
</table>

##### 言語-specific filters\{#language-specific-filters}

これらのフィルターは、特定の言語の特性を処理します：

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>言語</p></th>
     <th><p>How It Works</p></th>
     <th><p>Examples</p></th>
   </tr>
   <tr>
     <td><p><a href="./decompounder-filter"><code>decompounder</code></a></p></td>
     <td><p>German</p></td>
     <td><p>複合語を検索可能な構成要素に分割します</p></td>
     <td><ul><li><p>Input: <code>["dampfschifffahrt"]</code></p></li><li><p>Output: <code>[['dampf', 'schiff', 'fahrt']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cnalphanumonly-filter">cnalphanumonly</a></p></td>
     <td><p>Chinese</p></td>
     <td><p>中国語文字 + 英数字を保持します</p></td>
     <td><ul><li><p>Input: <code>["Hello", "世界", "123", "!@#"]</code></p></li><li><p>Output: <code>[['Hello'], ['世界'], ['123'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cncharonly-filter"><code>cncharonly</code></a></p></td>
     <td><p>Chinese</p></td>
     <td><p>中国語文字のみを保持します</p></td>
     <td><ul><li><p>Input: <code>["Hello", "世界", "123"]</code></p></li><li><p>Output: <code>[[], ['世界'], []]</code></p></li></ul></td>
   </tr>
</table>

#### Step 3: Combine and implement\{#step-3-combine-and-implement}

カスタムアナライザーを作成するには、`analyzer_params` 辞書でトークナイザーとフィルターの一覧を定義します。フィルターはリストされている順序で適用されます。

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

#### 最終確認：`run_analyzer` でのテスト\{#final-test-with-runanalyzer}

コレクションに適用する前に、常に設定を検証してください：

```python
# Sample text to analyze
sample_text = "The Milvus vector database is built for scale!"

# Run analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

確認すべき一般的な問題:

- **過剰なトークン化**: 専門用語が誤って分割される

- **不十分なトークン化**: 句が適切に区切られない

- **欠落しているトークン**: 重要な用語がフィルタリングされて除外される

詳細な使用方法については、[run_analyzer](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md) を参照してください。

## Quick recipes by use case\{#quick-recipes-by-use-case}

このセクションでは、Zilliz Cloud でアナライザーを使用する際の一般的なユースケースに対応した、推奨されるトークナイザーとフィルターの設定を提供します。コンテンツタイプと検索要件に最も適した組み合わせを選択してください。

<Admonition type="info" icon="📘" title="Notes">

<p>コレクションにアナライザーを適用する前に、<a href="https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md"><code>run_analyzer</code></a> を使用して、テキスト分析のパフォーマンスをテストおよび検証することを推奨します。</p>

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

### 中国語\{#chinese}

```json
{
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
}
```

### アラビア語\{#arabic}

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

### ベンガル語\{#bengali}

```python
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### フランス語\{#french}

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

### ドイツ語\{#german}

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

### हिन्दी\{#hindi}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 韓国語\{#korean}

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

ポルトガル語\{#portuguese}

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

### ロシア語\{#russian}

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

### スペイン語\{#spanish}

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

### スワヒリ語\{#swahili}

```json
{
    "tokenizer": "standard",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### トルコ語\{#turkish}

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

### 混合または多言語コンテンツ\{#mixed-or-multilingual-content}

複数の言語にまたがるコンテンツや、スクリプトが予測不能に使用されるコンテンツを扱う場合は、`icu` アナライザーから開始してください。この Unicode 対応アナライザーは、混合スクリプトや記号を効果的に処理します。

**基本的な多言語設定（ステミングなし）**:

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
}
```

**高度な多言語処理**:

異なる言語間でのトークンの動作をより適切に制御するには:

- **多言語アナライザー**構成を使用します。詳細については、[多言語アナライザー](./multi-language-analyzers) を参照してください。

- コンテンツに**言語識別子**を実装します。詳細については、[言語識別子](./language-identifier-tokenizer) を参照してください。

## Zilliz Cloud でのアナライザーの構成とプレビュー\{#configure-and-preview-analyzers-in-zilliz-cloud}

Zilliz Cloud では、コードを書かずに [Zilliz Cloud](https://cloud.zilliz.com/) の [コンソール](https://cloud.zilliz.com/) から直接テキストアナライザーを構成してテストできます。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />


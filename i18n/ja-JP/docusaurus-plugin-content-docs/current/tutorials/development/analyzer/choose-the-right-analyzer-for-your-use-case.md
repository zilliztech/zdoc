---
title: "ユースケースに適した Analyzer を選ぶ | Cloud"
slug: /choose-the-right-analyzer-for-your-use-case
sidebar_label: "ベストプラクティス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドは、Zilliz Cloud のテキストコンテンツに最適な analyzer を選択して設定するのに役立ちます。 | Cloud"
type: origin
token: Pulhw06e5iXJTFkidFXcGbylnod
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# ユースケースに適した Analyzer を選ぶ

このガイドは、Zilliz Cloud のテキストコンテンツに最適な **analyzer** を選択して設定するのに役立ちます。

このガイドは **実践的な意思決定** に焦点を当てています。どの analyzer を使用するか、いつカスタマイズするか、そして構成をどのように検証するかについて説明します。analyzer のコンポーネントやパラメータの背景については、[Analyzer Overview](./analyzer-overview) を参照してください。

## クイックコンセプト: analyzer の仕組み\{#quick-concept-how-analyzers-work}

analyzer は、[全文検索](./full-text-search)（BM25 ベース）、[フレーズ一致](./phrase-match)、または [テキストマッチ](./text-match) などの機能で検索可能になるように、テキストデータを処理します。生のテキストを 2 段階のパイプラインを通じて、検索可能な離散トークンに変換します。

![JwMZwIYUwhbSZ4bjhxcc1PfNnvx](https://zdoc-images.s3.us-west-2.amazonaws.com/JwMZwIYUwhbSZ4bjhxcc1PfNnvx.png)

1. **トークン化（必須）:** この最初の段階では、**tokenizer** を適用して、連続するテキスト文字列をトークンと呼ばれる離散的で意味のある単位に分割します。トークン化の方法は、言語やコンテンツの種類によって大きく異なる場合があります。

1. **トークンフィルタリング（任意）:** トークン化の後、**filter** を適用してトークンを変更、削除、または精緻化します。これらの操作には、すべてのトークンを小文字に変換する、一般的で意味のない単語（ストップワードなど）を削除する、単語を語根の形に還元する（stemming）などが含まれます。

例:

```plaintext
Input: "Hello World!" 
       1. Tokenization → ["Hello", "World", "!"]
       2. Lowercase & Punctuation Filtering → ["hello", "world"]
```

## analyzer の選択が重要な理由\{#why-the-choice-of-analyzer-matters}

選択する analyzer は、**検索品質と関連性** に直接影響します。

不適切な analyzer を使用すると、トークン化の不足や過剰、用語の欠落、無関係な結果が発生する可能性があります。

<table>
   <tr>
     <th><p>問題</p></th>
     <th><p>症状</p></th>
     <th><p>例（入力と出力）</p></th>
     <th><p>原因（不適切な analyzer）</p></th>
     <th><p>解決策（適切な analyzer）</p></th>
   </tr>
   <tr>
     <td><p>過剰なトークン化</p></td>
     <td><p>技術用語、識別子、URL が正しく分割されない</p></td>
     <td><ul><li><p><code>&quot;user_id&quot;</code> → <code>['user', 'id']</code></p></li><li><p><code>&quot;C++&quot;</code> → <code>['c']</code></p></li></ul></td>
     <td><p><a href="./standard-analyzer"><code>standard</code></a> analyzer</p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> tokenizer を使用し、<a href="./alphanumonly-filter"><code>alphanumonly</code></a> filter と組み合わせます。</p></td>
   </tr>
   <tr>
     <td><p>過少なトークン化</p></td>
     <td><p>複数単語のフレーズが単一のトークンとして扱われる</p></td>
     <td><p><code>&quot;state-of-the-art&quot;</code> → <code>['state-of-the-art']</code></p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> tokenizer を使用する analyzer</p></td>
     <td><p>句読点とスペースで分割する <a href="./standard-tokenizer"><code>standard</code></a> tokenizer を使用し、カスタムの <a href="./regex-filter">regex</a> filter を使用します。</p></td>
   </tr>
   <tr>
     <td><p>言語のミスマッチ</p></td>
     <td><p>外国語の検索結果が無意味になる</p></td>
     <td><p>中国語のテキスト: <code>&quot;机器学习&quot;</code> → <code>['机器学习']</code>（1 トークン）</p></td>
     <td><p><a href="./english-analyzer"><code>english</code></a> analyzer</p></td>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a> などの言語固有の analyzer を使用します。</p></td>
   </tr>
   <tr>
     <td><p>入力方式のミスマッチ</p></td>
     <td><p>ユーザーはピンインを入力しますが、インデックスされるテキストは中国語の漢字を使用しています。</p></td>
     <td><p>中国語のテキスト: <code>&quot;足球&quot;</code>、クエリテキスト: <code>&quot;zuqiu&quot;</code></p></td>
     <td><p>中国語の文字トークンのみを出力する analyzer</p></td>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a> tokenizer と <a href="./pinyin-filter"><code>pinyin</code></a> filter を使用するカスタム analyzer を使用します。</p></td>
   </tr>
</table>

## ステップ 1: analyzer を選択する必要がありますか？\{#step-1-do-you-need-to-choose-an-analyzer}

テキスト検索機能（**全文検索**、**フレーズ一致**、**テキストマッチ** など）を使用しているものの、**analyzer を明示的に指定していない** 場合、

Zilliz Cloud は自動的に [standard analyzer](./standard-analyzer) を適用します。

**standard analyzer の動作**:

- スペースと句読点でテキストを分割します

- すべてのトークンを小文字に変換します

**変換例**:

```plaintext
Input:  "The Milvus vector database is built for scale!"
Output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

## ステップ 2: standard analyzer が要件を満たすか確認する\{#step-2-check-if-the-standard-analyzer-meets-your-needs}

この表を使用して、デフォルトの [`standard`](./standard-analyzer)[ analyzer](./standard-analyzer) が要件を満たすかどうかをすばやく判断してください。満たさない場合は、[別のパスを選択](./choose-the-right-analyzer-for-your-use-case#step-3-choose-your-path) する必要があります。

| コンテンツ | standard analyzer で十分か？ | 理由 | 必要な対応 |
| --- | --- | --- | --- |
| 英語のブログ記事 | ✅ はい | デフォルトの動作で十分です。 | デフォルトを使用します（構成は不要です）。 |
| 中国語のドキュメント | ❌ いいえ | 中国語の単語にはスペースがなく、1 つのトークンとして扱われます。 | 組み込みの [`chinese`](./chinese-analyzer) analyzer を使用します。 |
| 技術ドキュメント | ❌ いいえ | `C++` のような用語から句読点が削除されます。 | [`whitespace`](./whitespace-tokenizer) tokenizer と [`alphanumonly`](./alphanumonly-filter) filter を組み合わせたカスタム analyzer を作成します。 |
| French/Spanish などのスペース区切り言語のテキスト | ⚠️ 場合による | アクセント付き文字（`café` と `cafe`）が一致しない可能性があります。 | より良い結果を得るには、[`asciifolding`](./ascii-folding-filter) を使用したカスタム analyzer を推奨します。 |
| 多言語または不明な言語 | ❌ いいえ | `standard` analyzer には、異なる文字セットやトークン化ルールを処理するために必要な言語固有のロジックがありません。 | Unicode 対応のトークン化には、[`icu`](./icu-tokenizer) tokenizer を使用したカスタム analyzer を使用します。<br/>または、多言語コンテンツをより正確に処理するために、[多言語 analyzer](./multi-language-analyzers) または [language identifier](./language-identifier-tokenizer) の構成を検討してください。 |

## ステップ 3: パスを選択する\{#step-3-choose-your-path}

デフォルトの [standard analyzer](./standard-analyzer) では不十分な場合は、次の 2 つのパスのいずれかを選択します。

- **パス A – 組み込み analyzer を使用する**（すぐに使用可能、言語固有）

- **パス B – カスタム analyzer を作成する**（tokenizer と一連の filter を手動で定義する）

### パス A: 組み込み analyzer を使用する\{#path-a-use-built-in-analyzers}

組み込み analyzer は、一般的な言語向けに事前構成されたソリューションです。デフォルトの standard analyzer が完全に適合しない場合に、最も簡単に開始できる方法です。

#### 使用可能な組み込み analyzer\{#available-built-in-analyzers}

<table>
   <tr>
     <th><p>Analyzer</p></th>
     <th><p>対応言語</p></th>
     <th><p>コンポーネント</p></th>
     <th><p>注記</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-analyzer"><code>standard</code></a></p></td>
     <td><p>ほとんどのスペース区切り言語（英語、フランス語、ドイツ語、スペイン語など）</p></td>
     <td><ul><li><p>Tokenizer: <code>standard</code></p></li><li><p>Filters: <code>lowercase</code></p></li></ul></td>
     <td><p>初期のテキスト処理向けの汎用 analyzer です。単一言語のシナリオでは、言語固有の analyzer（<code>english</code> など）の方が高いパフォーマンスを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./english-analyzer"><code>english</code></a></p></td>
     <td><p>英語専用（Dedicated）で、英語のセマンティックマッチングを改善するために stemming とストップワードの削除を適用します</p></td>
     <td><ul><li><p>Tokenizer: <code>standard</code></p></li><li><p>Filters: <code>lowercase</code>, <code>stemmer</code>, <code>stop</code></p></li></ul></td>
     <td><p>英語のみのコンテンツでは <code>standard</code> よりも推奨されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a></p></td>
     <td><p>中国語</p></td>
     <td><ul><li><p>Tokenizer: <code>jieba</code></p></li><li><p>Filters: <code>cnalphanumonly</code></p></li></ul></td>
     <td><p>現在はデフォルトで簡体字中国語の辞書を使用します。</p></td>
   </tr>
</table>

#### 実装例\{#implementation-example}

組み込み analyzer を使用するには、フィールドスキーマを定義する際に `analyzer_params` でそのタイプを指定するだけです。

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

<Admonition type="info" title="Notes">

詳細な使用方法については、[全文検索](./full-text-search)、[テキストマッチ](./text-match)、または [フレーズ一致](./phrase-match) を参照してください。

</Admonition>

### パス B: カスタム analyzer を作成する\{#path-b-create-a-custom-analyzer}

[組み込み](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)[オプション](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers) が要件を満たさない場合は、tokenizer と一連の filter を組み合わせてカスタム analyzer を作成できます。これにより、テキスト処理パイプラインを完全に制御できます。

#### ステップ 1: 言語に基づいて tokenizer を選択する\{#step-1-select-the-tokenizer-based-on-language}

コンテンツの主要言語に基づいて tokenizer を選択します。

##### 西洋言語\{#western-languages}

スペース区切り言語の場合は、次のオプションがあります。

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a></p></td>
     <td><p>スペースと句読点に基づいてテキストを分割します</p></td>
     <td><p>一般的なテキスト、句読点が混在するテキスト</p></td>
     <td><ul><li><p>入力: <code>&quot;Hello, world! Visit example.com&quot;</code></p></li><li><p>出力: <code>['Hello', 'world', 'Visit', 'example', 'com']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a></p></td>
     <td><p>空白文字のみで分割します</p></td>
     <td><p>前処理済みのコンテンツ、ユーザーが整形したテキスト</p></td>
     <td><ul><li><p>入力: <code>&quot;user_id = get_user_data()&quot;</code></p></li><li><p>出力: <code>['user_id', '=', 'get_user_data()']</code></p></li></ul></td>
   </tr>
</table>

##### 東アジア言語\{#east-asian-languages}

辞書ベースの言語では、適切な単語分割のために専用の tokenizer が必要です。

###### 中国語\{#chinese}

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a></p></td>
     <td><p>インテリジェントアルゴリズムによる中国語の辞書ベースの分割</p></td>
     <td><p><strong>中国語コンテンツに推奨</strong> - 辞書とインテリジェントアルゴリズムを組み合わせ、中国語向けに特別に設計されています</p></td>
     <td><ul><li><p>入力: <code>&quot;机器学习是人工智能的一个分支&quot;</code></p></li><li><p>出力: <code>['机器', '学习', '是', '人工', '智能', '人工智能', '的', '一个', '分支']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p>中国語辞書（<a href="https://cc-cedict.org/wiki/">cc-cedict</a>）を使用した純粋な辞書ベースの形態素解析</p></td>
     <td><p><code>jieba</code> と比較して、中国語のテキストをより汎用的な方法で処理します</p></td>
     <td><ul><li><p>入力: <code>&quot;机器学习算法&quot;</code></p></li><li><p>出力: <code>[&quot;机器&quot;, &quot;学习&quot;, &quot;算法&quot;]</code></p></li></ul></td>
   </tr>
</table>

###### 日本語と韓国語\{#japanese-and-korean}

<table>
   <tr>
     <th><p>言語</p></th>
     <th><p>Tokenizer</p></th>
     <th><p>辞書オプション</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p>日本語</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://taku910.github.io/mecab/">ipadic</a>（汎用）、<a href="https://github.com/neologd/mecab-ipadic-neologd">ipadic-neologd</a>（現代用語）、<a href="https://clrd.ninjal.ac.jp/unidic/">unidic</a>（学術向け）</p></td>
     <td><p>固有名詞の処理を含む形態素解析</p></td>
     <td><ul><li><p>入力: <code>&quot;東京都渋谷区&quot;</code></p></li><li><p>出力: <code>[&quot;東京&quot;, &quot;都&quot;, &quot;渋谷&quot;, &quot;区&quot;]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p>韓国語</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/">ko-dic</a></p></td>
     <td><p>韓国語の形態素解析</p></td>
     <td><ul><li><p>入力: <code>&quot;안녕하세요&quot;</code></p></li><li><p>出力: <code>[&quot;안녕&quot;, &quot;하&quot;, &quot;세요&quot;]</code></p></li></ul></td>
   </tr>
</table>

##### 多言語または不明な言語\{#multilingual-or-unknown-languages}

言語が予測できない、またはドキュメント内で混在しているコンテンツの場合:

<table>
   <tr>
     <th><p>Tokenizer</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./icu-tokenizer"><code>icu</code></a></p></td>
     <td><p>Unicode 対応のトークン化（International Components for Unicode）</p></td>
     <td><p>混在する文字体系、不明な言語、または単純なトークン化で十分な場合</p></td>
     <td><ul><li><p>入力: <code>&quot;Hello 世界 مرحبا&quot;</code></p></li><li><p>出力: <code>['Hello', ' ', '世界', ' ', 'مرحبا']</code></p></li></ul></td>
   </tr>
</table>

**`icu` を使用する場合**:

- 言語の識別が現実的でない混在言語の場合。

- [多言語 analyzer](./multi-language-analyzers) や [language identifier](./language-identifier-tokenizer) のオーバーヘッドを避けたい場合。

- コンテンツに主要言語があり、全体の意味にほとんど寄与しない外国語が時折含まれる場合（例: 日本語やフランス語のブランド名や技術用語が散見される英語のテキスト）。

**代替アプローチ**: 多言語コンテンツをより正確に処理するには、多言語 analyzer または language identifier の使用を検討してください。詳細については、[多言語 analyzer](./multi-language-analyzers) または [language identifier](./language-identifier-tokenizer) を参照してください。

#### ステップ 2: 精度を高めるために filter を追加する\{#step-2-add-filters-for-precision}

[tokenizer を選択](./choose-the-right-analyzer-for-your-use-case#step-1-select-the-tokenizer-based-on-language) した後、特定の検索要件とコンテンツの特性に基づいて filter を適用します。

##### よく使用される filter\{#commonly-used-filters}

これらの filter は、ほとんどのスペース区切り言語構成（英語、フランス語、ドイツ語、スペイン語など）で不可欠であり、検索品質を大幅に向上させます:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>仕組み</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./lowercase-filter"><code>lowercase</code></a></p></td>
     <td><p>すべてのトークンを小文字に変換します</p></td>
     <td><p>普遍的 - 大文字と小文字を区別するすべての言語に適用されます</p></td>
     <td><ul><li><p>入力: <code>[&quot;Apple&quot;, &quot;iPhone&quot;]</code></p></li><li><p>出力: <code>[['apple'], ['iphone']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stemmer-filter"><code>stemmer</code></a></p></td>
     <td><p>単語を語根の形に還元します</p></td>
     <td><p>語形変化のある言語（英語、フランス語、ドイツ語など）</p></td>
     <td><p>英語の場合:</p><ul><li><p>入力: <code>[&quot;running&quot;, &quot;runs&quot;, &quot;ran&quot;]</code></p></li><li><p>出力: <code>[['run'], ['run'], ['ran']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stop-filter"><code>stop</code></a></p></td>
     <td><p>一般的で意味のない単語を削除します</p></td>
     <td><p>ほとんどの言語 - 特にスペース区切り言語で効果的です</p></td>
     <td><ul><li><p>入力: <code>[&quot;the&quot;, &quot;quick&quot;, &quot;brown&quot;, &quot;fox&quot;]</code></p></li><li><p>出力: <code>[[], ['quick'], ['brown'], ['fox']]</code></p></li></ul></td>
   </tr>
</table>

<Admonition type="info" title="Notes">

東アジア言語（中国語、日本語、韓国語など）では、代わりに [言語固有の filter](./choose-the-right-analyzer-for-your-use-case#language-specific-filters) に重点を置いてください。これらの言語は通常、テキスト処理に異なるアプローチを使用するため、stemming の恩恵をあまり受けられない可能性があります。

</Admonition>

##### テキスト正規化 filter\{#text-normalization-filters}

これらの filter は、テキストの表記のばらつきを標準化してマッチングの一貫性を向上させます:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>仕組み</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./ascii-folding-filter"><code>asciifolding</code></a></p></td>
     <td><p>アクセント付き文字を ASCII の等価文字に変換します</p></td>
     <td><p>国際的なコンテンツ、ユーザー生成コンテンツ</p></td>
     <td><ul><li><p>入力: <code>[&quot;café&quot;, &quot;naïve&quot;, &quot;résumé&quot;]</code></p></li><li><p>出力: <code>[['cafe'], ['naive'], ['resume']]</code></p></li></ul></td>
   </tr>
</table>

##### トークンフィルタリング\{#token-filtering}

文字の内容または長さに基づいて、保持するトークンを制御します:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>仕組み</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./remove-punct-filter"><code>removepunct</code></a></p></td>
     <td><p>独立した句読点トークンを削除します</p></td>
     <td><p><code>jieba</code>、<code>lindera</code>、<code>icu</code> tokenizer の出力をクリーンアップする場合。これらの tokenizer は句読点を単一のトークンとして返します</p></td>
     <td><ul><li><p>入力: <code>[&quot;Hello&quot;, &quot;!&quot;, &quot;world&quot;]</code></p></li><li><p>出力: <code>[['Hello'], ['world']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./alphanumonly-filter"><code>alphanumonly</code></a></p></td>
     <td><p>文字と数字のみを保持します</p></td>
     <td><p>技術的なコンテンツ、クリーンなテキスト処理</p></td>
     <td><ul><li><p>入力: <code>[&quot;user123&quot;, &quot;test@email.com&quot;]</code></p></li><li><p>出力: <code>[['user123'], ['test', 'email', 'com']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./length-filter"><code>length</code></a></p></td>
     <td><p>指定した長さの範囲外のトークンを削除します</p></td>
     <td><p>ノイズの除外（長すぎるトークン）</p></td>
     <td><ul><li><p>入力: <code>[&quot;a&quot;, &quot;very&quot;, &quot;extraordinarily&quot;]</code></p></li><li><p>出力: <code>[['a'], ['very'], []]</code>（<strong>max=10</strong> の場合）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./regex-filter"><code>regex</code></a></p></td>
     <td><p>カスタムのパターンベースのフィルタリング</p></td>
     <td><p>ドメイン固有のトークン要件</p></td>
     <td><ul><li><p>入力: <code>[&quot;test123&quot;, &quot;prod456&quot;]</code></p></li><li><p>出力: <code>[[], ['prod456']]</code>（<strong>expr=&quot;^prod&quot;</strong> の場合）</p></li></ul></td>
   </tr>
</table>

##### 言語固有の filter\{#language-specific-filters}

これらの filter は、特定の言語の特性を処理します:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>言語</p></th>
     <th><p>仕組み</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./decompounder-filter"><code>decompounder</code></a></p></td>
     <td><p>ドイツ語</p></td>
     <td><p>複合語を検索可能な構成要素に分割します</p></td>
     <td><ul><li><p>入力: <code>[&quot;dampfschifffahrt&quot;]</code></p></li><li><p>出力: <code>[['dampf', 'schiff', 'fahrt']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cnalphanumonly-filter">cnalphanumonly</a></p></td>
     <td><p>中国語</p></td>
     <td><p>中国語の文字と英数字を保持します</p></td>
     <td><ul><li><p>入力: <code>[&quot;Hello&quot;, &quot;世界&quot;, &quot;123&quot;, &quot;!@#&quot;]</code></p></li><li><p>出力: <code>[['Hello'], ['世界'], ['123'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cncharonly-filter"><code>cncharonly</code></a></p></td>
     <td><p>中国語</p></td>
     <td><p>中国語の文字のみを保持します</p></td>
     <td><ul><li><p>入力: <code>[&quot;Hello&quot;, &quot;世界&quot;, &quot;123&quot;]</code></p></li><li><p>出力: <code>[[], ['世界'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./pinyin-filter"><code>pinyin</code></a></p></td>
     <td><p>中国語</p></td>
     <td><p>中国語のトークンに対してピンイン形式のトークンを出力します</p></td>
     <td><ul><li><p>入力: <code>[&quot;中文&quot;]</code></p></li><li><p>出力: <code>[['中文', 'zhong', 'wen']]</code></p></li></ul></td>
   </tr>
</table>

#### ステップ 3: 組み合わせて実装する\{#step-3-combine-and-implement}

カスタム analyzer を作成するには、`analyzer_params` ディクショナリで tokenizer と filter のリストを定義します。filter は記載された順序で適用されます。

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

#### 最後に: `run_analyzer` でテストする\{#final-test-with-runanalyzer}

コレクションに適用する前に、必ず構成を検証してください:

```python
# Sample text to analyze
sample_text = "The Milvus vector database is built for scale!"

# Run analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

確認すべき一般的な問題:

- **過剰なトークン化**: 技術用語が正しく分割されない

- **過少なトークン化**: フレーズが適切に分割されない

- **トークンの欠落**: 重要な用語がフィルタリングによって除外される

詳細な使用方法については、[run_analyzer](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md) を参照してください。

## ユースケース別のクイックレシピ\{#quick-recipes-by-use-case}

このセクションでは、Zilliz Cloud で analyzer を使用する際の一般的なユースケース向けに、推奨される tokenizer と filter の構成を提供します。コンテンツの種類と検索要件に最も適した組み合わせを選択してください。

<Admonition type="info" title="Notes">

コレクションに analyzer を適用する前に、[`run_analyzer`](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md) を使用してテキスト解析のパフォーマンスをテストおよび検証することをお勧めします。

</Admonition>

### 英語\{#english}

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

### ヒンディー語\{#hindi}

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

### 日本語\{#japanese}

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

### ポルトガル語\{#portuguese}

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

### ウルドゥー語\{#urdu}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 混在または多言語コンテンツ\{#mixed-or-multilingual-content}

複数の言語にまたがるコンテンツや、文字体系が予測できないコンテンツを扱う場合は、`icu` analyzer から開始してください。この Unicode 対応の analyzer は、混在する文字体系や記号を効果的に処理します。

**基本的な多言語構成（stemming なし）**:

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
}
```

**高度な多言語処理**:

異なる言語間でトークンの動作をより細かく制御するには:

- **多言語 analyzer** 構成を使用します。詳細については、[多言語 analyzer](./multi-language-analyzers) を参照してください。

- コンテンツに **language identifier** を実装します。詳細については、[language identifier](./language-identifier-tokenizer) を参照してください。

## Zilliz Cloud での analyzer の構成とプレビュー\{#configure-and-preview-analyzers-in-zilliz-cloud}

Zilliz Cloud では、コードを記述することなく、[Zilliz Cloud](https://cloud.zilliz.com/) [コンソール](https://cloud.zilliz.com/) から直接テキスト analyzer を構成してテストできます。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />


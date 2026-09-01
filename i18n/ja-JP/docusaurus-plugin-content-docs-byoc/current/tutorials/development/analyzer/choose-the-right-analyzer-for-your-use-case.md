---
title: "ユースケースに適したアナライザーの選択 | BYOC"
slug: /choose-the-right-analyzer-for-your-use-case
sidebar_label: "ベストプラクティス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud のテキストコンテンツに最適なアナライザーを選択し、設定する方法を解説します。 | BYOC"
type: origin
token: Pulhw06e5iXJTFkidFXcGbylnod
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# ユースケースに適したアナライザーの選択

このガイドでは、Zilliz Cloud のテキストコンテンツに最適な **アナライザー** を選択・設定する方法を解説します。

本ガイドは **実践的な意思決定** に焦点を当てており、どのアナライザーを使うべきか、いつカスタマイズすべきか、設定をどう検証するかを扱います。アナライザーの構成要素やパラメーターに関する背景知識については、[アナライザー概要](./analyzer-overview) を参照してください。

## 基本概念: アナライザーの仕組み\{#quick-concept-how-analyzers-work}

アナライザーは、[全文検索](./full-text-search)（BM25 ベース）、[フレーズ一致](./phrase-match)、[テキスト一致](./text-match) などの機能でテキストデータを検索可能にするために処理を行います。2 段階のパイプラインを通じて、生のテキストを検索可能な個々のトークンに変換します。

![JwMZwIYUwhbSZ4bjhxcc1PfNnvx](https://zdoc-images.s3.us-west-2.amazonaws.com/JwMZwIYUwhbSZ4bjhxcc1PfNnvx.png)

1. **トークン化（必須）:** この初期段階では、**トークナイザー** を適用して連続するテキスト文字列をトークンと呼ばれる個別の意味単位に分割します。トークン化の手法は、言語やコンテンツの種類によって大きく異なります。

1. **トークンフィルタリング（オプション）:** トークン化の後、**フィルター** を適用してトークンの変更、削除、または調整を行います。これらの操作には、すべてのトークンを小文字に変換する、一般的な無意味語（ストップワードなど）を削除する、単語を語幹に還元する（ステミング）などが含まれます。

例:

```plaintext
Input: "Hello World!"
       1. Tokenization → ["Hello", "World", "!"]
       2. Lowercase & Punctuation Filtering → ["hello", "world"]
```

## アナライザーの選択が重要な理由\{#why-the-choice-of-analyzer-matters}

選択するアナライザーは、**検索品質と関連性** に直接影響します。

不適切なアナライザーを使用すると、過剰または過少なトークン化、用語の欠落、無関係な結果の表示などを引き起こす可能性があります。

<table>
   <tr>
     <th><p>問題</p></th>
     <th><p>症状</p></th>
     <th><p>例（入力と出力）</p></th>
     <th><p>原因（不適切なアナライザー）</p></th>
     <th><p>解決策（適切なアナライザー）</p></th>
   </tr>
   <tr>
     <td><p>過剰トークン化</p></td>
     <td><p>技術用語、識別子、URL が誤って分割される</p></td>
     <td><ul><li><p><code>&quot;user_id&quot;</code> → <code>['user', 'id']</code></p></li><li><p><code>&quot;C++&quot;</code> → <code>['c']</code></p></li></ul></td>
     <td><p><a href="./standard-analyzer"><code>standard</code></a> アナライザー</p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーを使用し、<a href="./alphanumonly-filter"><code>alphanumonly</code></a> フィルターと組み合わせます。</p></td>
   </tr>
   <tr>
     <td><p>過少トークン化</p></td>
     <td><p>複数語のフレーズが単一のトークンとして扱われる</p></td>
     <td><p><code>&quot;state-of-the-art&quot;</code> → <code>['state-of-the-art']</code></p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーを使用するアナライザー</p></td>
     <td><p>句読点やスペースで分割するには <a href="./standard-tokenizer"><code>standard</code></a> トークナイザーを使用し、カスタム <a href="./regex-filter">regex</a> フィルターを併用します。</p></td>
   </tr>
   <tr>
     <td><p>言語の不一致</p></td>
     <td><p>外国語の検索結果が無意味になる</p></td>
     <td><p>中国語テキスト: <code>&quot;机器学习&quot;</code> → <code>['机器学习']</code>（1 トークン）</p></td>
     <td><p><a href="./english-analyzer"><code>english</code></a> アナライザー</p></td>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a> などの言語固有のアナライザーを使用します。</p></td>
   </tr>
   <tr>
     <td><p>入力方式の不一致</p></td>
     <td><p>ユーザーはピンインを入力するが、インデックス化されたテキストは漢字である。</p></td>
     <td><p>中国語テキスト: <code>&quot;足球&quot;</code>; クエリテキスト: <code>&quot;zuqiu&quot;</code></p></td>
     <td><p>漢字トークンのみを出力するアナライザー</p></td>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a> トークナイザーと <a href="./pinyin-filter"><code>pinyin</code></a> フィルターを備えたカスタムアナライザーを使用します。</p></td>
   </tr>
</table>

## ステップ 1: アナライザーの選択は必要か？\{#step-1-do-you-need-to-choose-an-analyzer}

テキスト検索機能（**全文検索**、**フレーズ一致**、**テキスト一致** など）を使用しているものの、**アナライザーを明示的に指定していない** 場合、

Zilliz Cloud は自動的に [標準アナライザー](./standard-analyzer) を適用します。

**標準アナライザーの動作**:

- スペースと句読点でテキストを分割する

- すべてのトークンを小文字に変換する

**変換例**:

```plaintext
Input:  "The Milvus vector database is built for scale!"
Output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

## ステップ 2: 標準アナライザーで要件を満たせるか確認する\{#step-2-check-if-the-standard-analyzer-meets-your-needs}

以下の表を参考に、デフォルトの [`standard`](./standard-analyzer)[ アナライザー](./standard-analyzer) で要件を満たせるかを素早く判断できます。満たさない場合は、[別のアプローチを選択](./choose-the-right-analyzer-for-your-use-case#step-3-choose-your-path) する必要があります。

| コンテンツ | 標準アナライザーで十分か？ | 理由 | 必要な対応 |
| --- | --- | --- | --- |
| 英語のブログ記事 | ✅ はい | デフォルトの動作で十分です。 | デフォルトを使用します（設定不要）。 |
| 中国語のドキュメント | ❌ いいえ | 中国語の単語間にはスペースがないため、全体が 1 つのトークンとして扱われます。 | 組み込みの [`chinese`](./chinese-analyzer) アナライザーを使用します。 |
| 技術ドキュメント | ❌ いいえ | `C++` のような用語から句読点が除去されます。 | [`whitespace`](./whitespace-tokenizer) トークナイザーと [`alphanumonly`](./alphanumonly-filter) フィルターを備えたカスタムアナライザーを作成します。 |
| フランス語/Spanish テキストなどのスペース区切り言語 | ⚠️ 場合による | アクセント付き文字（`café` と `cafe`）が一致しない場合があります。 | より良い結果を得るには、[`asciifolding`](./ascii-folding-filter) を備えたカスタムアナライザーの使用を推奨します。 |
| 多言語または不明な言語 | ❌ いいえ | `standard` アナライザーには、異なる文字セットやトークン化ルールを処理するための言語固有ロジックがありません。 | Unicode 対応のトークン化を行うには、[`icu`](./icu-tokenizer) トークナイザーを備えたカスタムアナライザーを使用します。<br/>あるいは、多言語コンテンツをより正確に処理するために、[多言語アナライザー](./multi-language-analyzers) や [言語識別子](./language-identifier-tokenizer) の設定を検討してください。 |

## ステップ 3: アプローチを選択する\{#step-3-choose-your-path}

デフォルトの [標準アナライザー](./standard-analyzer) では不十分な場合、以下の 2 つのアプローチからいずれかを選択します。

- **アプローチ A – 組み込みアナライザーを使用する**（すぐに使用可能、言語固有）

- **アプローチ B – カスタムアナライザーを作成する**（トークナイザーと一連のフィルターを手動で定義）

### アプローチ A: 組み込みアナライザーを使用する\{#path-a-use-built-in-analyzers}

組み込みアナライザーは、主要な言語向けに事前設定されたソリューションです。デフォルトの標準アナライザーが完全に適合しない場合に、最も手軽に導入できる方法です。

#### 利用可能な組み込みアナライザー\{#available-built-in-analyzers}

<table>
   <tr>
     <th><p>アナライザー</p></th>
     <th><p>対応言語</p></th>
     <th><p>コンポーネント</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-analyzer"><code>standard</code></a></p></td>
     <td><p>ほとんどのスペース区切り言語（英語、フランス語、ドイツ語、スペイン語など）</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code></p></li></ul></td>
     <td><p>テキストの前処理用汎用アナライザーです。単一言語のシナリオでは、言語固有のアナライザー（<code>english</code> など）の方が優れたパフォーマンスを発揮します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./english-analyzer"><code>english</code></a></p></td>
     <td><p>Dedicated から派生した英語向けアナライザー。ステミングとストップワード除去を適用し、英語の意味的一致精度を向上させます</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code>, <code>stemmer</code>, <code>stop</code></p></li></ul></td>
     <td><p>英語のみのコンテンツには <code>standard</code> よりも推奨されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a></p></td>
     <td><p>中国語</p></td>
     <td><ul><li><p>トークナイザー: <code>jieba</code></p></li><li><p>フィルター: <code>cnalphanumonly</code></p></li></ul></td>
     <td><p>現在はデフォルトで簡体字中国語辞書を使用します。</p></td>
   </tr>
</table>

#### 実装例\{#implementation-example}

組み込みアナライザーを使用するには、フィールドスキーマの定義時に `analyzer_params` でタイプを指定するだけです。

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

詳細な使用方法については、[全文検索](./full-text-search)、[テキスト一致](./text-match)、または[フレーズ一致](./phrase-match)を参照してください。

</Admonition>

### パス B: カスタムアナライザーの作成\{#path-b-create-a-custom-analyzer}

[組み込み](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)[オプション](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)で要件を満たせない場合は、トークナイザーとフィルターを組み合わせてカスタムアナライザーを作成できます。これにより、テキスト処理パイプラインを完全に制御できます。

#### 手順 1: 言語に応じたトークナイザーの選択\{#step-1-select-the-tokenizer-based-on-language}

コンテンツの主要言語に応じてトークナイザーを選択します。

##### 欧米言語\{#western-languages}

スペース区切りの言語では、以下の選択肢があります。

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a></p></td>
     <td><p>スペースや句読点に基づいてテキストを分割</p></td>
     <td><p>一般的なテキスト、句読点が混在するテキスト</p></td>
     <td><ul><li><p>入力: <code>&quot;Hello, world! Visit example.com&quot;</code></p></li><li><p>出力: <code>['Hello', 'world', 'Visit', 'example', 'com']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a></p></td>
     <td><p>空白文字のみで分割</p></td>
     <td><p>前処理済みのコンテンツ、ユーザーが整形したテキスト</p></td>
     <td><ul><li><p>入力: <code>&quot;user_id = get_user_data()&quot;</code></p></li><li><p>出力: <code>['user_id', '=', 'get_user_data()']</code></p></li></ul></td>
   </tr>
</table>

##### 東アジア言語\{#east-asian-languages}

辞書ベースの言語では、適切な単語分割を行うために専用のトークナイザーが必要です。

###### 中国語\{#chinese}

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a></p></td>
     <td><p>インテリジェントアルゴリズムを用いた中国語辞書ベースの分割</p></td>
     <td><p><strong>中国語コンテンツに推奨</strong> - 辞書とインテリジェントアルゴリズムを組み合わせ、中国語向けに特別に設計されています</p></td>
     <td><ul><li><p>入力: <code>&quot;机器学习是人工智能的一个分支&quot;</code></p></li><li><p>出力: <code>['机器', '学习', '是', '人工', '智能', '人工智能', '的', '一个', '分支']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p>中国語辞書 (<a href="https://cc-cedict.org/wiki/">cc-cedict</a>) を使用した純粋な辞書ベースの形態素解析</p></td>
     <td><p><code>jieba</code>と比較して、中国語テキストをより汎用的に処理</p></td>
     <td><ul><li><p>入力: <code>&quot;机器学习算法&quot;</code></p></li><li><p>出力: <code>[&quot;机器&quot;, &quot;学习&quot;, &quot;算法&quot;]</code></p></li></ul></td>
   </tr>
</table>

###### 日本語と韓国語\{#japanese-and-korean}

<table>
   <tr>
     <th><p>言語</p></th>
     <th><p>トークナイザー</p></th>
     <th><p>辞書オプション</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p>日本語</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://taku910.github.io/mecab/">ipadic</a> (汎用), <a href="https://github.com/neologd/mecab-ipadic-neologd">ipadic-neologd</a> (現代語), <a href="https://clrd.ninjal.ac.jp/unidic/">unidic</a> (学術)</p></td>
     <td><p>固有名詞処理に対応した形態素解析</p></td>
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

言語が予測できない場合や、ドキュメント内で複数の言語が混在する場合:

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./icu-tokenizer"><code>icu</code></a></p></td>
     <td><p>Unicode 対応トークナイゼーション (International Components for Unicode)</p></td>
     <td><p>複数の文字体系が混在するテキスト、不明な言語、または単純なトークナイゼーションで十分な場合</p></td>
     <td><ul><li><p>入力: <code>&quot;Hello 世界 مرحبا&quot;</code></p></li><li><p>出力: <code>['Hello', ' ', '世界', ' ', 'مرحبا']</code></p></li></ul></td>
   </tr>
</table>

**icu を使用するケース**:

- 言語識別が現実的ではないほど複数の言語が混在している場合。

- [多言語アナライザー](./multi-language-analyzers)や[言語識別子](./language-identifier-tokenizer)のオーバーヘッドを避けたい場合。

- 主要言語があり、全体の意味への寄与が少ない外来語が時折含まれるコンテンツ（例: 英語のテキストに日本語やフランス語のブランド名や技術用語が散発的に含まれる場合）。

**代替アプローチ**: 多言語コンテンツをより正確に処理するには、多言語アナライザーまたは言語識別子の使用を検討してください。詳細については、[多言語アナライザー](./multi-language-analyzers)または[言語識別子](./language-identifier-tokenizer)を参照してください。

#### 手順 2: 精度向上のためのフィルター追加\{#step-2-add-filters-for-precision}

[トークナイザーを選択](./choose-the-right-analyzer-for-your-use-case#step-1-select-the-tokenizer-based-on-language)したら、検索要件やコンテンツの特性に合わせてフィルターを適用します。

##### よく使われるフィルター\{#commonly-used-filters}

これらのフィルターは、スペース区切りの言語（英語、フランス語、ドイツ語、スペイン語など）のほとんどの構成に不可欠であり、検索品質を大幅に向上させます。

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>仕組み</p></th>
     <th><p>使用タイミング</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./lowercase-filter"><code>lowercase</code></a></p></td>
     <td><p>すべてのトークンを小文字に変換</p></td>
     <td><p>汎用 - 大文字・小文字の区別があるすべての言語に適用</p></td>
     <td><ul><li><p>入力: <code>[&quot;Apple&quot;, &quot;iPhone&quot;]</code></p></li><li><p>出力: <code>[['apple'], ['iphone']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stemmer-filter"><code>stemmer</code></a></p></td>
     <td><p>単語を語根形式に還元</p></td>
     <td><p>語形変化のある言語（英語、フランス語、ドイツ語など）</p></td>
     <td><p>英語の場合:</p><ul><li><p>入力: <code>[&quot;running&quot;, &quot;runs&quot;, &quot;ran&quot;]</code></p></li><li><p>出力: <code>[['run'], ['run'], ['ran']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stop-filter"><code>stop</code></a></p></td>
     <td><p>一般的な無意味語を除去</p></td>
     <td><p>ほとんどの言語 - 特にスペース区切りの言語で効果的</p></td>
     <td><ul><li><p>入力: <code>[&quot;the&quot;, &quot;quick&quot;, &quot;brown&quot;, &quot;fox&quot;]</code></p></li><li><p>出力: <code>[[], ['quick'], ['brown'], ['fox']]</code></p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

東アジア言語（中国語、日本語、韓国語など）の場合は、代わりに[言語固有のフィルター](./choose-the-right-analyzer-for-your-use-case#language-specific-filters)に注目してください。これらの言語はテキスト処理のアプローチが異なるため、ステミングの効果が限定的な場合があります。

</Admonition>

##### テキスト正規化フィルター\{#text-normalization-filters}

これらのフィルターはテキストの表記揺れを正規化し、マッチングの一貫性を高めます。

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>動作の仕組み</p></th>
     <th><p>使用場面</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./ascii-folding-filter"><code>asciifolding</code></a></p></td>
     <td><p>アクセント記号付き文字を ASCII 相当に変換</p></td>
     <td><p>多言語コンテンツ、ユーザー生成コンテンツ</p></td>
     <td><ul><li><p>入力: <code>[&quot;café&quot;, &quot;naïve&quot;, &quot;résumé&quot;]</code></p></li><li><p>出力: <code>[['cafe'], ['naive'], ['resume']]</code></p></li></ul></td>
   </tr>
</table>

##### トークンフィルタリング\{#token-filtering}

文字種別や長さに基づいて、保持するトークンを制御します。

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>動作の仕組み</p></th>
     <th><p>使用場面</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./remove-punct-filter"><code>removepunct</code></a></p></td>
     <td><p>単独の句読点トークンを削除</p></td>
     <td><p><code>jieba</code>、<code>lindera</code>、<code>icu</code> トークナイザーの出力をクリーンアップします。これらのトークナイザーは句読点を単一トークンとして返す場合があります。</p></td>
     <td><ul><li><p>入力: <code>[&quot;Hello&quot;, &quot;!&quot;, &quot;world&quot;]</code></p></li><li><p>出力: <code>[['Hello'], ['world']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./alphanumonly-filter"><code>alphanumonly</code></a></p></td>
     <td><p>英数字のみを保持</p></td>
     <td><p>技術系コンテンツ、クリーンなテキスト処理</p></td>
     <td><ul><li><p>入力: <code>[&quot;user123&quot;, &quot;test@email.com&quot;]</code></p></li><li><p>出力: <code>[['user123'], ['test', 'email', 'com']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./length-filter"><code>length</code></a></p></td>
     <td><p>指定した長さ範囲外のトークンを削除</p></td>
     <td><p>ノイズ（極端に長いトークンなど）を除去</p></td>
     <td><ul><li><p>入力: <code>[&quot;a&quot;, &quot;very&quot;, &quot;extraordinarily&quot;]</code></p></li><li><p>出力: <code>[['a'], ['very'], []]</code>（<strong>max=10</strong> の場合）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./regex-filter"><code>regex</code></a></p></td>
     <td><p>カスタムパターンによるフィルタリング</p></td>
     <td><p>ドメイン固有のトークン要件に対応</p></td>
     <td><ul><li><p>入力: <code>[&quot;test123&quot;, &quot;prod456&quot;]</code></p></li><li><p>出力: <code>[[], ['prod456']]</code>（<strong>expr=&quot;^prod&quot;</strong> の場合）</p></li></ul></td>
   </tr>
</table>

##### 言語固有のフィルター\{#language-specific-filters}

これらのフィルターは、各言語に特有の特性を処理します。

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>言語</p></th>
     <th><p>動作の仕組み</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./decompounder-filter"><code>decompounder</code></a></p></td>
     <td><p>ドイツ語</p></td>
     <td><p>複合語を検索可能な構成要素に分割</p></td>
     <td><ul><li><p>入力: <code>[&quot;dampfschifffahrt&quot;]</code></p></li><li><p>出力: <code>[['dampf', 'schiff', 'fahrt']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cnalphanumonly-filter">cnalphanumonly</a></p></td>
     <td><p>中国語</p></td>
     <td><p>漢字と英数字を保持</p></td>
     <td><ul><li><p>入力: <code>[&quot;Hello&quot;, &quot;世界&quot;, &quot;123&quot;, &quot;!@#&quot;]</code></p></li><li><p>出力: <code>[['Hello'], ['世界'], ['123'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cncharonly-filter"><code>cncharonly</code></a></p></td>
     <td><p>中国語</p></td>
     <td><p>漢字のみを保持</p></td>
     <td><ul><li><p>入力: <code>[&quot;Hello&quot;, &quot;世界&quot;, &quot;123&quot;]</code></p></li><li><p>出力: <code>[[], ['世界'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./pinyin-filter"><code>pinyin</code></a></p></td>
     <td><p>中国語</p></td>
     <td><p>中国語トークンのピンイン形式を出力</p></td>
     <td><ul><li><p>入力: <code>[&quot;中文&quot;]</code></p></li><li><p>出力: <code>[['中文', 'zhong', 'wen']]</code></p></li></ul></td>
   </tr>
</table>

#### ステップ3: 組み合わせて実装する\{#step-3-combine-and-implement}

カスタムアナライザーを作成するには、`analyzer_params` ディクショナリでトークナイザーとフィルターのリストを定義します。フィルターはリスト順に適用されます。

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

コレクションに適用する前に、必ず設定を検証してください。

```python
# Sample text to analyze
sample_text = "The Milvus vector database is built for scale!"

# Run analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

確認すべき一般的な問題:

- **過剰トークン化**: 技術用語が誤って分割される

- **トークン分割不足**: フレーズが適切に分離されない

- **トークンの欠落**: 重要な用語がフィルターで除外される

詳細な使用方法については、[run_analyzer](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md) を参照してください。

## ユースケース別のクイックレシピ\{#quick-recipes-by-use-case}

このセクションでは、Zilliz Cloud でアナライザーを使用する際の一般的なユースケース向けに、推奨されるトークナイザーとフィルターの構成を紹介します。コンテンツの種類と検索要件に最適な組み合わせを選択してください。

<Admonition type="info" icon="📘" title="Notes">

アナライザーをコレクションに適用する前に、[`run_analyzer`](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md) を使用してテキスト解析のパフォーマンスをテスト・検証することを推奨します。

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

### 混合または多言語コンテンツ\{#mixed-or-multilingual-content}

複数の言語にまたがるコンテンツや、使用される文字体系が予測できないコンテンツを扱う場合は、まず `icu` アナライザーを使用してください。この Unicode 対応アナライザーは、混在する文字体系や記号を効果的に処理できます。

**基本的な多言語設定（ステミングなし）**:

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
}
```

**高度な多言語処理**:

言語ごとにトークンの挙動をより細かく制御するには、次の方法があります。

- **多言語アナライザー**の設定を使用します。詳細は「[多言語アナライザー](./multi-language-analyzers)」を参照してください。

- コンテンツに**言語識別子**を実装します。詳細は「[言語識別子](./language-identifier-tokenizer)」を参照してください。

## Zilliz Cloud でアナライザーを設定・プレビューする\{#configure-and-preview-analyzers-in-zilliz-cloud}

Zilliz Cloud では、コードを書かずに [Zilliz Cloud](https://cloud.zilliz.com/) [コンソール](https://cloud.zilliz.com/) から直接テキストアナライザーの設定とテストを行えます。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />

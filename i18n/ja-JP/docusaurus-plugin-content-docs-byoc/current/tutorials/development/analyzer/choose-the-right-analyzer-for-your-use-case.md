---
title: "ユースケースに最適なアナライザーを選択する | BYOC"
slug: /choose-the-right-analyzer-for-your-use-case
sidebar_label: "ベストプラクティス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドは、Zilliz Cloud のテキストコンテンツに最適なアナライザーを選択して構成するのに役立ちます。 | BYOC"
type: origin
token: Pulhw06e5iXJTFkidFXcGbylnod
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# ユースケースに最適なアナライザーを選択する

このガイドは、Zilliz Cloud のテキストコンテンツに最適な **アナライザー** を選択して構成するのに役立ちます。

このガイドは **実践的な意思決定** に焦点を当てています。どのアナライザーを使用するか、いつカスタマイズするか、構成をどのように検証するかについて説明します。アナライザーのコンポーネントとパラメーターの背景については、[アナライザーの概要](./analyzer-overview) を参照してください。

## クイックコンセプト: アナライザーの仕組み\{#quick-concept-how-analyzers-work}

アナライザーはテキストデータを処理し、[全文検索](./full-text-search)（BM25 ベース）、[フレーズマッチ](./phrase-match)、[テキストマッチ](./text-match) などの機能で検索できるようにします。2 段階のパイプラインを通じて、生のテキストを個別の検索可能なトークンに変換します。

![JwMZwIYUwhbSZ4bjhxcc1PfNnvx](https://zdoc-images.s3.us-west-2.amazonaws.com/JwMZwIYUwhbSZ4bjhxcc1PfNnvx.png)

1. **トークン化（必須）:** この初期段階では **トークナイザー** を適用し、連続するテキスト文字列をトークンと呼ばれる個別の意味単位に分割します。トークン化の方法は、言語とコンテンツの種類によって大きく異なる場合があります。

1. **トークンフィルタリング（任意）:** トークン化の後、**フィルター** が適用されてトークンを変更、削除、または絞り込みます。これらの操作には、すべてのトークンを小文字に変換する、一般的な無意味語（ストップワードなど）を削除する、単語を原形に還元する（ステミング）などがあります。

例:

```plaintext
Input: "Hello World!" 
       1. Tokenization → ["Hello", "World", "!"]
       2. Lowercase & Punctuation Filtering → ["hello", "world"]
```

## アナライザーの選択が重要な理由\{#why-the-choice-of-analyzer-matters}

選択するアナライザーは、**検索品質と関連性** に直接影響します。

不適切なアナライザーは、トークン化の不足や過剰、用語の欠落、無関係な結果を引き起こす可能性があります。

<table>
   <tr>
     <th><p>問題</p></th>
     <th><p>症状</p></th>
     <th><p>例（入力と出力）</p></th>
     <th><p>原因（不適切なアナライザー）</p></th>
     <th><p>解決策（適切なアナライザー）</p></th>
   </tr>
   <tr>
     <td><p>トークン化の過剰</p></td>
     <td><p>技術用語、識別子、URL が誤って分割されます。</p></td>
     <td><ul><li><p><code>&quot;user_id&quot;</code> → <code>['user', 'id']</code></p></li><li><p><code>&quot;C++&quot;</code> → <code>['c']</code></p></li></ul></td>
     <td><p><a href="./standard-analyzer"><code>standard</code></a> アナライザー</p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーを使用し、<a href="./alphanumonly-filter"><code>alphanumonly</code></a> フィルターと組み合わせます。</p></td>
   </tr>
   <tr>
     <td><p>トークン化の不足</p></td>
     <td><p>複数語のフレーズが単一のトークンとして扱われます。</p></td>
     <td><p><code>&quot;state-of-the-art&quot;</code> → <code>['state-of-the-art']</code></p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザー</p></td>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a> トークナイザーで区切り文字とスペースで分割し、カスタムの <a href="./regex-filter">regex</a> フィルターを使用します。</p></td>
   </tr>
   <tr>
     <td><p>言語の不一致</p></td>
     <td><p>外国語の結果が無意味になります。</p></td>
     <td><p>中国語のテキスト: <code>&quot;机器学习&quot;</code> → <code>['机器学习']</code>（1つのトークン）</p></td>
     <td><p><a href="./english-analyzer"><code>english</code></a> アナライザー</p></td>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a> などの言語固有のアナライザーを使用します。</p></td>
   </tr>
   <tr>
     <td><p>入力方式の不一致</p></td>
     <td><p>ユーザーはピンインを入力しますが、インデックスされるテキストは漢字を使用します。</p></td>
     <td><p>中国語のテキスト: <code>&quot;足球&quot;</code>、クエリテキスト: <code>&quot;zuqiu&quot;</code></p></td>
     <td><p>漢字のトークンのみを生成するアナライザー</p></td>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a> トークナイザーと <a href="./pinyin-filter"><code>pinyin</code></a> フィルターを使用したカスタムアナライザーを使用します。</p></td>
   </tr>
</table>

## ステップ 1: アナライザーを選択する必要があるか\{#step-1-do-you-need-to-choose-an-analyzer}

テキスト検索機能（**全文検索**、**フレーズマッチ**、**テキストマッチ** など）を使用しているものの、**アナライザーを明示的に指定していない** 場合は、

Zilliz Cloud は [standard アナライザー](./standard-analyzer) を自動的に適用します。

**standard アナライザーの動作**:

- テキストをスペースと句読点で分割します。

- すべてのトークンを小文字に変換します。

**変換例**:

```plaintext
Input:  "The Milvus vector database is built for scale!"
Output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

## ステップ 2: standard アナライザーがニーズを満たすか確認する\{#step-2-check-if-the-standard-analyzer-meets-your-needs}

この表を使用して、デフォルトの [`standard`](./standard-analyzer)[ アナライザー](./standard-analyzer) がニーズを満たすかどうかをすばやく判断します。満たさない場合は、[別のパスを選択する](./choose-the-right-analyzer-for-your-use-case#step-3-choose-your-path)。

| コンテンツ | standard アナライザーで問題ないか | 理由 | 必要な対応 |
| --- | --- | --- | --- |
| 英語のブログ記事 | ✅ はい | デフォルトの動作で十分です。 | デフォルトを使用します（構成は不要です）。 |
| 中国語のドキュメント | ❌ いいえ | 中国語の単語にはスペースがなく、1つのトークンとして扱われます。 | 組み込みの [`chinese`](./chinese-analyzer) アナライザーを使用します。 |
| 技術ドキュメント | ❌ いいえ | `C++` のような用語から句読点が削除されます。 | [`whitespace`](./whitespace-tokenizer) トークナイザーと [`alphanumonly`](./alphanumonly-filter) フィルターを使用してカスタムアナライザーを作成します。 |
| フランス語やスペイン語（French/Spanish）などスペースで区切る言語のテキスト | ⚠️ 場合による | アクセント付き文字（`café` と `cafe`）が一致しない可能性があります。 | より良い結果を得るには、[`asciifolding`](./ascii-folding-filter) を備えたカスタムアナライザーをお勧めします。 |
| 多言語または不明な言語 | ❌ いいえ | `standard` アナライザーには、異なる文字セットとトークン化ルールを処理するために必要な言語固有のロジックがありません。 | Unicode 対応のトークン化には、[`icu`](./icu-tokenizer) トークナイザーを使用したカスタムアナライザーを使用します。<br/>または、多言語コンテンツをより正確に処理するために、[multi-language analyzers](./multi-language-analyzers) または [language identifier](./language-identifier-tokenizer) の構成を検討してください。 |

## ステップ 3: パスを選択する\{#step-3-choose-your-path}

デフォルトの [standard アナライザー](./standard-analyzer) で不十分な場合は、2 つのパスのいずれかを選択します。

- **パス A – 組み込みアナライザーを使用する**（すぐに使用可能、言語固有）

- **パス B – カスタムアナライザーを作成する**（トークナイザーと一連のフィルターを手動で定義）

### パス A: 組み込みアナライザーを使用する\{#path-a-use-built-in-analyzers}

組み込みアナライザーは、一般的な言語向けに事前構成されたソリューションです。デフォルトの standard アナライザーが完全には適合しない場合に、最も簡単に始められる方法です。

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
     <td><p>ほとんどのスペース区切り言語（英語、フランス語、ドイツ語、スペイン語など）</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code></p></li></ul></td>
     <td><p>初期のテキスト処理向けの汎用アナライザーです。単一言語のシナリオでは、言語固有のアナライザー（<code>english</code> など）の方が優れたパフォーマンスを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./english-analyzer"><code>english</code></a></p></td>
     <td><p>英語専用（Dedicated）で、英語のセマンティックマッチングを改善するためにステミングとストップワードの削除を適用します。</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code>、<code>stemmer</code>、<code>stop</code></p></li></ul></td>
     <td><p>英語のみのコンテンツには、<code>standard</code> よりも推奨されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a></p></td>
     <td><p>中国語</p></td>
     <td><ul><li><p>トークナイザー: <code>jieba</code></p></li><li><p>フィルター: <code>cnalphanumonly</code></p></li></ul></td>
     <td><p>現在、デフォルトで簡体字中国語の辞書を使用します。</p></td>
   </tr>
</table>

#### 実装例\{#implementation-example}

組み込みアナライザーを使用するには、フィールドスキーマを定義するときに `analyzer_params` でそのタイプを指定するだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");

schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(200)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "english"}

schema.WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(200).
    WithEnableAnalyzer(true).
    WithAnalyzerParams(analyzerParams))
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({"type": "english"});
let schema = CollectionSchema::new().add_field(FieldSchema::new()
    .name("text")
    .data_type(DataType::VarChar)
    .max_length(200)
    .enable_analyzer(true)
    .analyzer_params(analyzer_params));
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {{"type", "english"}};
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR)
                     .WithMaxLength(200)
                     .EnableAnalyzer(true)
                     .WithAnalyzerParams(analyzer_params));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = { type: "english" };

const schema = [
  {
    name: "text",
    data_type: DataType.VarChar,
    max_length: 200,
    enable_analyzer: true,
    analyzer_params,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export textField='{
  "fieldName": "text",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 200,
    "enable_analyzer": true,
    "analyzer_params": "{\"type\":\"english\"}"
  }
}'
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

詳細な使用方法については、[全文検索](./full-text-search)、[テキストマッチ](./text-match)、または [フレーズマッチ](./phrase-match) を参照してください。

</Admonition>

### パス B: カスタムアナライザーを作成する\{#path-b-create-a-custom-analyzer}

[組み込み](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)[ オプション](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers) がニーズを満たさない場合は、トークナイザーと一連のフィルターを組み合わせてカスタムアナライザーを作成できます。これにより、テキスト処理パイプラインを完全に制御できます。

#### ステップ 1: 言語に基づいてトークナイザーを選択する\{#step-1-select-the-tokenizer-based-on-language}

コンテンツの主要な言語に基づいてトークナイザーを選択します:

##### 西欧言語\{#western-languages}

スペースで区切る言語には、次のオプションがあります:

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a></p></td>
     <td><p>スペースと句読点に基づいてテキストを分割します。</p></td>
     <td><p>一般的なテキスト、混在した句読点</p></td>
     <td><ul><li><p>Input: <code>&quot;Hello, world! Visit example.com&quot;</code></p></li><li><p>Output: <code>['Hello', 'world', 'Visit', 'example', 'com']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a></p></td>
     <td><p>空白文字のみで分割します。</p></td>
     <td><p>前処理済みのコンテンツ、ユーザーが書式設定したテキスト</p></td>
     <td><ul><li><p>Input: <code>&quot;user_id = get_user_data()&quot;</code></p></li><li><p>Output: <code>['user_id', '=', 'get_user_data()']</code></p></li></ul></td>
   </tr>
</table>

##### 東アジア言語\{#east-asian-languages}

辞書ベースの言語では、適切な単語分割のために専門のトークナイザーが必要です:

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
     <td><p>インテリジェントアルゴリズムによる中国語辞書ベースの分割</p></td>
     <td><p><strong>中国語コンテンツに推奨</strong> - 辞書とインテリジェントアルゴリズムを組み合わせ、中国語向けに特別に設計されています。</p></td>
     <td><ul><li><p>Input: <code>&quot;机器学习是人工智能的一个分支&quot;</code></p></li><li><p>Output: <code>['机器', '学习', '是', '人工', '智能', '人工智能', '的', '一个', '分支']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p>中国語辞書（<a href="https://cc-cedict.org/wiki/">cc-cedict</a>）</p></td>
     <td><p><code>jieba</code> と比較して、中国語テキストをより汎用的な方法で処理します。</p></td>
     <td><ul><li><p>Input: <code>&quot;机器学习算法&quot;</code></p></li><li><p>Output: <code>[&quot;机器&quot;, &quot;学习&quot;, &quot;算法&quot;]</code></p></li></ul></td>
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
     <td><p><a href="https://taku910.github.io/mecab/">ipadic</a>（汎用）、<a href="https://github.com/neologd/mecab-ipadic-neologd">ipadic-neologd</a>（現代語）、<a href="https://clrd.ninjal.ac.jp/unidic/">unidic</a>（学術）</p></td>
     <td><p>固有名詞を処理する形態素解析</p></td>
     <td><ul><li><p>Input: <code>&quot;東京都渋谷区&quot;</code></p></li><li><p>Output: <code>[&quot;東京&quot;, &quot;都&quot;, &quot;渋谷&quot;, &quot;区&quot;]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p>韓国語</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/">ko-dic</a></p></td>
     <td><p>韓国語の形態素解析</p></td>
     <td><ul><li><p>Input: <code>&quot;안녕하세요&quot;</code></p></li><li><p>Output: <code>[&quot;안녕&quot;, &quot;하&quot;, &quot;세요&quot;]</code></p></li></ul></td>
   </tr>
</table>

##### 多言語または不明な言語\{#multilingual-or-unknown-languages}

言語が予測できない、またはドキュメント内で混在しているコンテンツの場合:

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>仕組み</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./icu-tokenizer"><code>icu</code></a></p></td>
     <td><p>Unicode 対応のトークン化（International Components for Unicode）</p></td>
     <td><p>混在した文字体系、不明な言語、または単純なトークン化で十分な場合</p></td>
     <td><ul><li><p>Input: <code>&quot;Hello 世界 مرحبا&quot;</code></p></li><li><p>Output: <code>['Hello', ' ', '世界', ' ', 'مرحبا']</code></p></li></ul></td>
   </tr>
</table>

**`icu` をいつ使用するか**:

- 言語識別が現実的でない混在言語。

- [多言語アナライザー](./multi-language-analyzers) や [言語識別子](./language-identifier-tokenizer) のオーバーヘッドを避けたい場合。

- コンテンツに主要な言語があり、全体的な意味にほとんど寄与しない外来語が時々含まれる場合（例: 英語のテキストに、日本語やフランス語のブランド名や技術用語が散発的に含まれる場合）。

**代替アプローチ**: 多言語コンテンツをより正確に処理するには、多言語アナライザーまたは言語識別子の使用を検討してください。詳細については、[多言語アナライザー](./multi-language-analyzers) または [言語識別子](./language-identifier-tokenizer) を参照してください。

#### ステップ 2: 精度を高めるためにフィルターを追加する\{#step-2-add-filters-for-precision}

[トークナイザーを選択](./choose-the-right-analyzer-for-your-use-case#step-1-select-the-tokenizer-based-on-language) した後、特定の検索要件とコンテンツの特性に基づいてフィルターを適用します。

##### 一般的に使用されるフィルター\{#commonly-used-filters}

これらのフィルターは、ほとんどのスペース区切り言語の構成（英語、フランス語、ドイツ語、スペイン語など）に不可欠であり、検索品質を大幅に向上させます:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>仕組み</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./lowercase-filter"><code>lowercase</code></a></p></td>
     <td><p>すべてのトークンを小文字に変換します。</p></td>
     <td><p>汎用 - 大文字と小文字を区別するすべての言語に適用されます。</p></td>
     <td><ul><li><p>Input: <code>[&quot;Apple&quot;, &quot;iPhone&quot;]</code></p></li><li><p>Output: <code>[['apple'], ['iphone']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stemmer-filter"><code>stemmer</code></a></p></td>
     <td><p>単語を原形に還元します。</p></td>
     <td><p>単語の活用がある言語（英語、フランス語、ドイツ語など）</p></td>
     <td><p>英語の場合:</p><ul><li><p>Input: <code>[&quot;running&quot;, &quot;runs&quot;, &quot;ran&quot;]</code></p></li><li><p>Output: <code>[['run'], ['run'], ['ran']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stop-filter"><code>stop</code></a></p></td>
     <td><p>一般的な無意味語を削除します。</p></td>
     <td><p>ほとんどの言語 - スペース区切り言語に特に効果的です。</p></td>
     <td><ul><li><p>Input: <code>[&quot;the&quot;, &quot;quick&quot;, &quot;brown&quot;, &quot;fox&quot;]</code></p></li><li><p>Output: <code>[[], ['quick'], ['brown'], ['fox']]</code></p></li></ul></td>
   </tr>
</table>

<Admonition type="info" title="Notes">

東アジア言語（中国語、日本語、韓国語など）では、代わりに [言語固有のフィルター](./choose-the-right-analyzer-for-your-use-case#language-specific-filters) に注目してください。これらの言語は通常、テキスト処理に異なるアプローチを使用し、ステミングの恩恵をあまり受けません。

</Admonition>

##### テキスト正規化フィルター\{#text-normalization-filters}

これらのフィルターはテキストのばらつきを標準化して、マッチングの一貫性を向上させます:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>仕組み</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./ascii-folding-filter"><code>asciifolding</code></a></p></td>
     <td><p>アクセント付き文字を同等の ASCII 文字に変換します。</p></td>
     <td><p>国際的なコンテンツ、ユーザー生成コンテンツ</p></td>
     <td><ul><li><p>Input: <code>[&quot;café&quot;, &quot;naïve&quot;, &quot;résumé&quot;]</code></p></li><li><p>Output: <code>[['cafe'], ['naive'], ['resume']]</code></p></li></ul></td>
   </tr>
</table>

##### トークンフィルタリング\{#token-filtering}

文字の内容または長さに基づいて、保持するトークンを制御します:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>仕組み</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./remove-punct-filter"><code>removepunct</code></a></p></td>
     <td><p>単独の句読点トークンを削除します。</p></td>
     <td><p><code>jieba</code>、<code>lindera</code>、<code>icu</code> トークナイザーの出力をクリーンアップします。これらは句読点を単一のトークンとして返します。</p></td>
     <td><ul><li><p>Input: <code>[&quot;Hello&quot;, &quot;!&quot;, &quot;world&quot;]</code></p></li><li><p>Output: <code>[['Hello'], ['world']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./alphanumonly-filter"><code>alphanumonly</code></a></p></td>
     <td><p>英字と数字のみを保持します。</p></td>
     <td><p>技術的なコンテンツ、クリーンなテキスト処理</p></td>
     <td><ul><li><p>Input: <code>[&quot;user123&quot;, &quot;test@email.com&quot;]</code></p></li><li><p>Output: <code>[['user123'], ['test', 'email', 'com']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./length-filter"><code>length</code></a></p></td>
     <td><p>指定した長さの範囲外のトークンを削除します。</p></td>
     <td><p>ノイズ（過度に長いトークン）をフィルタリングします。</p></td>
     <td><ul><li><p>Input: <code>[&quot;a&quot;, &quot;very&quot;, &quot;extraordinarily&quot;]</code></p></li><li><p>Output: <code>[['a'], ['very'], []]</code> (if <strong>max=10</strong>)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./regex-filter"><code>regex</code></a></p></td>
     <td><p>カスタムのパターンベースのフィルタリング</p></td>
     <td><p>ドメイン固有のトークン要件</p></td>
     <td><ul><li><p>Input: <code>[&quot;test123&quot;, &quot;prod456&quot;]</code></p></li><li><p>Output: <code>[[], ['prod456']]</code> (if <strong>expr=&quot;^prod&quot;</strong>)</p></li></ul></td>
   </tr>
</table>

##### 言語固有のフィルター\{#language-specific-filters}

これらのフィルターは、特定の言語の特性を処理します:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>言語</p></th>
     <th><p>仕組み</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./decompounder-filter"><code>decompounder</code></a></p></td>
     <td><p>ドイツ語</p></td>
     <td><p>複合語を検索可能な構成要素に分割します。</p></td>
     <td><ul><li><p>Input: <code>[&quot;dampfschifffahrt&quot;]</code></p></li><li><p>Output: <code>[['dampf', 'schiff', 'fahrt']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cnalphanumonly-filter">cnalphanumonly</a></p></td>
     <td><p>中国語</p></td>
     <td><p>漢字 + 英数字を保持します。</p></td>
     <td><ul><li><p>Input: <code>[&quot;Hello&quot;, &quot;世界&quot;, &quot;123&quot;, &quot;!@#&quot;]</code></p></li><li><p>Output: <code>[['Hello'], ['世界'], ['123'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cncharonly-filter"><code>cncharonly</code></a></p></td>
     <td><p>中国語</p></td>
     <td><p>漢字のみを保持します。</p></td>
     <td><ul><li><p>Input: <code>[&quot;Hello&quot;, &quot;世界&quot;, &quot;123&quot;]</code></p></li><li><p>Output: <code>[[], ['世界'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./pinyin-filter"><code>pinyin</code></a></p></td>
     <td><p>中国語</p></td>
     <td><p>中国語のトークンに対してピンイン形式のトークンを生成します。</p></td>
     <td><ul><li><p>Input: <code>[&quot;中文&quot;]</code></p></li><li><p>Output: <code>[['中文', 'zhong', 'wen']]</code></p></li></ul></td>
   </tr>
</table>

#### ステップ 3: 組み合わせて実装する\{#step-3-combine-and-implement}

カスタムアナライザーを作成するには、`analyzer_params` ディクショナリでトークナイザーとフィルターのリストを定義します。フィルターはリストされている順序で適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
analyzerParams.put("filter", Arrays.asList("lowercase", "alphanumonly"));

schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(200)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "whitespace",
    "filter": []any{"lowercase", "alphanumonly"},
}

schema.WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(200).
    WithEnableAnalyzer(true).
    WithAnalyzerParams(analyzerParams))
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "whitespace",
    "filter": ["lowercase", "alphanumonly"]
});
let schema = CollectionSchema::new().add_field(FieldSchema::new()
    .name("text")
    .data_type(DataType::VarChar)
    .max_length(200)
    .enable_analyzer(true)
    .analyzer_params(analyzer_params));
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"},
    {"filter", {"lowercase", "alphanumonly"}}
};
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR)
                     .WithMaxLength(200)
                     .EnableAnalyzer(true)
                     .WithAnalyzerParams(analyzer_params));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: "whitespace",
  filter: ["lowercase", "alphanumonly"],
};

const schema = [
  {
    name: "text",
    data_type: DataType.VarChar,
    max_length: 200,
    enable_analyzer: true,
    analyzer_params,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export textField='{
  "fieldName": "text",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 200,
    "enable_analyzer": true,
    "analyzer_params": "{\"tokenizer\":\"whitespace\",\"filter\":[\"lowercase\",\"alphanumonly\"]}"
  }
}'
```

</TabItem>
</Tabs>

#### 最終: `run_analyzer` でテストする\{#final-test-with-runanalyzer}

コレクションに適用する前に、必ず構成を検証してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample text to analyze
sample_text = "The Milvus vector database is built for scale!"

# Run analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;
import java.util.ArrayList;
import java.util.List;

ConnectConfig config = ConnectConfig.builder().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN").build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("The Milvus vector database is built for scale!");
RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
System.out.println(resp.getResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"The Milvus vector database is built for scale!"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParamsStr(string(bs))
result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
}

for _, r := range result {
    for _, token := range r.Tokens {
        fmt.Println("Analyzer output:", token.Text)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
    let resp = client.run_analyzer(RunAnalyzerRequest::builder()
        .texts(vec!["The Milvus vector database is built for scale!"])
        .analyzer_params(analyzer_params)
        .build()?).await?;
    println!("{:?}", resp.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

milvus::RunAnalyzerRequest request;
request.WithAnalyzerParams(analyzer_params);
request.AddText("The Milvus vector database is built for scale!");

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const result = await client.runAnalyzer({
  text: "The Milvus vector database is built for scale!",
  analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "text": ["The Milvus vector database is built for scale!"],
  "analyzerParams": "{\"type\": \"english\"}"
}'
```

</TabItem>
</Tabs>

確認すべき一般的な問題:

- **トークン化の過剰**: 技術用語が誤って分割されます。

- **トークン化の不足**: フレーズが適切に分割されません。

- **トークンの欠落**: 重要な用語がフィルタリングされて除外されます。

詳細な使用方法については、[run_analyzer](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md) を参照してください。

## ユースケース別のクイックレシピ\{#quick-recipes-by-use-case}

このセクションでは、Zilliz Cloud でアナライザーを扱う際の一般的なユースケース向けに、推奨されるトークナイザーとフィルターの構成を示します。コンテンツの種類と検索要件に最も適合する組み合わせを選択してください。

<Admonition type="info" title="Notes">

コレクションにアナライザーを適用する前に、[`run_analyzer`](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md) を使用してテキスト分析のパフォーマンスをテストおよび検証することをお勧めします。

</Admonition>

### 英語\{#english}

```json
{
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

```json
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

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": []
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
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "german"
        },
        {
            "type": "stop",
            "stop_words": [
                "_german_"
            ]
        }
    ]
}
```

### ヒンディー語\{#hindi}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": []
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
        "stop_words": []
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
        "stop_words": []
    }]
}
```

### 混合または多言語コンテンツ\{#mixed-or-multilingual-content}

複数の言語にまたがるコンテンツや、文字体系が予測できないコンテンツを扱う場合は、`icu` アナライザーから始めてください。この Unicode 対応アナライザーは、混在した文字体系と記号を効果的に処理します。

**基本的な多言語構成（ステミングなし）**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
analyzerParams.put("filter", Arrays.asList("lowercase", "asciifolding"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "icu",
    "filter": []any{"lowercase", "asciifolding"},
}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "icu"},
    {"filter", {"lowercase", "asciifolding"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: "icu",
  filter: ["lowercase", "asciifolding"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
  "tokenizer": "icu",
  "filter": ["lowercase", "asciifolding"]
}'
```

</TabItem>
</Tabs>

**高度な多言語処理**:

言語をまたいだトークンの動作をより細かく制御するには:

- **多言語アナライザー** 構成を使用します。詳細については、[多言語アナライザー](./multi-language-analyzers) を参照してください。

- コンテンツに **言語識別子** を実装します。詳細については、[言語識別子](./language-identifier-tokenizer) を参照してください。

## Zilliz Cloud でアナライザーを構成してプレビューする\{#configure-and-preview-analyzers-in-zilliz-cloud}

Zilliz Cloud では、コードを書かずに [Zilliz Cloud](https://cloud.zilliz.com/) [コンソール](https://cloud.zilliz.com/) から直接テキストアナライザーを構成してテストできます。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />


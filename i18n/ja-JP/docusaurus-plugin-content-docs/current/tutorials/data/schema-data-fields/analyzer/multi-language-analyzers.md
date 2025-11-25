---
title: "多言語アナライザー | Cloud"
slug: /multi-language-analyzers
sidebar_label: "多言語アナライザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudがテキスト分析を実行する際、通常は1つのアナライザーをコレクション内のテキストフィールド全体に適用します。そのアナライザーが英語に最適化されている場合、中国語、スペイン語、フランス語などの他の言語に必要な非常に異なるトークナイズおよびステミングの規則に対応できず、リコール率が低下します。たとえば、スペイン語の単語「teléfono」（「phone」の意味）の検索は英語中心のアナライザーでは失敗します。アクセントを削除し、スペイン語固有のステミングを適用しないため、関連する結果が見過ごされます。 | Cloud"
type: origin
token: BnYLwepruiGNpwkJfBHcdrrOnOh
sidebar_position: 5
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - multi-language
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 多言語アナライザー

Zilliz Cloudがテキスト分析を実行する際、通常は1つのアナライザーをコレクション内のテキストフィールド全体に適用します。そのアナライザーが英語に最適化されている場合、中国語、スペイン語、フランス語などの他の言語に必要な非常に異なるトークナイズおよびステミングの規則に対応できず、リコール率が低下します。たとえば、スペイン語の単語 *"teléfono"* （"phone"の意味）の検索は英語中心のアナライザーでは失敗します: アクセントを削除し、スペイン語固有のステミングを適用しないため、関連する結果が見過ごされます。

多言語アナライザーは、1つのコレクション内のテキストフィールドに対して複数のアナライザーを構成できるようにすることで、この問題を解決します。これにより、テキストフィールドに多言語ドキュメントを保存し、Zilliz Cloudが各ドキュメントの適切な言語ルールに従ってテキストを分析できます。

## 制限事項\{#limits}

- この機能はBM25ベースのテキスト検索およびスパースベクトルでのみ動作します。詳細については、[全文検索](./full-text-search)を参照してください。

- 1つのコレクション内の各ドキュメントは、言語識別子フィールド値によって決定される1つのアナライザーのみを使用できます。

- パフォーマンスはアナライザーの複雑さとテキストデータのサイズによって異なる場合があります。

## 概要\{#overview}

以下の図は、Zilliz Cloudでの多言語アナライザーの構成と使用のワークフローを示しています：

![ZDYIwC1HwhTrdlbfOgNcOZ4OnWg](/img/ZDYIwC1HwhTrdlbfOgNcOZ4OnWg.png)

1. **多言語アナライザーの構成**:

    - 形式で複数の言語固有のアナライザーを設定: `<analyzer_name>: <analyzer_config>`、各`analyzer_config`は[アナライザー概要](./analyzer-overview#analyzer-types)で説明されている標準の`analyzer_params`構成に従います。

    - 各ドキュメントのアナライザー選択を決定する特別な識別子フィールドを定義。

    - 未知の言語を処理するための`default`アナライザーを構成。

1. **コレクションの作成**:

    - 主要なフィールドを持つスキーマを定義:

        - **primary_key**: 各ドキュメントの一意識別子。

        - **text_field**: 元のテキストコンテンツを保存。

        - **identifier_field**: 各ドキュメントに使用するアナライザーを示す。

        - **vector_field**: BM25関数によって生成されるスパース埋め込みを保存。

    - BM25関数とインデックスパラメーターを構成。

1. **言語識別子付きデータの挿入**:

    - 各種の言語のテキストを含むドキュメントを追加し、各ドキュメントには使用するアナライザーを指定する識別子値を含めます。

    - Zilliz Cloudは識別子フィールドに基づいて適切なアナライザーを選択し、未知の識別子を持つドキュメントは`default`アナライザーを使用します。

1. **言語固有のアナライザーで検索**:

    - 指定されたアナライザ名でクエリテキストを提供し、Zilliz Cloudは指定されたアナライザーを使用してクエリを処理します。

    - 言語固有の規則に従ってトークナイズが行われ、検索は類似性に基づいて言語に適した結果を返します。

## ステップ1: multi_analyzer_paramsの構成\{#step-1-configure-multianalyzerparams}

`multi_analyzer_params`は、Zilliz Cloudが各エンティティに適切なアナライザーを選択する方法を決定する単一のJSONオブジェクトです:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
multi_analyzer_params = {
  # 言語固有のアナライザーを定義
  # 各アナライザーはこの形式に従います: <analyzer_name>: <analyzer_params>
  "analyzers": {
    "english": {"type": "english"},          # 英語最適化アナライザー
    "chinese": {"type": "chinese"},          # 中国語最適化アナライザー
    "default": {"tokenizer": "icu"}          # 必須のフォールバックアナライザー
  },
  "by_field": "language",                    # アナライザー選択を決定するフィールド
  "alias": {
    "cn": "chinese",                         # 中国語の短縮形として"cn"を使用
    "en": "english"                          # 英語の短縮形として"en"を使用
  }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("analyzers", new HashMap<String, Object>() {{
    put("english", new HashMap<String, Object>() {{
        put("type", "english");
    }});
    put("chinese", new HashMap<String, Object>() {{
        put("type", "chinese");
    }});
    put("default", new HashMap<String, Object>() {{
        put("tokenizer", "icu");
    }});
}});
analyzerParams.put("by_field", "language");
analyzerParams.put("alias", new HashMap<String, Object>() {{
    put("cn", "chinese");
    put("en", "english");
}});
```

</TabItem>

<TabItem value='javascript'>

```javascript
const multi_analyzer_params = {
  // 言語固有のアナライザーを定義
  // 各アナライザーはこの形式に従います: <analyzer_name>: <analyzer_params>
  "analyzers": {
    "english": {"type": "english"},          # 英語最適化アナライザー
    "chinese": {"type": "chinese"},          # 中国語最適化アナライザー
    "default": {"tokenizer": "icu"}          # 必須のフォールバックアナライザー
  },
  "by_field": "language",                    # アナライザー選択を決定するフィールド
  "alias": {
    "cn": "chinese",                         # 中国語の短縮形として"cn"を使用
    "en": "english"                          # 英語の短縮形として"en"を使用
  }
}
```

</TabItem>

<TabItem value='go'>

```go
multiAnalyzerParams := map[string]any{
    "analyzers": map[string]any{
        "english": map[string]string{"type": "english"},
        "chinese": map[string]string{"type": "chinese"},
        "default": map[string]string{"tokenizer": "icu"},
    },
    "by_field": "language",
    "alias": map[string]string{
        "cn": "chinese",
        "en": "english",
    },
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export multi_analyzer_params='{
  "analyzers": {
    "english": {
      "type": "english"
    },
    "chinese": {
      "type": "chinese"
    },
    "default": {
      "tokenizer": "icu"
    }
  },
  "by_field": "language",
  "alias": {
    "cn": "chinese",
    "en": "english"
  }
}'

```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須?</p></th>
     <th><p>説明</p></th>
     <th><p>ルール</p></th>
   </tr>
   <tr>
     <td><p><code>analyzers</code></p></td>
     <td><p>はい</p></td>
     <td><p>Zilliz Cloudがテキスト処理に使用できるすべての言語固有のアナライザーをリストします。</p><p><code>analyzers</code>内の各アナライザーはこの形式に従います: <code>&lt;analyzer_name&gt;: &lt;analyzer_params&gt;</code>。</p></td>
     <td><ul><li><p>各アナライザーを標準の<code>analyzer_params</code>構文で定義します（<a href="./analyzer-overview#analyzer-types">アナライザー概要</a>を参照）。</p></li><li><p>キーが<code>default</code>のエントリを追加します; Zilliz Cloudは、<code>by_field</code>に格納された値が他のアナライザー名と一致しない場合、このアナライザーにフォールバックします。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>by_field</code></p></td>
     <td><p>はい</p></td>
     <td><p>各ドキュメントの言語（つまり、Zilliz Cloudが適用すべきアナライザー名）を格納するフィールド名。</p></td>
     <td><ul><li><p>コレクションで定義された<code>VARCHAR</code>フィールドでなければなりません。</p></li><li><p>各行の値は、<code>analyzers</code>でリストされたアナライザー名（またはエイリアス）のいずれかに完全に一致しなければなりません。</p></li><li><p>行の値が見つからない場合、Zilliz Cloudは自動的に<code>default</code>アナライザーを適用します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>alias</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>アナライザーのショートカットまたは代替名を作成し、コードで参照しやすくします。各アナライザーは1つ以上のエイリアスを持つことができます。</p></td>
     <td><p>各エイリアスは既存のアナライザーのキーにマップする必要があります。</p></td>
   </tr>
</table>

## ステップ2: コレクションの作成\{#step-2-create-collection}

多言語対応のコレクションを作成するには、特定のフィールドとインデックスを構成する必要があります:

### ステップ1: フィールドの追加\{#step-1-add-fields}

このステップでは、4つの主要なフィールドを持つコレクションスキーマを定義します:

- **主キー フィールド** (`id`): コレクション内の各エンティティの一意識別子。`auto_id=True`を設定すると、Zilliz Cloudが自動的にこれらのIDを生成できます。

- **言語インジケーターフィールド** (`language`): このVARCHARフィールドは、`multi_analyzer_params`で指定された`by_field`に対応します。各エンティティの言語識別子を格納し、Zilliz Cloudに使用するアナライザーを伝えます。

- **テキストコンテンツフィールド** (`text`): このVARCHARフィールドには、分析および検索したい実際のテキストデータを格納します。`enable_analyzer=True`を設定することが重要です。これにより、このフィールドのテキスト分析機能が有効になります。`multi_analyzer_params`構成は直接このフィールドに添付され、テキストデータと言語固有のアナライザー間の接続を確立します。

- **ベクトルフィールド** (`sparse`): このフィールドには、BM25関数によって生成されるスパースベクトルを格納します。これらのベクトルはテキストデータの分析可能形式を表し、Zilliz Cloudが実際に検索するものです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 必要なモジュールをインポート
from pymilvus import MilvusClient, DataType, Function, FunctionType

# クライアントを初期化
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
)

# 新しいスキーマを初期化
schema = client.create_schema()

# ステップ2.1: ドキュメントの一意識別用の主キーを追加
schema.add_field(
    field_name="id",                  # フィールド名
    datatype=DataType.INT64,          # 整数データ型
    is_primary=True,                  # 主キーとして指定
    auto_id=True                      # IDを自動生成（推奨）
)

# ステップ2.2: 言語識別子フィールドを追加
# これはlanguage_analyzer_configの"by_field"値と一致しなければなりません
schema.add_field(
    field_name="language",       # フィールド名
    datatype=DataType.VARCHAR,   # 文字列データ型
    max_length=255               # 最大長（必要に応じて調整）
)

# ステップ2.3: 多言語分析機能付きテキストコンテンツフィールドを追加
schema.add_field(
    field_name="text",                           # フィールド名
    datatype=DataType.VARCHAR,                   # 文字列データ型
    max_length=8192,                             # 最大長（予想されるテキストサイズに基づいて調整）
    enable_analyzer=True,                        # テキスト分析を有効化
    multi_analyzer_params=multi_analyzer_params  # 言語アナライザーと接続
)

# ステップ2.4: BM25出力を保存するスパースベクトルフィールドを追加
schema.add_field(
    field_name="sparse",                   # フィールド名
    datatype=DataType.SPARSE_FLOAT_VECTOR  # スパースベクトルデータ型
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.service.utility.request.FlushReq;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();

collectionSchema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());

collectionSchema.addField(AddFieldReq.builder()
        .fieldName("language")
        .dataType(DataType.VarChar)
        .maxLength(255)
        .build());

collectionSchema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(8192)
        .enableAnalyzer(true)
        .multiAnalyzerParams(analyzerParams)
        .build());

collectionSchema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

// クライアントを初期化
const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
});

// スキーマ配列を初期化
const schema = [
  {
    name: "id",
    data_type: DataType.Int64,
    is_primary_key: true,
    auto_id: true,
  },
  {
    name: "language",
    data_type: DataType.VarChar,
    max_length: 255,
  },
  {
    name: "text",
    data_type: DataType.VarChar,
    max_length: 8192,
    enable_analyzer: true,
    analyzer_params: multi_analyzer_params,
  },
  {
    name: "sparse",
    data_type: DataType.SparseFloatVector,
  },
];

```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

schema := entity.NewSchema()

schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("language").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(255),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(8192).
    WithEnableAnalyzer(true).
    WithMultiAnalyzerParams(multiAnalyzerParams),
).WithField(entity.NewField().
    WithName("sparse").
    WithDataType(entity.FieldTypeSparseVector),
)
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export idField='{
  "fieldName": "id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": true
}'

export languageField='{
  "fieldName": "language",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 255
  }
}'

export textField='{
  "fieldName": "text",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 8192,
    "enable_analyzer": true，
    "multiAnalyzerParam": '"$multi_analyzer_params"'
  },
}'

export sparseField='{
  "fieldName": "sparse",
  "dataType": "SparseFloatVector"
}'
```

</TabItem>
</Tabs>

### ステップ2: BM25関数の定義\{#step-2-define-bm25-function}

BM25関数を定義して、生のテキストデータからスパースベクトル表現を生成します:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# BM25関数を作成
bm25_function = Function(
    name="text_to_vector",            # 説明的な関数名
    function_type=FunctionType.BM25,  # BM25アルゴリズムを使用
    input_field_names=["text"],       # このフィールドからのテキストを処理
    output_field_names=["sparse"]     # ベクトルをこのフィールドに保存
)

# スキーマに関数を追加
schema.add_function(bm25_function)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq.Function function = CreateCollectionReq.Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_to_vector")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("sparse"))
        .build();
collectionSchema.addFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const functions = [
  {
    name: "text_bm25_emb",
    description: "bm25 function",
    type: FunctionType.BM25,
    input_field_names: ["text"],
    output_field_names: ["sparse"],
    params: {},
  },
];
```

</TabItem>

<TabItem value='go'>

```go
function := entity.NewFunction()
schema.WithFunction(function.WithName("text_to_vector").
    WithType(entity.FunctionTypeBM25).
    WithInputFields("text").
    WithOutputFields("sparse"))
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export function='{
  "name": "text_to_vector",
  "type": "BM25",
  "inputFieldNames": ["text"],
  "outputFieldNames": ["sparse"]
}'

export schema="{
  \"autoID\": true,
  \"fields\": [
    $idField,
    $languageField,
    $textField,
    $sparseField
  ],
  \"functions\": [
    $function
  ]
}"
```

</TabItem>
</Tabs>

この関数は、言語識別子に基づいて各テキストエントリに適切なアナライザーを自動的に適用します。BM25ベースのテキスト検索の詳細については、[全文検索](./full-text-search)を参照してください。

### ステップ3: インデックスパラメーターの構成\{#step-3-configure-index-params}

効率的な検索を可能にするには、スパースベクトルフィールドにインデックスを作成します:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# インデックスパラメーターを構成
index_params = client.prepare_index_params()

# スパースベクトルフィールドのインデックスを追加
index_params.add_index(
    field_name="sparse",        # インデックス対象フィールド（ベクトルフィールド）
    index_type="AUTOINDEX",     # Milvusが最適なインデックスタイプを選択
    metric_type="BM25"          # この機能ではBM25でなければなりません
)
```

</TabItem>

<TabItem value='java'>

```java
List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.BM25)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [{
    field_name: "sparse",
    index_type: "AUTOINDEX",
    metric_type: "BM25"
}];
```

</TabItem>

<TabItem value='go'>

```go
idx := index.NewAutoIndex(index.MetricType(entity.BM25))
indexOption := milvusclient.NewCreateIndexOption("multilingual_documents", "sparse", idx)
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export IndexParams='[
  {
    "fieldName": "sparse",
    "indexType": "AUTOINDEX",
    "metricType": "BM25",
    "params": {}
  }
]'
```

</TabItem>
</Tabs>

インデックスは、BM25類似度計算を効率的に行えるようにスパースベクトルを整理することで検索パフォーマンスを向上させます。

### ステップ4: コレクションの作成\{#step-4-create-the-collection}

この最終作成ステップで、前に行ったすべての構成が統合されます:

- `collection_name="multilang_demo"`は将来の参照用にコレクションに名前を付けます。

- `schema=schema`は定義したフィールド構造と関数を適用します。

- `index_params=index_params`は効率的な検索のためのインデックス戦略を実装します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# コレクションを作成
COLLECTION_NAME = "multilingual_documents"

# コレクションがすでに存在するか確認
if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)  # この例のために削除
    print(f"Dropped existing collection: {COLLECTION_NAME}")

# コレクションを作成
client.create_collection(
    collection_name=COLLECTION_NAME,       # コレクション名
    schema=schema,                         # 多言語スキーマ
    index_params=index_params              # 検索インデックス構成
)
```

</TabItem>

<TabItem value='java'>

```java
client.dropCollection(DropCollectionReq.builder()
        .collectionName("multilingual_documents")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("multilingual_documents")
        .collectionSchema(collectionSchema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const COLLECTION_NAME = "multilingual_documents";

// コレクションを作成
await client.createCollection({
  collection_name: COLLECTION_NAME,
  schema: schema,
  index_params: index_params,
  functions: functions
});

```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("multilingual_documents", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"multilingual_documents\",
  \"schema\": $schema,
  \"indexParams\": $IndexParams
}"

```

</TabItem>
</Tabs>

この時点で、Zilliz Cloudは多言語アナライザー対応を持つ空のコレクションを作成し、データ受信の準備が完了します。

## ステップ3: 例データの挿入\{#step-3-insert-example-data}

多言語コレクションにドキュメントを追加する際、各ドキュメントにはテキストコンテンツと言語識別子の両方を含める必要があります:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 多言語ドキュメントを準備
documents = [
    # 英語ドキュメント
    {
        "text": "Artificial intelligence is transforming technology",
        "language": "english",  # 完全な言語名を使用
    },
    {
        "text": "Machine learning models require large datasets",
        "language": "en",  # 定義したエイリアスを使用
    },
    # 中国語ドキュメント
    {
        "text": "人工智能正在改变技术领域",
        "language": "chinese",  # 完全な言語名を使用
    },
    {
        "text": "机器学习模型需要大型数据集",
        "language": "cn",  # 定義したエイリアスを使用
    },
]

# ドキュメントを挿入
result = client.insert(COLLECTION_NAME, documents)

# 結果を印刷
inserted = result["insert_count"]
print(f"Successfully inserted {inserted} documents")
print("Documents by language: 2 English, 2 Chinese")

# 期待される出力:
# Successfully inserted 4 documents
# Documents by language: 2 English, 2 Chinese
```

</TabItem>

<TabItem value='java'>

```java
List<String> texts = Arrays.asList(
        "Artificial intelligence is transforming technology",
        "Machine learning models require large datasets",
        "人工智能正在改变技术领域",
        "机器学习模型需要大型数据集"
);
List<String> languages = Arrays.asList(
        "english", "en", "chinese", "cn"
);

List<JsonObject> rows = new ArrayList<>();
for (int i = 0; i < texts.size(); i++) {
    JsonObject row = new JsonObject();
    row.addProperty("text", texts.get(i));
    row.addProperty("language", languages.get(i));
    rows.add(row);
}
client.insert(InsertReq.builder()
        .collectionName("multilingual_documents")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 多言語ドキュメントを準備
const documents = [
  // 英語ドキュメント
  {
    text: "Artificial intelligence is transforming technology",
    language: "english",
  },
  {
    text: "Machine learning models require large datasets",
    language: "en",
  },
  // 中国語ドキュメント
  {
    text: "人工智能正在改变技术领域",
    language: "chinese",
  },
  {
    text: "机器学习模型需要大型数据集",
    language: "cn",
  },
];

// ドキュメントを挿入
const result = await client.insert({
  collection_name: COLLECTION_NAME,
  data: documents,
});

// 結果を印刷
const inserted = result.insert_count;
console.log(`Successfully inserted ${inserted} documents`);
console.log("Documents by language: 2 English, 2 Chinese");

// 期待される出力:
// Successfully inserted 4 documents
// Documents by language: 2 English, 2 Chinese

```

</TabItem>

<TabItem value='go'>

```go
column1 := column.NewColumnVarChar("text",
    []string{
        "Artificial intelligence is transforming technology",
        "Machine learning models require large datasets",
        "人工智能正在改变技术领域",
        "机器学习模型需要大型数据集",
    })
column2 := column.NewColumnVarChar("language",
    []string{"english", "en", "chinese", "cn"})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("multilingual_documents").
    WithColumns(column1, column2),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "multilingual_documents",
  "data": [
    {
      "text": "Artificial intelligence is transforming technology",
      "language": "english"
    },
    {
      "text": "Machine learning models require large datasets",
      "language": "en"
    },
    {
      "text": "人工智能正在改变技术领域",
      "language": "chinese"
    },
    {
      "text": "机器学习模型需要大型数据集",
      "language": "cn"
    }
  ]
}'
```

</TabItem>
</Tabs>

挿入中、Zilliz Cloudは:

1. 各ドキュメントの`language`フィールドを読み取ります

1. `text`フィールドに該当するアナライザーを適用します

1. BM25関数でスパースベクトル表現を生成します

1. 元のテキストと生成されたスパースベクトルの両方を保存します

<Admonition type="info" icon="📘" title="注釈">

<p>スパースベクトルを直接提供する必要はありません; BM25関数はテキストと指定されたアナライザーに基づいて自動的に生成します。</p>

</Admonition>

## ステップ4: 検索操作の実行\{#step-4-perform-search-operations}

### 英語アナライザーを使用\{#use-english-analyzer}

多言語アナライザーで検索する際、`search_params`には重要な構成が含まれます:

- `metric_type="BM25"`はインデックス構成と一致しなければなりません。

- `analyzer_name="english"`はクエリテキストに適用するアナライザーを指定します。これは保存されたドキュメントに使用されたアナライザーとは独立しています。

- `params={"drop_ratio_search": "0"}`はBM25固有の動作を制御します; ここでは検索ですべての用語を保持します。詳細については[スパースベクトル](./use-sparse-vector)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "BM25",            # インデックス構成と一致しなければなりません
    "analyzer_name": "english",  # クエリ言語に一致するアナライザー
    "drop_ratio_search": "0",     # 検索ですべての用語を保持（必要に応じて調整）
}

# 検索を実行
english_results = client.search(
    collection_name=COLLECTION_NAME,  # 検索対象のコレクション
    data=["artificial intelligence"],                # クエリテキスト
    anns_field="sparse",              # 検索対象フィールド
    search_params=search_params,      # 検索構成
    limit=3,                      # 最大結果数
    output_fields=["text", "language"],  # 出力に含めるフィールド
    consistency_level="Bounded",       # データ一貫性保証
)

# 英語検索結果を表示
print("\n=== English Search Results ===")
for i, hit in enumerate(english_results[0]):
    print(f"{i+1}. [{hit.score:.4f}] {hit.entity.get('text')} "
          f"(Language: {hit.entity.get('language')})")

# 期待される出力 (英語検索結果):
# 1. [2.7881] Artificial intelligence is transforming technology (Language: english)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> searchParams = new HashMap<>();
searchParams.put("metric_type", "BM25");
searchParams.put("analyzer_name", "english");
searchParams.put("drop_ratio_search", 0);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("multilingual_documents")
        .data(Collections.singletonList(new EmbeddedText("artificial intelligence")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Arrays.asList("text", "language"))
        .build());

System.out.println("\n=== English Search Results ===");
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("Score: %f, %s\n", result.getScore(), result.getEntity().toString());
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 検索を実行
const english_results = await client.search({
  collection_name: COLLECTION_NAME,
  data: ["artificial intelligence"],
  anns_field: "sparse",
  params: {
    metric_type: "BM25",
    analyzer_name: "english",
    drop_ratio_search: "0",
  },
  limit: 3,
  output_fields: ["text", "language"],
  consistency_level: "Bounded",
});

// 英語検索結果を表示
console.log("\n=== English Search Results ===");
english_results.results.forEach((hit, i) => {
  console.log(
    `${i + 1}. [${hit.score.toFixed(4)}] ${hit.entity.text} ` +
      `(Language: ${hit.entity.language})`
  );
});

```

</TabItem>

<TabItem value='go'>

```go
annSearchParams := index.NewCustomAnnParam()
annSearchParams.WithExtraParam("metric_type", "BM25")
annSearchParams.WithExtraParam("analyzer_name", "english")
annSearchParams.WithExtraParam("drop_ratio_search", 0)

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "multilingual_documents", // collectionName
    3,                        // limit
    []entity.Vector{entity.Text("artificial intelligence")},
).WithANNSField("sparse").
    WithAnnParam(annSearchParams).
    WithOutputFields("text", "language"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    for i := 0; i < len(resultSet.Scores); i++ {
        text, _ := resultSet.GetColumn("text").GetAsString(i)
        lang, _ := resultSet.GetColumn("language").GetAsString(i)
        fmt.Println("Score: ", resultSet.Scores[i], "Text: ", text, "Language:", lang)
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "multilingual_documents",
  "data": ["artificial intelligence"],
  "annsField": "sparse",
  "limit": 3,
  "searchParams": {
    "metric_type": "BM25",
    "analyzer_name": "english",
    "drop_ratio_search": "0"
  },
  "outputFields": ["text", "language"],
  "consistencyLevel": "Strong"
}'
```

</TabItem>
</Tabs>

### 中国語アナライザーを使用\{#use-chinese-analyzer}

この例では、異なるクエリテキストのための中国語アナライザー（エイリアス`"cn"`使用）への切り替えを示します。他のパラメーターはすべて同じですが、今度はクエリテキストは中国語固有のトークナイズ規則を使用して処理されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params["analyzer_name"] = "cn"

chinese_results = client.search(
    collection_name=COLLECTION_NAME,  # 検索対象のコレクション
    data=["人工智能"],                # クエリテキスト
    anns_field="sparse",              # 検索対象フィールド
    search_params=search_params,      # 検索構成
    limit=3,                      # 最大結果数
    output_fields=["text", "language"],  # 出力に含めるフィールド
    consistency_level="Bounded",       # データ一貫性保証
)

# 中国語検索結果を表示
print("\n=== Chinese Search Results ===")
for i, hit in enumerate(chinese_results[0]):
    print(f"{i+1}. [{hit.score:.4f}] {hit.entity.get('text')} "
          f"(Language: {hit.entity.get('language')})")

# 期待される出力 (中国語検索結果):
# 1. [3.3814] 人工智能正在改变技术领域 (Language: chinese)
```

</TabItem>

<TabItem value='java'>

```java
searchParams.put("analyzer_name", "cn");
searchResp = client.search(SearchReq.builder()
        .collectionName("multilingual_documents")
        .data(Collections.singletonList(new EmbeddedText("人工智能")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Arrays.asList("text", "language"))
        .build());

System.out.println("\n=== Chinese Search Results ===");
searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("Score: %f, %s\n", result.getScore(), result.getEntity().toString());
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 検索を実行
const cn_results = await client.search({
  collection_name: COLLECTION_NAME,
  data: ["人工智能"],
  anns_field: "sparse",
  params: {
    metric_type: "BM25",
    analyzer_name: "cn",
    drop_ratio_search: "0",
  },
  limit: 3,
  output_fields: ["text", "language"],
  consistency_level: "Bounded",
});

// 中国語検索結果を表示
console.log("\n=== Chinese Search Results ===");
cn_results.results.forEach((hit, i) => {
  console.log(
    `${i + 1}. [${hit.score.toFixed(4)}] ${hit.entity.text} ` +
      `(Language: ${hit.entity.language})`
  );
});

```

</TabItem>

<TabItem value='go'>

```go
annSearchParams.WithExtraParam("analyzer_name", "cn")

resultSets, err = client.Search(ctx, milvusclient.NewSearchOption(
    "multilingual_documents", // collectionName
    3,                        // limit
    []entity.Vector{entity.Text("人工智能")},
).WithANNSField("sparse").
    WithAnnParam(annSearchParams).
    WithOutputFields("text", "language"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    for i := 0; i < len(resultSet.Scores); i++ {
        text, _ := resultSet.GetColumn("text").GetAsString(i)
        lang, _ := resultSet.GetColumn("language").GetAsString(i)
        fmt.Println("Score: ", resultSet.Scores[i], "Text: ", text, "Language:", lang)
    }
}

```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "multilingual_documents",
  "data": ["人工智能"],
  "annsField": "sparse",
  "limit": 3,
  "searchParams": {
    "analyzer_name": "cn"
  },
  "outputFields": ["text", "language"],
  "consistencyLevel": "Strong"
}'
```

</TabItem>
</Tabs>

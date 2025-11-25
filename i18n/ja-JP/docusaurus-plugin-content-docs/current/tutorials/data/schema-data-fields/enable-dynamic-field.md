---
title: "動的フィールド | Cloud"
slug: /enable-dynamic-field
sidebar_label: "動的フィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、動的フィールドと呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは`#meta`という名前の非表示のJSONフィールドとして実装され、コレクションスキーマで明示的に定義されていないデータ内のすべてのフィールドを自動的に格納します。 | Cloud"
type: origin
token: OVxRwZWxNi4pYrkdKxCcOuY2nf1
sidebar_position: 13
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - dynamic field
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 動的フィールド

Zilliz Cloudでは、動的フィールドと呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは`#meta`という名前の非表示のJSONフィールドとして実装され、コレクションスキーマで**明示的に定義されていない**データ内のすべてのフィールドを自動的に格納します。

## 動作方法\{#how-it-works}

動的フィールドが有効になっている場合、Zilliz Cloudは各エンティティに非表示の`#meta`フィールドを追加します。このフィールドはJSON型であり、任意のJSON互換データ構造を格納でき、JSONパス構文を使用してインデックス化できます。

データ挿入時、スキーマで宣言されていないすべてのフィールドは、自動的にこの動的フィールド内にキーと値のペアとして格納されます。

`#meta`を手動で管理する必要はありません。Zilliz Cloudが透過的に処理します。

たとえば、コレクションスキーマが`id`と`vector`のみを定義しており、次のエンティティを挿入する場合を考えてみましょう。

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3],
  "name": "Item A",    // スキーマにありません
  "category": "books"  // スキーマにありません
}
```

動的フィールド機能が有効になっている場合、Zilliz Cloudは内部的に次のように格納します。

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3],
  // highlight-start
  "$meta": {
    "name": "Item A",
    "category": "books"
  }
  // highlight-end
}
```

これにより、スキーマを変更せずにデータ構造を進化させることができます。

一般的な使用例は次のとおりです。

- オプションまたは頻繁には取得されないフィールドの格納

- エンティティごとに異なるメタデータの取得

- 特定の動的フィールドキーにインデックスを設定した柔軟なフィルタリングのサポート

## サポートされているデータ型\{#supported-data-types}

動的フィールドは、Zilliz Cloudが提供するすべてのスカラーデータ型をサポートしており、単純な値と複雑な値の両方を含みます。これらのデータ型は、&#36;metaに格納される**キーの値**に適用されます。

**サポートされている型は次のとおりです。**

- 文字列 (`VARCHAR`)

- 整数 (`INT8`, `INT32`, `INT64`)

- 浮動小数点 (`FLOAT`, `DOUBLE`)

- 真偽値 (`BOOL`)

- スカラー値の配列 (`ARRAY`)

- JSONオブジェクト (`JSON`)

**例:**

```json
{
  "brand": "Acme",
  "price": 29.99,
  "in_stock": true,
  "tags": ["new", "hot"],
  "specs": {
    "weight": "1.2kg",
    "dimensions": { "width": 10, "height": 20 }
  }
}
```

上記のすべてのキーと値は`#meta`フィールド内に格納されます。

## 動的フィールドの有効化\{#enable-dynamic-field}

動的フィールド機能を使用するには、コレクションスキーマ作成時に`enable_dynamic_field=True`を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# クライアントを初期化
client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# 動的フィールドを有効にしてスキーマを作成
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True,
)

# 明示的に定義されたフィールドを追加
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# コレクションを作成
client.create_collection(
    collection_name="my_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.*;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.AddFieldReq;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("my_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("my_vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, CreateCollectionReq } from '@zilliz/milvus2-sdk-node';

// クライアントを初期化
const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT' });

// コレクションを作成
const res = await client.createCollection({
  collection_name: 'my_collection',
  schema:  [
      {
        name: 'my_id',
        data_type: DataType.Int64,
        is_primary_key: true,
        autoID: false,
      },
      {
        name: 'my_vector',
        data_type: DataType.FloatVector,
        type_params: {
          dim: '5',
      }
   ],
   enable_dynamic_field: true
});

```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    return err
}

schema := entity.NewSchema().WithDynamicFieldEnabled(true)
schema.WithField(entity.NewField().
    WithName("my_id").pk
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("my_vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export myIdField='{
  "fieldName": "my_id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": false
}'

export myVectorField='{
  "fieldName": "my_vector",
  "dataType": "FloatVector",
  "elementTypeParams": {
    "dim": 5
  }
}'

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $myIdField,
    $myVectorField
  ]
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"my_collection\",
  \"schema\": $schema
}"

```

</TabItem>
</Tabs>

## コレクションへのエンティティ挿入\{#insert-entities-to-the-collection}

動的フィールドにより、スキーマで定義されていない追加フィールドを挿入できます。これらのフィールドは自動的に`#meta`に格納されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
entities = [
    {
        "my_id": 1, # 明示的に定義された主フィールド
        "my_vector": [0.1, 0.2, 0.3, 0.4, 0.5], # 明示的に定義されたベクトルフィールド
        "overview": "Great product",       # スキーマで定義されていないスカラーkey
        "words": 150,                      # スキーマで定義されていないスカラーkey
        "dynamic_json": {                  # スキーマで定義されていないJSON key
            "varchar": "some text",
            "nested": {
                "value": 42.5
            },
            "string_price": "99.99"        # 文字列として格納された数値
        }
    }
]

client.insert(collection_name="my_collection", data=entities)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;

Gson gson = new Gson();
JsonObject row = new JsonObject();
row.addProperty("my_id", 1);
row.add("my_vector", gson.toJsonTree(Arrays.asList(0.1, 0.2, 0.3, 0.4, 0.5)));
row.addProperty("overview", "Great product");
row.addProperty("words", 150);

JsonObject dynamic = new JsonObject();
dynamic.addProperty("varchar", "some text");
dynamic.addProperty("string_price", "99.99");

JsonObject nested = new JsonObject();
nested.addProperty("value", 42.5);

dynamic.add("nested", nested);
row.add("dynamic_json", dynamic);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript

const entities = [
  {
    my_id: 1,
    my_vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    overview: 'Great product',
    words: 150,
    dynamic_json: {
      varchar: 'some text',
      nested: {
        value: 42.5,
      },
      string_price: '99.99',
    },
  },
];
const res = await client.insert({
    collection_name: 'my_collection',
    data: entities,
});
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("my_id", []int64{1}).
    WithFloatVectorColumn("my_vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
    }).WithColumns(
    column.NewColumnVarChar("overview", []string{"Great product"}),
    column.NewColumnInt32("words", []int32{150}),
    column.NewColumnJSONBytes("dynamic_json", [][]byte{
        []byte(`{
            varchar: 'some text',
            nested: {
                value: 42.5,
            },
            string_price: '99.99',
        }`),
    }),
))
if err != nil {
    return err
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
  "data": [
    {
      "my_id": 1,
      "my_vector": [0.1, 0.2, 0.3, 0.4, 0.5],
      "overview": "Great product",
      "words": 150,
      "dynamic_json": {
        "varchar": "some text",
        "nested": {
          "value": 42.5
        },
        "string_price": "99.99"
      }
    }
  ],
  "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## 動的フィールドのキーにインデックスを設定\{#index-keys-in-the-dynamic-field}

Zilliz Cloudでは、**JSONパスインデックス**を使用して、動的フィールド内の特定のキーにインデックスを作成できます。スカラー値またはJSONオブジェクト内のネストされた値に使用できます。

<Admonition type="info" icon="📘" title="ノート">

<p>動的フィールドキーのインデックス設定は<strong>オプション</strong>です。インデックスなしで動的フィールドキーによるクエリやフィルタリングは可能ですが、ブルートフォース検索になるためパフォーマンスが低下する可能性があります。</p>

</Admonition>

### JSONパスインデックス構文\{#json-path-indexing-syntax}

JSONパスインデックスを作成するには、以下を指定します。

- **JSONパス** (`json_path`): インデックスを作成するJSONオブジェクト内のキーまたはネストされたフィールドのパス。

    - 例: `metadata["category"]`

        これにより、インデックス作成エンジンがJSON構造内で検索する場所が定義されます。

- **JSONキャスト型** (`json_cast_type`): Zilliz Cloudが指定されたパスの値を解釈してインデックス化する際に使用するデータ型。

    - この型は、インデックス対象のフィールドの実際のデータ型と一致する必要があります。

    - 完全なリストについては、[サポートされているJSONキャスト型](./use-json-fields)を参照してください。

### JSONパスを使用して動的フィールドキーにインデックスを設定\{#use-json-path-to-index-dynamic-field-keys}

動的フィールドはJSONフィールドであるため、JSONパス構文を使用して内部の任意のキーにインデックスを設定できます。単純なスカラー値と複雑なネスト構造の両方に使用できます。

**JSONパスの例:**

- 単純なキー: `overview`, `words`

- ネストされたキー: `dynamic_json['varchar']`, `dynamic_json['nested']['value']`

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# 単純な文字列キーにインデックスを設定
index_params.add_index(
    field_name="overview",  # 動的フィールド内のキー名
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックスではAUTOINDEXに設定する必要があります
    index_name="overview_index",  # ユニークなインデックス名
    # highlight-start
    params={
        "json_cast_type": "varchar",   # Zilliz Cloudが値をインデックス化する際に使用するデータ型
        "json_path": "overview"        # キーへのJSONパス
    }
    # highlight-end
)

# 単純な数値キーにインデックスを設定
index_params.add_index(
    field_name="words",  # 動的フィールド内のキー名
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックスではAUTOINDEXに設定する必要があります
    index_name="words_index",  # ユニークなインデックス名
    # highlight-start
    params={
        "json_cast_type": "double",  # Zilliz Cloudが値をインデックス化する際に使用するデータ型
        "json_path": "words" # キーへのJSONパス
    }
    # highlight-end
)

# JSONオブジェクト内のネストされたキーにインデックスを設定
index_params.add_index(
    field_name="dynamic_json", # 動的フィールド内のJSONキー名
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックスではAUTOINDEXに設定する必要があります
    index_name="json_varchar_index", # ユニークなインデックス名
    # highlight-start
    params={
        "json_cast_type": "varchar", # Zilliz Cloudが値をインデックス化する際に使用するデータ型
        "json_path": "dynamic_json['varchar']" # ネストされたキーへのJSONパス
    }
    # highlight-end
)

# 深くネストされたキーにインデックスを設定
index_params.add_index(
    field_name="dynamic_json",
    # highlight-next-line
    index_type="AUTOINDEX", # JSONパスインデックスではAUTOINDEXに設定する必要があります
    index_name="json_nested_index", # ユニークなインデックス名
    # highlight-start
    params={
        "json_cast_type": "double",
        "json_path": "dynamic_json['nested']['value']"
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

Map<String,Object> extraParams1 = new HashMap<>();
extraParams1.put("json_path", "overview");
extraParams1.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("overview")
        .indexName("overview_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams1)
        .build());

Map<String,Object> extraParams2 = new HashMap<>();
extraParams2.put("json_path", "words");
extraParams2.put("json_cast_type", "double");
indexParams.add(IndexParam.builder()
        .fieldName("words")
        .indexName("words_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams2)
        .build());

Map<String,Object> extraParams3 = new HashMap<>();
extraParams3.put("json_path", "dynamic_json['varchar']");
extraParams3.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("dynamic_json")
        .indexName("json_varchar_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams3)
        .build());

Map<String,Object> extraParams4 = new HashMap<>();
extraParams4.put("json_path", "dynamic_json['nested']['value']");
extraParams4.put("json_cast_type", "double");
indexParams.add(IndexParam.builder()
        .fieldName("dynamic_json")
        .indexName("json_nested_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams4)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [
    {
      collection_name: 'my_collection',
      field_name: 'overview',
      index_name: 'overview_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_path: 'overview',
        json_cast_type: 'varchar',
      },
    },
    {
      collection_name: 'my_collection',
      field_name: 'words',
      index_name: 'words_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_path: 'words',
        json_cast_type: 'double',
      },
    },
    {
      collection_name: 'my_collection',
      field_name: 'dynamic_json',
      index_name: 'json_varchar_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_cast_type: 'varchar',
        json_path: "dynamic_json['varchar']",
      },
    },
    {
      collection_name: 'my_collection',
      field_name: 'dynamic_json',
      index_name: 'json_nested_index',
      index_type: 'AUTOINDEX',
      metric_type: 'NONE',
      params: {
        json_cast_type: 'double',
        json_path: "dynamic_json['nested']['value']",
      },
    },
  ];
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/index"
)

jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", "overview")
    .WithIndexName("overview_index")
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "double", "words")
    .WithIndexName("words_index")
jsonIndex3 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `dynamic_json['varchar']`)
    .WithIndexName("json_varchar_index")
jsonIndex4 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `dynamic_json['nested']['value']`)
    .WithIndexName("json_nested_index")

indexOpt1 := milvusclient.NewCreateIndexOption("my_collection", "overview", jsonIndex1)
indexOpt2 := milvusclient.NewCreateIndexOption("my_collection", "words", jsonIndex2)
indexOpt3 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex3)
indexOpt4 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex4)
```

</TabItem>

<TabItem value='bash'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export overviewIndex='{
  "fieldName": "dynamic_json",
  "indexName": "overview_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "varchar",
    "json_path": "dynamic_json[\"overview\"]"
  }
}'

export wordsIndex='{
  "fieldName": "dynamic_json",
  "indexName": "words_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "double",
    "json_path": "dynamic_json[\"words\"]"
  }
}'

export varcharIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_varchar_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "varchar",
    "json_path": "dynamic_json[\"varchar\"]"
  }
}'

export nestedIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_nested_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "double",
          "json_path": "dynamic_json[\"nested\"][\"value\"]"
    }
  }'
```

</TabItem>
</Tabs>

### 型変換のためのJSONキャスト関数を使用\{#use-json-cast-functions-for-type-conversion}

動的フィールドキーが不正な形式の値を含んでいる場合（例：文字列として格納された数値）、キャスト関数を使用して変換できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# インデックス化前に文字列をdoubleに変換
index_params.add_index(
    field_name="dynamic_json", # JSONキー名
    index_type="AUTOINDEX",
    index_name="json_string_price_index",
    params={
        "json_path": "dynamic_json['string_price']",
        "json_cast_type": "double", # キャスト関数の出力型にする必要があります
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE" # 大文字小文字を区別しない; 文字列をdoubleに変換
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams5 = new HashMap<>();
extraParams5.put("json_path", "dynamic_json['string_price']");
extraParams5.put("json_cast_type", "double");
indexParams.add(IndexParam.builder()
        .fieldName("dynamic_json")
        .indexName("json_string_price_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams5)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    collection_name: 'my_collection',
    field_name: 'dynamic_json',
    index_name: 'json_string_price_index',
    index_type: 'AUTOINDEX',
    metric_type: 'NONE',
    params: {
      json_path: "dynamic_json['string_price']",
      json_cast_type: 'double',
      json_cast_function: 'STRING_TO_DOUBLE',
    },
  });
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex5 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `dynamic_json['string_price']`)
    .WithIndexName("json_string_price_index")
indexOpt5 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex5)
```

</TabItem>

<TabItem value='bash'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export stringPriceIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_string_price_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "dynamic_json[\"string_price\"]",
    "json_cast_type": "double",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'

```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>型変換に失敗した場合（例：値<code>"not_a_number"</code>は数値に変換できません）、値はスキップされインデックス化されません。</p></li>
<li><p>キャスト関数のパラメータの詳細については、<a href="./use-json-fields">JSONフィールド</a>を参照してください。</p></li>
</ul>

</Admonition>

### コレクションにインデックスを適用\{#apply-indexes-to-the-collection}

インデックスパラメータを定義した後、`create_index()`を使用してコレクションに適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_index(
    collection_name="my_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.CreateIndexReq;

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
  await client.createIndex(indexParams);
```

</TabItem>

<TabItem value='go'>

```go
indexTask1, err := client.CreateIndex(ctx, indexOpt1)
if err != nil {
    return err
}
indexTask2, err := client.CreateIndex(ctx, indexOpt2)
if err != nil {
    return err
}
indexTask3, err := client.CreateIndex(ctx, indexOpt3)
if err != nil {
    return err
}
indexTask4, err := client.CreateIndex(ctx, indexOpt4)
if err != nil {
    return err
}
indexTask5, err := client.CreateIndex(ctx, indexOpt5)
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export indexParams="[
  $varcharIndex,
  $nestedIndex,
  $overviewIndex,
  $wordsIndex,
  $stringPriceIndex
]"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"my_collection\",
  \"indexParams\": $indexParams
}"

```

</TabItem>
</Tabs>

## 動的フィールドキーによるフィルタリング\{#filter-by-dynamic-field-keys}

動的フィールドキーを持つエンティティを挿入した後、標準のフィルター式を使用してそれらをフィルターできます。

- JSONでないキー（例：文字列、数値、真偽値）については、キー名を直接参照できます。

- JSONオブジェクトを格納するキーについては、JSONパス構文を使用してネストされた値にアクセスします。

前のセクションの[例のエンティティ](./enable-dynamic-field#insert-entities-to-the-collection)に基づき、有効なフィルター式は次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 動的フィールドキーによるクエリ
results = client.query(
    collection_name="my_collection",
    filter="overview == 'Great product'",
    output_fields=["my_id", "overview", "words"]
)

# ネストされたJSON値によるクエリ
results = client.query(
    collection_name="my_collection",
    filter="dynamic_json['nested']['value'] > 40",
    output_fields=["my_id", "dynamic_json"]
)

# 数値によるクエリ
results = client.query(
    collection_name="my_collection",
    filter="words >= 100",
    output_fields=["my_id", "words"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

// 動的フィールドキーによるクエリ
QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("overview == 'Great product'")
        .outputFields(Arrays.asList("my_id", "overview", "words"))
        .build());

// ネストされたJSON値によるクエリ
QueryResp resp2 = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("dynamic_json['nested']['value'] > 40")
        .outputFields(Arrays.asList("my_id", "dynamic_json"))
        .build());

// 数値によるクエリ
QueryResp resp3 = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("words >= 100")
        .outputFields(Arrays.asList("my_id", "words"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 動的フィールドキーによるクエリ
const results = await client.query({
    collection_name: 'my_collection',
    filter: "overview == 'Great product'",
    output_fields: ['my_id', 'overview', 'words'],
});

// ネストされたJSON値によるクエリ
const results2 = await client.query({
    collection_name: 'my_collection',
    filter: "dynamic_json['nested']['value'] > 40",
    output_fields: ['my_id', 'dynamic_json'],
});

// 数値によるクエリ
const results3 = await client.query({
    collection_name: 'my_collection',
    filter: 'words >= 100',
    output_fields: ['my_id', 'words'],
});
```

</TabItem>

<TabItem value='go'>

```go
// 動的フィールドキーによるクエリ
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("overview == 'Great product'").
    WithOutputFields("my_id", "overview", "words"))
if err != nil {
    return err
}

// ネストされたJSON値によるクエリ
resultSet2, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("dynamic_json['nested']['value'] > 40").
    WithOutputFields("my_id", "dynamic_json"))
if err != nil {
    return err
}

// 数値によるクエリ
resultSet3, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("words >= 100").
    WithOutputFields("my_id", "words"))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
# 動的フィールドキーによるクエリ
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "my_collection",
  "filter": "overview == \"Great product\"",
  "outputFields": ["my_id", "overview", "words"]
}'

# ネストされたJSON値によるクエリ
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "my_collection",
  "filter": "dynamic_json[\"nested\"][\"value\"] > 40",
  "outputFields": ["my_id", "dynamic_json"]
}'

# 数値によるクエリ
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "my_collection",
  "filter": "words >= 100",
  "outputFields": ["my_id", "words"]
}'
```

</TabItem>
</Tabs>

## 検索における動的フィールドの使用\{#search-with-dynamic-field}

動的フィールドは、ベクトル検索を強化するためのメタデータを格納する場合にも便利です。検索時に`output_fields`パラメータに動的フィールドキーを含めることで、検索結果にこの追加データを取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 動的フィールドキーを含むベクトル検索
results = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],  # クエリベクトル
    limit=5,
    output_fields=["my_id", "overview", "words", "dynamic_json"]
)

# 結果の例:
# [
#   {
#     "id": 1,
#     "distance": 0.123,
#     "entity": {
#       "my_id": 1,
#       "overview": "Great product",
#       "words": 150,
#       "dynamic_json": {
#         "varchar": "some text",
#         "nested": {
#           "value": 42.5
#         },
#         "string_price": "99.99"
#       }
#     }
#   }
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("my_vector")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f})))
        .topK(5)
        .outputFields(Arrays.asList("my_id", "overview", "words", "dynamic_json"))
        .build());

// 結果の例:
// [
//   {
//     "id": 1,
//     "distance": 0.123,
//     "entity": {
//       "my_id": 1,
//       "overview": "Great product",
//       "words": 150,
//       "dynamic_json": {
//         "varchar": "some text",
//         "nested": {
//           "value": 42.5
//         },
//         "string_price": "99.99"
//       }
//     }
//   }
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 動的フィールドキーを含むベクトル検索
const results = await client.search({
    collection_name: 'my_collection',
    data: [[0.1, 0.2, 0.3, 0.4, 0.5]],  // クエリベクトル
    limit: 5,
    output_fields: ['my_id', 'overview', 'words', 'dynamic_json'],
});

// 結果の例:
// [
//   {
//     "id": 1,
//     "distance": 0.123,
//     "entity": {
//       "my_id": 1,
//       "overview": "Great product",
//       "words": 150,
//       "dynamic_json": {
//         "varchar": "some text",
//         "nested": {
//           "value": 42.5
//         },
//         "string_price": "99.99"
//       }
//     }
//   }
// ]
```

</TabItem>

<TabItem value='go'>

```go
// 動的フィールドキーを含むベクトル検索
queryVector := []float32{0.1, 0.2, 0.3, 0.4, 0.5}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,                    // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("my_vector").
    WithOutputFields("my_id", "overview", "words", "dynamic_json"))
if err != nil {
    return err
}

// 結果の例:
// [
//   {
//     "id": 1,
//     "distance": 0.123,
//     "entity": {
//       "my_id": 1,
//       "overview": "Great product",
//       "words": 150,
//       "dynamic_json": {
//         "varchar": "some text",
//         "nested": {
//           "value": 42.5
//         },
//         "string_price": "99.99"
//       }
//     }
//   }
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
# 動的フィールドキーを含むベクトル検索
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "my_collection",
  "data": [
    [0.1, 0.2, 0.3, 0.4, 0.5]
  ],
  "annsField": "my_vector",
  "limit": 5,
  "outputFields": ["my_id", "overview", "words", "dynamic_json"]
}'

# 結果の例:
# {"code":0,"cost":0,"data":[{"my_id":1,"overview":"Great product","words":150,"dynamic_json":{"varchar":"some text","nested":{"value":42.5},"string_price":"99.99"},"distance":0.123,"id":1}]}
```

</TabItem>
</Tabs>

## 制限事項\{#limitations}

- 動的フィールドは、JSON型であるため、明示的なスカラーフィールドよりもパフォーマンスが低下する可能性があります。

- 動的フィールドキーにインデックスを設定していない場合、フィルタリングは全検索になり、パフォーマンスが低下する可能性があります。

- Zilliz Cloud v2.4.0以降では、動的フィールドに格納されるデータはスキーマ検証を通過する必要があります。無効なデータは挿入時に拒否されます。

- クエリや検索結果から動的フィールドデータを取得するには、`output_fields`に`*`または`$meta`を含める必要があります。

- 動的フィールドは、アップサート操作ではサポートされていません。
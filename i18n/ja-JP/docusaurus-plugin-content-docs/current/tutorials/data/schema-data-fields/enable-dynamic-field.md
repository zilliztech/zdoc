---
title: "ダイナミックフィールド | Cloud"
slug: /enable-dynamic-field
sidebar_label: "ダイナミックフィールド"
beta: FALSE
notebook: FALSE
description: "Zillizクラウド「ダイナミックフィールド」と呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入することができます。このフィールドは、`$meta`という隠しJSONフィールドとして実装されており、コレクションスキーマで明示的に定義されていないデータ内のフィールドを自動的に保存します。 | Cloud"
type: origin
token: OVxRwZWxNi4pYrkdKxCcOuY2nf1
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - dynamic field
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ダイナミックフィールド

Zillizクラウド「ダイナミックフィールド」と呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入することができます。このフィールドは、`$meta`という隠しJSONフィールドとして実装されており、コレクションスキーマで明示的に定義されていないデータ内のフィールドを自動的に保存します。

## どのように動作するか{#how-it-works}

ダイナミックフィールドが有効になっている場合、Zillizクラウド各エンティティに非表示の`$meta`フィールドを追加します。このフィールドはJSONタイプであり、任意のJSON互換データ構造を格納でき、JSONパス構文を使用してインデックス化できます。

データ挿入中、スキーマで宣言されていないフィールドは、この動的フィールド内のキーと値のペアとして自動的に保存されます。

`$meta`を手動で管理する必要はありません。Zillizクラウドそれを透明に処理します。

たとえば、コレクションスキーマで`id`と`vector`のみが定義されている場合、次のエンティティを挿入します。

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3],
  "name": "Item A",    // Not in schema
  "category": "books"  // Not in schema
}
```

ダイナミックフィールド機能を有効にすると、Zillizクラウド内部的に以下のように保存します:

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

これにより、スキーマを変更することなくデータ構造を進化させることができます。

一般的な使用例は次のとおりです:

- オプションまたはまれに取得されるフィールドの保存

- エンティティによって異なるメタデータをキャプチャする

- 特定の動的フィールドキーのインデックスによる柔軟なフィルタリングをサポートする

## サポートされるデータ型{#supported-data-types}

動的フィールドは、提供されるすべてのスカラーデータ型をサポートしていますZillizクラウドこれらのデータ型は、`$meta`に格納されたキーの**値に適用されます。単純な値と複雑な値の両方を含みます。

**サポートされているタイプ:**

- インラインコードプレースホルダー0

- 整数(`INT8`, `INT32`,`INT64`)

- 浮動小数点(`FLOAT`, `DOUBLE`)

- `BOOL`はブール値です。

- スカラー値の配列(`ARRAY`)

- JSONオブジェクト(`JSON`)

**の例:**

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

上記の各キーと値は、`$meta`フィールド内に格納されます。

## ダイナミックフィールドを有効にする{#enable-dynamic-field}

動的フィールド機能を使用するには、コレクションスキーマを作成するときに`enable_dynamic_field=True`を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Initialize client
client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Create schema with dynamic field enabled
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True,
)

# Add explicitly defined fields
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# Create the collection
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

// Initialize client
const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT' });

// Create collection
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

## コレクションにエンティティを挿入する{#insert-entities-to-the-collection}

動的フィールドを使用すると、スキーマで定義されていない追加のフィールドを挿入できます。これらのフィールドは`$meta`に自動的に保存されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
entities = [
    {
        "my_id": 1, # Explicitly defined primary field
        "my_vector": [0.1, 0.2, 0.3, 0.4, 0.5], # Explicitly defined vector field
        "overview": "Great product",       # Scalar key not defined in schema
        "words": 150,                      # Scalar key not defined in schema
        "dynamic_json": {                  # JSON key not defined in schema
            "varchar": "some text",
            "nested": {
                "value": 42.5
            },
            "string_price": "99.99"        # Number stored as string
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

## 動的フィールド内のインデックスキー{#index-keys-in-the-dynamic-field}

Zillizクラウド**JSONパスインデックス**を使用して、動的フィールド内の特定のキーにインデックスを作成できます。これらは、JSONオブジェクト内のスカラー値またはネストされた値です。

<Admonition type="info" icon="📘" title="ノート">

<p>動的フィールドキーのインデックスは<strong>オプション</strong>です。インデックスなしで動的フィールドキーでクエリやフィルタリングを行うことはできますが、総当たり検索によりパフォーマンスが低下する可能性があります。</p>

</Admonition>

### JSONパスインデックスの構文{#json-path-indexing-syntax}

JSONパスインデックスを作成するには、次のように指定します。

- JSONパス(`json_path`):インデックス化したいJSONオブジェクト内のキーまたはネストされたフィールドへのパス。

    - 例: `metadata["category"]`の場合

        これにより、インデックスエンジンがJSON構造内のどこを見るべきかが定義されます。

- **JSONキャストタイプ**(`json_cast_type`):データ型Zillizクラウド指定されたパスの値を解釈およびインデックス化する場合に使用する必要があります。

    - このタイプは、インデックス化されるフィールドの実際のデータ型と一致する必要があります。

    - 完全なリストについては、[サポートされているJSONキャストタイプ](./use-json-fields#supported-json-cast-types)を参照してください。

### JSONパスを使用して動的フィールドキーをインデックス化する{#use-json-path-to-index-dynamic-field-keys}

動的フィールドはJSONフィールドであるため、JSONパス構文を使用してその中の任意のキーをインデックス化できます。これは、単純なスカラー値と複雑なネスト構造の両方で機能します。

**JSONパスの例:**

- シンプルなキーの場合: `overview`、`words`

- ネストされたキーの場合: `dynamic_json['varchar']`、`dynamic_json['nested']['value']`

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Index a simple string key
index_params.add_index(
    field_name="overview",  # Key name in the dynamic field
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="overview_index",  # Unique index name
    # highlight-start
    params={
        "json_cast_type": "varchar",   # Data type that Milvus uses when indexing the values
        "json_path": "overview"        # JSON path to the key
    }
    # highlight-end
)

# Index a simple numeric key
index_params.add_index(
    field_name="words",  # Key name in the dynamic field
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="words_index",  # Unique index name
    # highlight-start
    params={
        "json_cast_type": "double",  # Data type that Milvus uses when indexing the values
        "json_path": "words" # JSON path to the key
    }
    # highlight-end
)

# Index a nested key within a JSON object
index_params.add_index(
    field_name="dynamic_json", # JSON key name in the dynamic field
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="json_varchar_index", # Unique index name
    # highlight-start
    params={
        "json_cast_type": "varchar", # Data type that Milvus uses when indexing the values
        "json_path": "dynamic_json['varchar']" # JSON path to the nested key
    }
    # highlight-end
)

# Index a deeply nested key
index_params.add_index(
    field_name="dynamic_json",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="json_nested_index", # Unique index name
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

### 型変換にJSONキャスト関数を使用する{#use-json-cast-functions-for-type-conversion}

動的フィールドキーに誤った形式の値が含まれている場合(例:文字列として格納されている数値)、キャスト関数を使用して変換できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Convert a string to double before indexing
index_params.add_index(
    field_name="dynamic_json", # JSON key name
    index_type="AUTOINDEX",
    index_name="json_string_price_index",
    params={
        "json_path": "dynamic_json['string_price']",
        "json_cast_type": "double", # Must be the output type of the cast function
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE" # Case insensitive; convert string to double
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
<li><p>型の変換に失敗した場合（例えば、<code>"not_a_number"</code>の値を数値に変換できない場合）、その値はスキップされ、インデックス化されません。</p></li>
<li><p>キャスト関数のパラメータの詳細については、<a href="./use-json-fields#use-json-cast-functions-for-type-conversion">JSONフィールド</a>を参照してください。</p></li>
</ul>

</Admonition>

### コレクションにインデックスを適用する{#apply-indexes-to-the-collection}

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

## ダイナミックフィールドキーでフィルタリング{#filter-by-dynamic-field-keys}

動的フィールドキーを持つ図形を挿入した後、標準のフィルタ式を使用してそれらをフィルタリングできます。

- JSON以外のキー(文字列、数値、ブール値など)については、キー名で直接参照できます。

- JSONオブジェクトを格納するキーについては、ネストされた値にアクセスするためにJSONパス構文を使用してください。

前のセクションの[ザ・ ](./enable-dynamic-field#insert-entities-to-the-collection) [例のエンティティ](./enable-dynamic-field#insert-entities-to-the-collection)に基づいて、有効なフィルター式は次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'overview == "Great product"'                # Non-JSON key
filter = 'words >= 100'                               # Non-JSON key
filter = 'dynamic_json["nested"]["value"] < 50'       # JSON object key
```

</TabItem>

<TabItem value='java'>

```java
String filter = 'overview == "Great product"';
String filter = 'words >= 100';
String filter = 'dynamic_json["nested"]["value"] < 50';
```

</TabItem>

<TabItem value='javascript'>

```javascript
filter = 'overview == "Great product"'                // Non-JSON key
filter = 'words >= 100'                               // Non-JSON key
filter = 'dynamic_json["nested"]["value"] < 50'       // JSON object key
```

</TabItem>

<TabItem value='go'>

```go
filter := 'overview == "Great product"'
filter := 'words >= 100'
filter := 'dynamic_json["nested"]["value"] < 50'
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filterOverview='overview == "Great product"'
export filterWords='words >= 100'
export filterNestedValue='dynamic_json["nested"]["value"] < 50'
```

</TabItem>
</Tabs>

動的フィールドキーの取得:検索またはクエリの結果で動的フィールドキーを返すには、フィルタリングと同じJSONパス構文を使用して、`output_fields`パラメータで明示的に指定する必要があります

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Example: Include dynamic field keys in search results
results = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],
    filter=filter,                         # Filter expression defined earlier
    limit=10,
    # highlight-next-line
    output_fields=[
        "my_id",                           # Schema-defined field
        "overview",                        # Simple dynamic field key
        'dynamic_json["varchar"]'          # Nested JSON key
    ]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.1, 0.2, 0.3, 0.4, 0.5});
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(5)
        .filter(filter)
        .outputFields(Arrays.asList("overview", "dynamic_json['varchar']"))
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const query_vector = [0.1, 0.2, 0.3, 0.4, 0.5]

const res = await client.search({
    collection_name: "my_collection",
    data: [query_vector],
    limit: 5,
    filters: filter,
    output_fields: ["overview", "dynamic_json['varchar']"]
})
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := client.New(ctx, &client.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

queryVector := []float32{0.1, 0.2, 0.3, 0.4, 0.5}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("my_vector").
    WithFilter(filter).
    WithOutputFields("overview", "dynamic_json['varchar']"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"
export FILTER='color like "red%" and likes > 50'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"my_collection\",
  \"data\": [
    [0.1, 0.2, 0.3, 0.4, 0.5]
  ],
  \"annsField\": \"my_vector\",
  \"filter\": \"${FILTER}\",
  \"limit\": 5,
  \"outputFields\": [\"overview\", \"dynamic_json.varchar\"]
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p>動的フィールドキーはデフォルトでは結果に含まれず、明示的に要求する必要があります。</p>

</Admonition>

サポートされている演算子とフィルター式の一覧については、[フィルター検索](./filtered-search)を参照してください。

## すべてをまとめる{#put-it-all-together}

今までに、スキーマで定義されていないキーを柔軟に格納およびインデックス化するために動的フィールドを使用する方法を学びました。動的フィールドキーが挿入されると、フィルター式の他のフィールドと同様に使用できます。特別な構文は必要ありません。

実世界のアプリケーションでワークフローを完了するには、次のことも必要です:

- **ベクトルフィールドにインデックスを作成する**(各コレクションに必須)  

    参照するリンク_PLACEHOLDER_0

- **コレクションを読み込む**

    [ロード&リリース](./load-release-collections)を参照してください。

- **JSONパスフィルターを使用した検索またはクエリ**  

    [フィルター検索](./filtered-search)と[JSON演算子](./json-filtering-operators)を参照してください。

## よくある質問(FAQ){#faq}

### スキーマで動的フィールドキーを使用する代わりに、フィールドを明示的に定義する必要があるのはいつですか?{#when-should-i-define-a-field-explicitly-in-the-schema-instead-of-using-a-dynamic-field-key}

動的フィールドキーを使用する代わりに、スキーマでフィールドを明示的に定義する必要があります

- フィールドは頻繁にoutput_fieldsに含まれます:明示的に定義されたフィールドのみが、`output_fields`を介して効率的に取得できることが保証されています。動的フィールドキーは高頻度の取得に最適化されておらず、パフォーマンスオーバーヘッドを引き起こす可能性があります。

- フィールドは頻繁にアクセスまたはフィルタリングされます:動的フィールドキーをインデックス化することで、固定スキーマフィールドと同様のフィルタリングパフォーマンスを提供できますが、明示的に定義されたフィールドはより明確な構造とより良いメンテナンス性を提供します。

- **フィールドの動作を完全に制御する必要があります**:明示的なフィールドは、スキーマレベルの制約、検証、およびより明確な型付けをサポートしており、データの整合性と一貫性を管理するのに役立ちます。

- インデックスの不整合を避けたい場合:動的フィールドキーのデータは、型や構造の不整合により影響を受けやすくなります。固定スキーマを使用することで、特にインデックスやキャストを使用する場合にデータの品質を確保できます。

### 同じ動的フィールドキーに異なるデータ型で複数のインデックスを作成できますか?{#can-i-create-multiple-indexes-on-the-same-dynamic-field-key-with-different-data-types}

いいえ、**JSONパスごとに1つのインデックスのみ作成できます**。動的フィールドキーに混合型の値(例:一部の文字列と一部の数値)が含まれている場合でも、そのパスをインデックス化する際には、単一の`json_cast_type`を選択する必要があります。同じキーに異なるタイプの複数のインデックスは現時点ではサポートされていません。

### 動的フィールドキーをインデックス化する場合、データキャストが失敗した場合はどうなりますか?{#when-indexing-a-dynamic-field-key-what-if-the-data-casting-fails}

動的フィールドキーにインデックスを作成した場合、データキャストが失敗した場合(たとえば、`double`にキャストする値が`"abc"`のような非数値文字列である場合)、これらの特定の値はインデックス作成中に**静かにスキップされます**。インデックスには表示されないため、インデックスに依存するフィルターベースの検索またはクエリ結果には返されません。

これにはいくつかの重要な意味があります。

- フルスキャンへのフォールバックはありません:エンティティの大部分が正常にインデックス化された場合、フィルタリングクエリは完全にインデックスに依存します。キャストに失敗したエンティティは、フィルター条件に論理的に一致していても、結果セットから除外されます。

- 検索精度リスク:データ品質が一貫していない大規模なデータセット(特に動的フィールドキー)では、この動作が予期しない結果の欠落につながる可能性があります。インデックス化する前に、一貫性のある有効なデータフォーマットを確保することが重要です。

- キャスト関数を注意深く使用してください:インデックス作成中に文字列を数値に変換するために`json_cast_function`を使用する場合、文字列の値が信頼性の高い変換可能であることを確認してください。`json_cast_type`と実際に変換された型との不一致は、エラーまたはスキップされたエントリの原因となります。

### インデックス化されたキャストタイプとは異なるデータ型をクエリで使用した場合、どうなりますか?{#what-happens-if-my-query-uses-a-different-data-type-than-the-indexed-cast-type}

クエリがインデックスで使用されたデータ型とは異なるデータ型を使用して動的フィールドキーを比較する場合(例:インデックスが`double`にキャストされたときに文字列比較でクエリを実行する場合)、システムはインデックスを使用せず、可能な限りフルスキャンにフォールバックする可能性があります。最高のパフォーマンスと正確性を得るために、クエリタイプがインデックス作成時に使用された`json_cast_type`と一致するようにしてください。
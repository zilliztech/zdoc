---
title: "Dynamic Field | BYOC"
slug: /enable-dynamic-field
sidebar_label: "Dynamic Field"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、dynamic field と呼ばれる特別な機能を使用して、柔軟で変化し続ける構造を持つエンティティを挿入できます。このフィールドは `$meta` という名前の非表示の JSON フィールドとして実装されており、コレクションスキーマで明示的に定義されていないデータ内のすべてのフィールドを自動的に保存します。 | BYOC"
type: origin
token: OVxRwZWxNi4pYrkdKxCcOuY2nf1
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Dynamic Field

Zilliz Cloud では、**dynamic field** と呼ばれる特別な機能を使用して、柔軟で変化し続ける構造を持つエンティティを挿入できます。このフィールドは `$meta` という名前の非表示の JSON フィールドとして実装されており、データ内でコレクションスキーマに**明示的に定義されていない**フィールドを自動的に保存します。

## 仕組み\{#how-it-works}

dynamic field が有効になっている場合、Zilliz Cloud は各エンティティに非表示の `$meta` フィールドを追加します。このフィールドは JSON 型であるため、JSON と互換性のある任意のデータ構造を保存でき、JSON path 構文を使用してインデックスを作成できます。

データ挿入時には、スキーマで宣言されていないフィールドはすべて、この dynamic field 内にキーと値のペアとして自動的に保存されます。

`$meta` を手動で管理する必要はありません。Zilliz Cloud が透過的に処理します。

たとえば、コレクションスキーマで `id` と `vector` のみを定義し、次のエンティティを挿入するとします。

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3],
  "name": "Item A",    // Not in schema
  "category": "books"  // Not in schema
}
```

dynamic field 機能を有効にすると、Zilliz Cloud は内部的に次のように保存します。

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

一般的なユースケースは次のとおりです。

- オプションのフィールドや取得頻度の低いフィールドの保存

- エンティティごとに異なるメタデータのキャプチャ

- 特定の dynamic field キーへのインデックスによる柔軟なフィルタリングのサポート

## サポートされるデータ型\{#supported-data-types}

dynamic field は、単純な値と複雑な値の両方を含め、Zilliz Cloud が提供するすべてのスカラーデータ型をサポートしています。これらのデータ型は、**`$meta` に保存されるキーの値**に適用されます。

**サポートされる型は次のとおりです。**

- 文字列 (`VARCHAR`)

- 整数 (`INT8`, `INT32`, `INT64`)

- 浮動小数点数 (`FLOAT`, `DOUBLE`)

- ブール値 (`BOOL`)

- スカラー値の配列 (`ARRAY`)

- JSON オブジェクト (`JSON`)

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

上記の各キーと値はすべて `$meta` フィールド内に保存されます。

## dynamic field を有効にする\{#enable-dynamic-field}

dynamic field 機能を使用するには、コレクションスキーマの作成時に `enable_dynamic_field=True` を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
--header "Request-Timeout: 10" \
--data "{
  \"collectionName\": \"my_collection\",
  \"schema\": $schema
}"
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->SetEnableDynamicField(true);
schema->AddField({"my_id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("my_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## コレクションにエンティティを挿入する\{#insert-entities-to-the-collection}

dynamic field を使用すると、スキーマで定義されていない追加のフィールドを挿入できます。これらのフィールドは `$meta` に自動的に保存されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
milvus::EntityRows data = {
    {
        {"my_id", 1},
        {"my_vector", std::vector<float>{0.1, 0.2, 0.3, 0.4, 0.5}},
        {"overview", "Great product"},
        {"words", 150},
        {"dynamic_json", {
                {"varchar", "some text"},
                {"nested", {"value", 42.5}},
                {"string_price", "99.99"},
            }
        }
    }
};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data)),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## dynamic field 内のキーにインデックスを作成する\{#index-keys-in-the-dynamic-field}

Zilliz Cloud では、**JSON path indexing** を使用して、dynamic field 内の特定のキーにインデックスを作成できます。これらのキーは、スカラー値または JSON オブジェクト内のネストされた値です。

<Admonition type="info" title="Notes">

dynamic field キーへのインデックス作成は**任意**です。インデックスがなくても dynamic field キーでクエリやフィルタリングを実行できますが、総当たり検索になるためパフォーマンスが低下する可能性があります。

</Admonition>

### JSON path indexing の構文\{#json-path-indexing-syntax}

JSON path インデックスを作成するには、次の項目を指定します。

- **JSON path** (`json_path`): インデックスを作成する JSON オブジェクト内のキーまたはネストされたフィールドへのパス。

    - 例: `metadata["category"]`

        これは、インデックスエンジンが JSON 構造内のどこを参照すべきかを定義します。

- **JSON cast type** (`json_cast_type`): 指定されたパスの値を解釈し、インデックスを作成するときに Zilliz Cloud が使用するデータ型。

    - この型は、インデックスを作成するフィールドの実際のデータ型と一致している必要があります。

    - 完全な一覧については、[Supported JSON cast types](./json-field-overview) を参照してください。

### JSON path を使用して dynamic field キーにインデックスを作成する\{#use-json-path-to-index-dynamic-field-keys}

dynamic field は JSON フィールドであるため、JSON path 構文を使用してその中の任意のキーにインデックスを作成できます。これは、単純なスカラー値と複雑なネスト構造の両方で機能します。

**JSON path の例:**

- 単純なキーの場合: `overview`, `words`

- ネストされたキーの場合: `dynamic_json['varchar']`, `dynamic_json['nested']['value']`

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
        "json_cast_type": "varchar",   # Data type that Zilliz Cloud uses when indexing the values
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
        "json_cast_type": "double",  # Data type that Zilliz Cloud uses when indexing the values
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
        "json_cast_type": "varchar", # Data type that Zilliz Cloud uses when indexing the values
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

<TabItem value='c++'>

```c++
milvus::IndexDesc overview_index("overview", "overview_index", milvus::IndexType::AUTOINDEX);
overview_index.AddExtraParam("json_cast_type", "varchar");
overview_index.AddExtraParam("json_path", "overview");

milvus::IndexDesc words_index("words", "words_index", milvus::IndexType::AUTOINDEX);
words_index.AddExtraParam("json_cast_type", "double");
words_index.AddExtraParam("json_path", "words");

milvus::IndexDesc json_nested_index("dynamic_json", "json_nested_index", milvus::IndexType::AUTOINDEX);
json_nested_index.AddExtraParam("json_cast_type", "double");
json_nested_index.AddExtraParam("json_path", "dynamic_json['nested']['value']");

auto status = client->CreateIndex(milvus::CreateIndexRequest()
                                     .WithCollectionName(collection_name)
                                     .AddIndex(std::move(overview_index))
                                     .AddIndex(std::move(words_index))
                                     .AddIndex(std::move(json_nested_index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 型変換に JSON cast 関数を使用する\{#use-json-cast-functions-for-type-conversion}

dynamic field キーに正しくない形式の値（たとえば文字列として保存された数値）が含まれている場合は、cast 関数を使用して変換できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
milvus::IndexDesc string_price_index("dynamic_json", "json_string_price_index", milvus::IndexType::AUTOINDEX);
string_price_index.AddExtraParam("json_cast_type", "double");
string_price_index.AddExtraParam("json_path", "dynamic_json['string_price']");
string_price_index.AddExtraParam("json_cast_function", "STRING_TO_DOUBLE");
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

- 型変換に失敗した場合（たとえば値 `"not_a_number"` を数値に変換できない場合）、その値はスキップされ、インデックスは作成されません。

- cast 関数のパラメータの詳細については、[JSON Field Overview](./json-field-overview) を参照してください。

</Admonition>

### コレクションにインデックスを適用する\{#apply-indexes-to-the-collection}

インデックスパラメータを定義したら、`create_index()` を使用してそれらをコレクションに適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
--header "Request-Timeout: 10" \
--data "{
  \"collectionName\": \"my_collection\",
  \"indexParams\": $indexParams
}"
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateIndex(milvus::CreateIndexRequest()
                                     .WithCollectionName(collection_name)
                                     .AddIndex(std::move(overview_index))
                                     .AddIndex(std::move(words_index))
                                     .AddIndex(std::move(json_nested_index))
                                     .AddIndex(std::move(string_price_index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## dynamic field キーによるフィルタリング\{#filter-by-dynamic-field-keys}

dynamic field キーを持つエンティティを挿入した後は、標準のフィルタ式を使用してそれらをフィルタリングできます。

- JSON 以外のキー（文字列、数値、ブール値など）は、キー名を直接参照して使用できます。

- JSON オブジェクトを保存するキーの場合は、JSON path 構文を使用してネストされた値にアクセスします。

前のセクションの[この](./enable-dynamic-field#insert-entities-to-the-collection)[エンティティ例](./enable-dynamic-field#insert-entities-to-the-collection)に基づくと、有効なフィルタ式には次のものが含まれます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
export filter='overview == "Great product"'
export filter='words >= 100'
export filter='dynamic_json["nested"]["value"] < 50'
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = R"(overview == "Great product")";
std::string filter = R"(words >= 100)";
std::string filter = R"(dynamic_json["nested"]["value"] < 50)";
```

</TabItem>
</Tabs>

**dynamic field キーの取得**: 検索またはクエリの結果で dynamic field キーを返すには、フィルタリングと同じ JSON path 構文を使用して `output_fields` パラメータで明示的に指定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Example: Include dynamic field keys in search results
results = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],
    filter=filter,                         # Filter expression defined earlier
    limit=10,
    # highlight-start
    output_fields=[
        "overview",                        # Simple dynamic field key
        "dynamic_json"          # Nested JSON key
    ]
    # highlight-end
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
        .outputFields(Arrays.asList("overview", "dynamic_json"))
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
    output_fields: ["overview", "dynamic_json"]
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
    WithOutputFields("overview", "dynamic_json"))
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
--header "Request-Timeout: 10" \
--data "{
  \"collectionName\": \"my_collection\",
  \"data\": [
    [0.1, 0.2, 0.3, 0.4, 0.5]
  ],
  \"annsField\": \"my_vector\",
  \"filter\": \"${FILTER}\",
  \"limit\": 5,
  \"outputFields\": [\"overview\", \"dynamic_json\"]
}"
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4, 0.5};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("my_vector")
                   .WithLimit(5)
                   .WithFilter(filter)
                   .AddOutputField("overview")
                   .AddOutputField("dynamic_json")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

dynamic field キーはデフォルトでは結果に含まれないため、明示的に要求する必要があります。

</Admonition>

サポートされている演算子とフィルタ式の完全な一覧については、[Filtered Search](./filtered-search) を参照してください。

## まとめ\{#put-it-all-together}

ここまでで、スキーマで定義されていないキーを柔軟に保存し、インデックスを作成するために dynamic field を使用する方法を学習しました。dynamic field キーを挿入した後は、特別な構文を使用せずに、他のフィールドと同様にフィルタ式で使用できます。

実際のアプリケーションでワークフローを完了するには、次のことも必要です。

- **ベクトルフィールドにインデックスを作成する**（各コレクションで必須）  

    詳細については、[AUTOINDEX Explained](./autoindex-explained) と関連ページを参照してください。

- **コレクションをロードする**

    詳細については、[Load & Release](./load-release-collections) を参照してください。

- **JSON path フィルタを使用して検索またはクエリを実行する**  

    詳細については、[Filtered Search](./filtered-search) と [JSON Operators](./json-filtering-operators) を参照してください。

## FAQ\{#faq}

### dynamic field キーを使用する代わりに、スキーマでフィールドを明示的に定義する必要があるのはどのような場合ですか？\{#when-should-i-define-a-field-explicitly-in-the-schema-instead-of-using-a-dynamic-field-key}

次のような場合は、dynamic field キーを使用する代わりに、スキーマでフィールドを明示的に定義することをお勧めします。

- **フィールドが output_fields に頻繁に含まれる場合**: 明示的に定義されたフィールドだけが、`output_fields` を通じて効率的に取得できることが保証されます。dynamic field キーは高頻度の取得に最適化されていないため、パフォーマンスのオーバーヘッドが発生する可能性があります。

- **フィールドへのアクセスやフィルタリングが頻繁に行われる場合**: dynamic field キーにインデックスを作成すると固定スキーマフィールドと同程度のフィルタリングパフォーマンスが得られますが、明示的に定義されたフィールドの方が構造が明確で保守性に優れています。

- **フィールドの動作を完全に制御する必要がある場合**: 明示的なフィールドはスキーマレベルの制約、検証、より明確な型指定をサポートしており、データの整合性と一貫性の管理に役立ちます。

- **インデックスの不整合を回避したい場合**: dynamic field キー内のデータは、型や構造に不整合が生じやすくなります。固定スキーマを使用すると、特にインデックス作成や cast を計画している場合に、データ品質を確保しやすくなります。

dynamic field キーを既存のコレクションの明示的なスカラーフィールドにする場合は、[コレクションスキーマの変更](./add-fields-to-an-existing-collection) を参照してください。既存のコレクションレベルの dynamic field 設定はコレクションプロパティで管理されます。詳細については、[コレクションの変更](./modify-collections) を参照してください。

### 同じ dynamic field キーに対して、異なるデータ型で複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-dynamic-field-key-with-different-data-types}

いいえ、**JSON path ごとに作成できるインデックスは 1 つだけ**です。dynamic field キーに異なる型の値が含まれている場合（たとえば文字列と数値が混在している場合）でも、そのパスにインデックスを作成するときは単一の `json_cast_type` を選択する必要があります。同じキーに対して異なる型で複数のインデックスを作成することは、現時点ではサポートされていません。

### dynamic field キーにインデックスを作成するとき、データの cast に失敗した場合はどうなりますか？\{#when-indexing-a-dynamic-field-key-what-if-the-data-casting-fails}

dynamic field キーにインデックスを作成した後でデータの cast に失敗した場合（たとえば `double` に cast する予定の値が `"abc"` のような数値以外の文字列である場合）、それらの値は**インデックス作成時に通知なしにスキップされます**。これらの値はインデックスに含まれないため、インデックスに依存する**フィルタベースの検索またはクエリの結果には返されません**。

これにはいくつか重要な影響があります。

- **フルスキャンへのフォールバックは行われない**: 大多数のエンティティのインデックス作成が成功した場合、フィルタリングクエリはインデックスのみに依存します。cast に失敗したエンティティは、フィルタ条件に論理的に一致していても結果セットから除外されます。

- **検索精度のリスク**: データ品質が一貫していない大規模なデータセット（特に dynamic field キー）では、この動作によって予期しない結果の欠落が発生する可能性があります。インデックスを作成する前に、一貫性のある有効なデータ形式を確保することが重要です。

- **cast 関数は慎重に使用する**: インデックス作成時に `json_cast_function` を使用して文字列を数値に変換する場合は、文字列の値を確実に変換できることを確認してください。`json_cast_type` と実際に変換される型が一致しない場合、エラーが発生したり、エントリがスキップされたりします。

### クエリで、インデックス作成時の cast 型とは異なるデータ型を使用するとどうなりますか？\{#what-happens-if-my-query-uses-a-different-data-type-than-the-indexed-cast-type}

クエリが dynamic field キーを比較する際に、インデックスで使用された型とは**異なるデータ型**を使用している場合（たとえば、インデックスが `double` に cast されているのに文字列比較でクエリする場合）、システムは**インデックスを使用しません**。また、*可能な場合に限り* フルスキャンにフォールバックすることがあります。最高のパフォーマンスと精度を得るには、クエリの型がインデックス作成時に使用した `json_cast_type` と一致していることを確認してください。

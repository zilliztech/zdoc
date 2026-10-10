---
title: "動的フィールド | BYOC"
slug: /enable-dynamic-field
sidebar_label: "動的フィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、動的フィールドと呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは `$meta` という名前の非表示の JSON フィールドとして実装され、コレクションスキーマで明示的に定義されていないデータ内のすべてのフィールドを自動的に格納します。 | BYOC"
type: origin
token: OVxRwZWxNi4pYrkdKxCcOuY2nf1
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 動的フィールド

Zilliz Cloud では、**動的フィールド**と呼ばれる特別な機能を通じて、柔軟で進化する構造を持つエンティティを挿入できます。このフィールドは `$meta` という名前の非表示の JSON フィールドとして実装され、コレクションスキーマで**明示的に定義されていない**データ内のすべてのフィールドを自動的に格納します。

## 仕組み\{#how-it-works}

動的フィールドが有効になっている場合、Zilliz Cloud は各エンティティに非表示の `$meta` フィールドを追加します。このフィールドは JSON 型であるため、任意の JSON 互換データ構造を格納でき、JSON パス構文を使用してインデックスを作成できます。

データ挿入時、スキーマで宣言されていないフィールドは、この動的フィールド内にキーと値のペアとして自動的に格納されます。

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

動的フィールド機能を有効にすると、Zilliz Cloud はそれを内部的に次のように格納します。

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

一般的なユースケースは次のとおりです。

- オプションのフィールドや頻繁に取得されないフィールドを格納する

- エンティティごとに異なるメタデータをキャプチャする

- 特定の動的フィールドキーに対するインデックスを介して柔軟なフィルタリングをサポートする

## サポートされるデータ型\{#supported-data-types}

動的フィールドは、Zilliz Cloud が提供するすべてのスカラーデータ型をサポートし、単純な値と複雑な値の両方を含みます。これらのデータ型は、**`$meta` に格納されるキーの値**に適用されます。

**サポートされる型は次のとおりです:**

- 文字列（`VARCHAR`）

- 整数（`INT8`、`INT32`、`INT64`）

- 浮動小数点（`FLOAT`、`DOUBLE`）

- ブール値（`BOOL`）

- スカラー値の配列（`ARRAY`）

- JSON オブジェクト（`JSON`）

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

上記の各キーと値は、`$meta` フィールド内に格納されます。

## 動的フィールドを有効にする\{#enable-dynamic-field}

動的フィールド機能を使用するには、コレクションスキーマの作成時に `enable_dynamic_field=True` を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
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

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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
    WithName("my_id").
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Initialize client
let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT")).await?;

// Create schema with dynamic field enabled
let schema = CollectionSchema::new()
    .enable_dynamic_field(true)
    .add_field(
        FieldSchema::new()
            .name("my_id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("my_vector")
            .data_type(DataType::FloatVector)
            .dimension(5),
    );

// Create the collection
client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("my_collection")
            .schema(schema)
            .build()?,
    )
    .await?;
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

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

// Initialize client
const client = new MilvusClient({ address: 'YOUR_CLUSTER_ENDPOINT' });

// Create collection
const res = await client.createCollection({
  collection_name: 'my_collection',
  schema: [
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
      },
    },
  ],
  enable_dynamic_field: true,
});
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
</Tabs>

## コレクションにエンティティを挿入する\{#insert-entities-to-the-collection}

動的フィールドを使用すると、スキーマで定義されていない追加のフィールドを挿入できます。これらのフィールドは `$meta` に自動的に格納されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import java.util.Arrays;
import java.util.Collections;

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

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/column"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("my_id", []int64{1}).
    WithFloatVectorColumn("my_vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
    }).WithColumns(
    column.NewColumnVarChar("overview", []string{"Great product"}),
    column.NewColumnInt32("words", []int32{150}),
    column.NewColumnJSONBytes("dynamic_json", [][]byte{
        []byte(`{"varchar":"some text","nested":{"value":42.5},"string_price":"99.99"}`),
    }),
))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let insert = client
    .insert(
        InsertRequest::builder()
            .collection_name("my_collection")
            .columns(vec![
                FieldData::int64("my_id", vec![1]),
                FieldData::float_vector("my_vector", vec![vec![0.1, 0.2, 0.3, 0.4, 0.5]]),
                FieldData::varchar("overview", vec!["Great product".to_string()]),
                FieldData::int32("words", vec![150]),
                FieldData::json(
                    "dynamic_json",
                    vec![json!({"varchar": "some text", "nested": {"value": 42.5}, "string_price": "99.99"})],
                ),
            ])
            .build()?,
    )
    .await?;
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
</Tabs>

## 動的フィールド内のキーにインデックスを作成する\{#index-keys-in-the-dynamic-field}

Zilliz Cloud では、**JSON パスインデックス**を使用して、動的フィールド内の特定のキーにインデックスを作成できます。これらはスカラー値または JSON オブジェクト内のネストされた値です。

<Admonition type="info" title="Notes">

動的フィールドキーへのインデックス作成は**オプション**です。インデックスがない場合でも動的フィールドキーでクエリやフィルタリングを行えますが、ブルートフォース検索のためパフォーマンスが低下する可能性があります。

</Admonition>

### JSON パスインデックスの構文\{#json-path-indexing-syntax}

JSON パスインデックスを作成するには、以下を指定します。

- **JSON パス**（`json_path`）: インデックスを作成する対象の、JSON オブジェクト内のキーまたはネストされたフィールドへのパスです。

    - 例: `metadata["category"]`

        これは、インデックスエンジンが JSON 構造内のどこを参照すべきかを定義します。

- **JSON キャスト型**（`json_cast_type`）: 指定されたパスの値を解釈してインデックスを作成するときに、Zilliz Cloud が使用するデータ型です。

    - この型は、インデックスを作成するフィールドの実際のデータ型と一致している必要があります。

    - 完全なリストについては、[サポートされる JSON キャスト型](./json-field-overview) を参照してください。

### JSON パスを使用して動的フィールドのキーにインデックスを作成する\{#use-json-path-to-index-dynamic-field-keys}

動的フィールドは JSON フィールドであるため、JSON パス構文を使用してその中の任意のキーにインデックスを作成できます。これは、単純なスカラー値と複雑なネスト構造の両方で機能します。

**JSON パスの例:**

- 単純なキーの場合: `overview`、`words`

- ネストされたキーの場合: `dynamic_json['varchar']`、`dynamic_json['nested']['value']`

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

List<IndexParam> indexParams = new ArrayList<>();

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

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", "overview").
    WithIndexName("overview_index")
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "double", "words").
    WithIndexName("words_index")
jsonIndex3 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `dynamic_json['varchar']`).
    WithIndexName("json_varchar_index")
jsonIndex4 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `dynamic_json['nested']['value']`).
    WithIndexName("json_nested_index")

indexOpt1 := milvusclient.NewCreateIndexOption("my_collection", "overview", jsonIndex1)
indexOpt2 := milvusclient.NewCreateIndexOption("my_collection", "words", jsonIndex2)
indexOpt3 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex3)
indexOpt4 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex4)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let mut index_params = vec![
    IndexParam::new()
        .field_name("overview")
        .index_name("overview_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_cast_type".to_string(), "varchar".to_string()),
            ("json_path".to_string(), "overview".to_string()),
        ])),
    IndexParam::new()
        .field_name("words")
        .index_name("words_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_cast_type".to_string(), "double".to_string()),
            ("json_path".to_string(), "words".to_string()),
        ])),
    IndexParam::new()
        .field_name("dynamic_json")
        .index_name("json_varchar_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_cast_type".to_string(), "varchar".to_string()),
            ("json_path".to_string(), "dynamic_json['varchar']".to_string()),
        ])),
    IndexParam::new()
        .field_name("dynamic_json")
        .index_name("json_nested_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_cast_type".to_string(), "double".to_string()),
            ("json_path".to_string(), "dynamic_json['nested']['value']".to_string()),
        ])),
];
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

milvus::IndexDesc json_varchar_index("dynamic_json", "json_varchar_index", milvus::IndexType::AUTOINDEX);
json_varchar_index.AddExtraParam("json_cast_type", "varchar");
json_varchar_index.AddExtraParam("json_path", "dynamic_json['varchar']");

milvus::IndexDesc json_nested_index("dynamic_json", "json_nested_index", milvus::IndexType::AUTOINDEX);
json_nested_index.AddExtraParam("json_cast_type", "double");
json_nested_index.AddExtraParam("json_path", "dynamic_json['nested']['value']");
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

<TabItem value='bash'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export overviewIndex='{
  "fieldName": "overview",
  "indexName": "overview_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "varchar",
    "json_path": "overview"
  }
}'

export wordsIndex='{
  "fieldName": "words",
  "indexName": "words_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "double",
    "json_path": "words"
  }
}'

export varcharIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_varchar_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "varchar",
    "json_path": "dynamic_json["varchar"]"
  }
}'

export nestedIndex='{
  "fieldName": "dynamic_json",
  "indexName": "json_nested_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_cast_type": "double",
    "json_path": "dynamic_json["nested"]["value"]"
  }
}'
```

</TabItem>
</Tabs>

### JSON キャスト関数を使用して型を変換する\{#use-json-cast-functions-for-type-conversion}

動的フィールドキーに正しくない形式の値（たとえば、文字列として格納された数値）が含まれている場合は、キャスト関数を使用して変換できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import java.util.HashMap;
import java.util.Map;

Map<String,Object> extraParams5 = new HashMap<>();
extraParams5.put("json_path", "dynamic_json['string_price']");
extraParams5.put("json_cast_type", "double");
extraParams5.put("json_cast_function", "STRING_TO_DOUBLE");
indexParams.add(IndexParam.builder()
        .fieldName("dynamic_json")
        .indexName("json_string_price_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams5)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex5 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `dynamic_json['string_price']`).
    WithIndexName("json_string_price_index")
// Note: json_cast_function (STRING_TO_DOUBLE) is not supported in milvus-sdk-go as of client/v3.0.0.
indexOpt5 := milvusclient.NewCreateIndexOption("my_collection", "dynamic_json", jsonIndex5)
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

index_params.push(
    IndexParam::new()
        .field_name("dynamic_json")
        .index_name("json_string_price_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_cast_type".to_string(), "double".to_string()),
            ("json_path".to_string(), "dynamic_json['string_price']".to_string()),
            ("json_cast_function".to_string(), "STRING_TO_DOUBLE".to_string()),
        ])),
);
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

<Admonition type="info" title="Notes">

- 型変換が失敗した場合（たとえば、値 `"not_a_number"` を数値に変換できない場合）、その値はスキップされ、インデックス化されません。

- キャスト関数のパラメーターの詳細については、[JSON フィールドの概要](./json-field-overview) を参照してください。

</Admonition>

### コレクションにインデックスを適用する\{#apply-indexes-to-the-collection}

インデックスパラメーターを定義した後、`create_index()` を使用してそれらをコレクションに適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("my_collection")
            .index_params(index_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateIndex(milvus::CreateIndexRequest()
                                     .WithCollectionName("my_collection")
                                     .AddIndex(std::move(overview_index))
                                     .AddIndex(std::move(words_index))
                                     .AddIndex(std::move(json_varchar_index))
                                     .AddIndex(std::move(json_nested_index))
                                     .AddIndex(std::move(string_price_index)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
  await client.createIndex(indexParams);
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
</Tabs>

## 動的フィールドのキーでフィルタリングする\{#filter-by-dynamic-field-keys}

動的フィールドキーを持つエンティティを挿入した後、標準のフィルター式を使用してそれらをフィルタリングできます。

- JSON 以外のキー（文字列、数値、ブール値など）の場合、キー名で直接参照できます。

- JSON オブジェクトを格納するキーの場合、JSON パス構文を使用してネストされた値にアクセスします。

前のセクションの[例](./enable-dynamic-field#insert-entities-to-the-collection)の[エンティティ](./enable-dynamic-field#insert-entities-to-the-collection)に基づくと、有効なフィルター式は次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'overview == "Great product"'                # Non-JSON key
filter = 'words >= 100'                               # Non-JSON key
filter = 'dynamic_json["nested"]["value"] < 50'       # JSON object key
```

</TabItem>

<TabItem value='java'>

```java
String filter = "overview == \"Great product\"";                // Non-JSON key
String filter1 = "words >= 100";                               // Non-JSON key
String filter2 = "dynamic_json[\"nested\"][\"value\"] < 50";       // JSON object key
```

</TabItem>

<TabItem value='go'>

```go
filter := `overview == "Great product"`                // Non-JSON key
filter1 := "words >= 100"                               // Non-JSON key
filter2 := `dynamic_json["nested"]["value"] < 50`       // JSON object key
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = r#"overview == "Great product""#;  // Non-JSON key
let filter1 = "words >= 100";                  // Non-JSON key
let filter2 = r#"dynamic_json["nested"]["value"] < 50"#;  // JSON object key
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = R"(overview == "Great product")";   // Non-JSON key
std::string filter1 = R"(words >= 100)";                  // Non-JSON key
std::string filter2 = R"(dynamic_json["nested"]["value"] < 50)";  // JSON object key
```

</TabItem>

<TabItem value='javascript'>

```javascript
filter = 'overview == "Great product"'                // Non-JSON key
filter = 'words >= 100'                               // Non-JSON key
filter = 'dynamic_json["nested"]["value"] < 50'       // JSON object key
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
</Tabs>

**動的フィールドキーの取得**: 検索結果またはクエリ結果で動的フィールドキーを返すには、フィルタリングと同じ JSON パス構文を使用して、`output_fields` パラメーターで明示的に指定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(10)
        .filter(filter)
        .outputFields(Arrays.asList("overview", "dynamic_json"))
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
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
    10,              // limit
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

<TabItem value='rust'>

```rust
let search = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("my_vector")
            .vectors(SearchVectors::Float(vec![vec![0.1, 0.2, 0.3, 0.4, 0.5]]))
            .filter(filter)
            .output_fields(["overview", "dynamic_json"])
            .limit(10)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4, 0.5};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("my_vector")
                   .WithLimit(10)
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

<TabItem value='javascript'>

```javascript
const query_vector = [0.1, 0.2, 0.3, 0.4, 0.5];

const res = await client.search({
    collection_name: "my_collection",
    data: [query_vector],
    limit: 10,
    filter: filter,
    output_fields: ["overview", "dynamic_json"]
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"
export FILTER='overview == "Great product"'

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
  \"limit\": 10,
  \"outputFields\": [\"overview\", \"dynamic_json\"]
}"
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

動的フィールドキーはデフォルトでは結果に含まれず、明示的に要求する必要があります。

</Admonition>

サポートされる演算子とフィルター式の完全なリストについては、[フィルター検索](./filtered-search) を参照してください。

## まとめ\{#put-it-all-together}

ここまでで、動的フィールドを使用して、スキーマで定義されていないキーを柔軟に格納およびインデックス作成する方法を学習しました。動的フィールドキーを挿入すると、特別な構文を使用せずに、フィルター式で他のフィールドと同様に使用できます。

実際のアプリケーションでワークフローを完了するには、次のことも必要です:

- **ベクトルフィールドにインデックスを作成する**（各コレクションで必須）  

    詳細は、[AUTOINDEX の説明](./autoindex-explained) とその関連ページを参照してください。

- **コレクションをロードする**

    詳細は、[ロードと解放](./load-release-collections) を参照してください。

- **JSON パスフィルターを使用して検索またはクエリを実行する**  

    詳細は、[フィルター検索](./filtered-search) と [JSON 演算子](./json-filtering-operators) を参照してください。

## FAQ\{#faq}

### 動的フィールドキーを使用する代わりに、フィールドをスキーマで明示的に定義するのはどのような場合ですか？\{#when-should-i-define-a-field-explicitly-in-the-schema-instead-of-using-a-dynamic-field-key}

次のような場合は、動的フィールドキーを使用する代わりに、フィールドをスキーマで明示的に定義する必要があります:

- **フィールドが output_fields に頻繁に含まれる場合**: 明示的に定義されたフィールドのみが、`output_fields` を通じて効率的に取得できることが保証されます。動的フィールドキーは高頻度の取得に最適化されていないため、パフォーマンスのオーバーヘッドが発生する可能性があります。

- **フィールドが頻繁にアクセスまたはフィルタリングされる場合**: 動的フィールドキーへのインデックス作成は固定スキーマのフィールドと同様のフィルタリングパフォーマンスを提供できますが、明示的に定義されたフィールドの方が構造が明確で保守性に優れています。

- **フィールドの動作を完全に制御する必要がある場合**: 明示的なフィールドはスキーマレベルの制約、検証、より明確な型指定をサポートしており、データの整合性と一貫性を管理するのに役立ちます。

- **インデックス作成の不整合を避けたい場合**: 動的フィールドキーのデータは、型や構造の不整合が発生しやすくなります。固定スキーマを使用すると、特にインデックス作成やキャストを使用する予定の場合に、データ品質を確保しやすくなります。

動的フィールドキーを既存のコレクションの明示的なスカラーフィールドにする場合は、[コレクションスキーマの変更](./add-fields-to-an-existing-collection) を参照してください。既存のコレクションレベルの動的フィールド設定はコレクションプロパティを通じて管理されます。詳細については、[コレクションの変更](./modify-collections) を参照してください。

### 同じ動的フィールドキーに異なるデータ型で複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-dynamic-field-key-with-different-data-types}

いいえ、**JSON パスごとに作成できるインデックスは 1 つだけです**。動的フィールドキーに混合型の値（たとえば、文字列と数値）が含まれている場合でも、そのパスにインデックスを作成するときは 1 つの `json_cast_type` を選択する必要があります。現時点では、同じキーに異なる型で複数のインデックスを作成することはサポートされていません。

### 動的フィールドキーにインデックスを作成するときにデータのキャストが失敗した場合はどうなりますか？\{#when-indexing-a-dynamic-field-key-what-if-the-data-casting-fails}

動的フィールドキーにインデックスを作成し、データのキャストが失敗した場合（たとえば、`double` にキャストされるはずの値が `"abc"` のような数値以外の文字列である場合）、それらの特定の値は**インデックス作成時に警告なしでスキップされます**。それらはインデックスに表示されず、したがってインデックスに依存する**フィルターベースの検索またはクエリ結果には返されません**。

これにはいくつかの重要な影響があります:

- **フルスキャンへのフォールバックなし**: 大多数のエンティティのインデックス作成が成功した場合、フィルタリングクエリはインデックスに完全に依存します。キャストが失敗したエンティティは、論理的にフィルター条件に一致する場合でも、結果セットから除外されます。

- **検索精度のリスク**: データ品質が一貫していない大規模なデータセット（特に動的フィールドキー）では、この動作により予期しない結果の欠落が発生する可能性があります。インデックスを作成する前に、一貫性のある有効なデータ形式を確保することが重要です。

- **キャスト関数は慎重に使用する**: インデックス作成中に `json_cast_function` を使用して文字列を数値に変換する場合は、文字列の値が確実に変換可能であることを確認してください。`json_cast_type` と実際に変換された型が一致しないと、エラーが発生したりエントリがスキップされたりします。

### クエリがインデックスされたキャスト型と異なるデータ型を使用した場合はどうなりますか？\{#what-happens-if-my-query-uses-a-different-data-type-than-the-indexed-cast-type}

クエリが、インデックスで使用された型とは**異なるデータ型**を使用して動的フィールドキーを比較する場合（たとえば、インデックスが `double` にキャストされているのに文字列比較でクエリする場合）、システムは**インデックスを使用せず**、*可能な場合にのみ*フルスキャンにフォールバックすることがあります。最良のパフォーマンスと精度を得るには、クエリの型がインデックス作成時に使用した `json_cast_type` と一致していることを確認してください。

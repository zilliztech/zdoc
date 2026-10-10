---
title: "ブール型と数値型 | Cloud"
slug: /use-number-field
sidebar_label: "ブール型と数値型"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ブール型または数値型のフィールドは、ブール値または数値を格納するスカラーフィールドです。これらの値は、2 つの値のいずれか、または整数（integers）と小数（floating-point numbers）のいずれかになります。通常、数量、測定値、または論理的あるいは数学的に処理する必要があるデータを表すために使用されます。 | Cloud"
type: origin
token: EwArwXCOPip15hkSvvpciAMJnSe
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ブール型と数値型

ブール型または数値型のフィールドは、ブール値または数値を格納するスカラーフィールドです。これらの値は、2 つの値のいずれか、または整数（**integers**）と小数（**floating-point numbers**）のいずれかになります。通常、数量、測定値、または論理的あるいは数学的に処理する必要があるデータを表すために使用されます。

以下の表は、Zilliz Cloud クラスターで利用可能な数値型フィールドのデータ型について説明します。

| フィールド型 | 説明 |
| --- | --- |
| `BOOL` | `true` または `false` を格納するブール型で、バイナリ状態の記述に適しています。 |
| `INT8` | 8 ビット整数。小範囲の整数データの格納に適しています。 |
| `INT16` | 16 ビット整数。中範囲の整数データ用です。 |
| `INT32` | 32 ビット整数。製品の数量やユーザー ID など、一般的な整数データの格納に最適です。 |
| `INT64` | 64 ビット整数。タイムスタンプや識別子など、大範囲のデータの格納に適しています。 |
| `FLOAT` | 32 ビット浮動小数点数。評価や気温など、一般的な精度を要するデータ用です。 |
| `DOUBLE` | 64 ビット倍精度浮動小数点数。財務情報や科学計算など、高精度データ用です。 |

ブール型フィールドを宣言するには、`datatype` を `BOOL` に設定するだけです。数値型フィールドを宣言するには、利用可能な数値データ型のいずれかに設定するだけです。たとえば、整数フィールドには `DataType.INT64`、浮動小数点フィールドには `DataType.FLOAT` を指定します。

<Admonition type="info" title="Notes">

Zilliz Cloud は、ブール型および数値型フィールドの null 値とデフォルト値をサポートしています。これらの機能を有効にするには、`nullable` を `True` に、`default_value` を数値に設定します。詳細については、[Nullable & Default](./nullable-fields) を参照してください。

</Admonition>

## ブール型および数値型フィールドを追加する\{#add-boolean-and-number-fields}

ブール値または数値データを格納するには、コレクションスキーマで対応する型のフィールドを定義します。以下は、2 つの数値フィールドを持つコレクションスキーマの例です：

- `age`: 整数データを格納し、null 値を許可し、デフォルト値は `18` です。

- `broken`: ブール値データを格納し、null 値を許可しますが、デフォルト値はありません。

- `price`: 浮動小数点データを格納し、null 値を許可しますが、デフォルト値はありません。

<Admonition type="info" title="Notes">

スキーマを定義するときに `enable_dynamic_fields=True` を設定すると、Zilliz Cloud では事前に定義されていないスカラーフィールドを挿入できるようになります。ただし、これによりクエリと管理が複雑になり、パフォーマンスに影響を与える可能性があります。詳細については、[Dynamic Field](./enable-dynamic-field) を参照してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Import necessary libraries
from pymilvus import MilvusClient, DataType

# Define server address
SERVER_ADDR = "YOUR_CLUSTER_ENDPOINT"

# Create a MilvusClient instance
client = MilvusClient(uri=SERVER_ADDR)

# Define the collection schema
schema = client.create_schema(
    auto_id=False,
    enable_dynamic_fields=True,
)

# Add an INT64 field `age` that supports null values with default value 18
schema.add_field(field_name="age", datatype=DataType.INT64, nullable=True, default_value=18)
schema.add_field(field_name="broken", datatype=DataType.BOOL, nullable=True)
# Add a FLOAT field `price` that supports null values without default value
schema.add_field(field_name="price", datatype=DataType.FLOAT, nullable=True)
schema.add_field(field_name="pk", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=3)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema schema = MilvusClientV2.CreateSchema();
schema.setEnableDynamicField(true);

schema.addField(AddFieldReq.builder()
        .fieldName("age")
        .dataType(DataType.Int64)
        .isNullable(true)
        .defaultValue(18)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("broken")
        .dataType(DataType.BOOL)
        .isNullable(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Float)
        .isNullable(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(3)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema().
    WithField(entity.NewField().
        WithName("pk").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true)).
    WithField(entity.NewField().
        WithName("embedding").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(3)).
    WithField(entity.NewField().
        WithName("price").
        WithDataType(entity.FieldTypeFloat).
        WithNullable(true)).
    WithField(entity.NewField().
        WithName("age").
        WithDataType(entity.FieldTypeInt64).
        WithNullable(true).
        WithDefaultValueLong(18)).
    WithField(entity.NewField().
        WithName("broken").
        WithDataType(entity.FieldTypeBool).
        WithNullable(true))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(
    &ConnectConfig::new()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN"),
)
.await?;

let mut schema = CollectionSchema::new().enable_dynamic_field(true);
schema = schema
    .add_field(
        FieldSchema::new()
            .name("pk")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("embedding")
            .data_type(DataType::FloatVector)
            .dimension(3),
    )
    .add_field(
        FieldSchema::new()
            .name("price")
            .data_type(DataType::Float)
            .nullable(true),
    )
    .add_field(
        FieldSchema::new()
            .name("age")
            .data_type(DataType::Int64)
            .nullable(true),
    )
    .add_field(
        FieldSchema::new()
            .name("broken")
            .data_type(DataType::Bool)
            .nullable(true),
    );
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"pk", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(3));
schema->AddField(milvus::FieldSchema("price", milvus::DataType::FLOAT).WithNullable(true));
schema->AddField(milvus::FieldSchema("age", milvus::DataType::INT64).WithNullable(true).WithDefaultValue(18));
schema->AddField(milvus::FieldSchema("broken", milvus::DataType::BOOL).WithNullable(true));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
const schema = [
  {
    name: "age",
    data_type: DataType.Int64,
    nullable: true,
    default_value: 18,
  },
  {
    name: "broken",
    data_type: DataType.Bool,
    nullable: true,
  },
  {
    name: "price",
    data_type: DataType.Float,
    nullable: true,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 3,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export ageField='{
    "fieldName": "age",
    "dataType": "Int64",
    "nullable": true,
    "defaultValue": 18
}'

export boolField='{
    "fieldName": "broken",
    "dataType": "Bool",
    "nullable": true
}'

export floatField='{
    "fieldName": "price",
    "dataType": "Float",
    "nullable": true
}'

export pkField='{
    "fieldName": "pk",
    "dataType": "Int64",
    "isPrimary": true
}'

export vectorField='{
    "fieldName": "embedding",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 3
    }
}'

export schema="{
    \"autoID\": false,
    \"fields\": [
        $ageField,
        $boolField,
        $floatField,
        $pkField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

## インデックスパラメーターを設定する\{#set-index-params}

インデックス作成は、検索およびクエリのパフォーマンス向上に役立ちます。Zilliz Cloud クラスターでは、ベクトルフィールドのインデックス作成は必須ですが、スカラーフィールドでは任意です。

次の例では、ベクトルフィールド `embedding` とスカラーフィールド `age` にインデックスを作成します。どちらも `AUTOINDEX` インデックスタイプを使用します。このタイプでは、Milvus がデータ型に基づいて最適なインデックスを自動的に選択します。詳細については、[AUTOINDEX Explained](./autoindex-explained) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index params

index_params = client.prepare_index_params()

# Index `age` with AUTOINDEX
index_params.add_index(
    field_name="age",
    index_type="AUTOINDEX",
    index_name="age_index"
)

# Index `embedding` with AUTOINDEX and specify similarity metric type
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",  # Use automatic indexing to simplify complex index settings
    metric_type="COSINE"  # Specify similarity metric type, options include L2, COSINE, or IP
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("age")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
        
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
indexOption1 := milvusclient.NewCreateIndexOption("my_collection", "embedding",
    index.NewAutoIndex(entity.COSINE))
indexOption2 := milvusclient.NewCreateIndexOption("my_collection", "age",
    index.NewAutoIndex(entity.L2))
```

</TabItem>

<TabItem value='rust'>

```rust
let index_params = vec![
    IndexParam::new()
        .field_name("age")
        .index_name("age_index")
        .index_type(IndexType::AutoIndex),
    IndexParam::new()
        .field_name("embedding")
        .index_type(IndexType::AutoIndex)
        .metric_type(MetricType::Cosine),
];
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("age", "age_index", milvus::IndexType::AUTOINDEX),
    milvus::IndexDesc("embedding", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { IndexType } from "@zilliz/milvus2-sdk-node";
const indexParams = [
  {
    field_name: "age",
    index_name: "inverted_index",
    index_type: IndexType.AUTOINDEX,
  },
  {
    field_name: "embedding",
    metric_type: "COSINE",
    index_type: IndexType.AUTOINDEX,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "age",
            "indexName": "inverted_index",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "embedding",
            "metricType": "COSINE",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

## コレクションを作成する\{#create-collection}

スキーマとインデックスを定義したら、数値型フィールドを含むコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create Collection
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption1, indexOption2))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("my_collection")
            .schema(schema)
            .index_params(index_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("my_collection")
                                        .WithIndexes(std::move(indexes))
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: "my_collection",
    schema: schema,
    index_params: indexParams
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## データを挿入する\{#insert-data}

コレクションを作成したら、スキーマに一致するエンティティを挿入します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample data
data = [
    {"age": 25, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
    {"age": 30, "pk": 2, "embedding": [0.4, 0.5, 0.6]}, # `price` field is missing, which should be null
    {"age": None, "price": None, "pk": 3, "embedding": [0.2, 0.3, 0.1]},  # `age` should default to 18, `price` is null
    {"age": 45, "price": None, "pk": 4, "embedding": [0.9, 0.1, 0.4]},  # `price` is null
    {"age": None, "price": 59.99, "pk": 5, "embedding": [0.8, 0.5, 0.3]},  # `age` should default to 18
    {"age": 60, "price": None, "pk": 6, "embedding": [0.1, 0.6, 0.9]}  # `price` is null
]

client.insert(
    collection_name="my_collection",
    data=data
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
rows.add(gson.fromJson("{\"age\": 25, \"price\": 99.99, \"pk\": 1, \"embedding\": [0.1, 0.2, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 30, \"pk\": 2, \"embedding\": [0.4, 0.5, 0.6]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": null, \"pk\": 3, \"embedding\": [0.2, 0.3, 0.1]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 45, \"price\": null, \"pk\": 4, \"embedding\": [0.9, 0.1, 0.4]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": null, \"price\": 59.99, \"pk\": 5, \"embedding\": [0.8, 0.5, 0.3]}", JsonObject.class));
rows.add(gson.fromJson("{\"age\": 60, \"price\": null, \"pk\": 6, \"embedding\": [0.1, 0.6, 0.9]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
priceValues := []float32{99.99, 149.50, 199.99, 0, 59.99, 0}
priceValid := []bool{true, true, true, false, true, false}
priceCol, _ := column.NewNullableColumnFloat("price", priceValues, priceValid)

ageValues := []int64{25, 30, 0, 45, 0, 60}
ageValid := []bool{true, true, false, true, false, true}
ageCol, _ := column.NewNullableColumnInt64("age", ageValues, ageValid)

brokenValues := []bool{false, true, false, true, false, false}
brokenValid := []bool{true, true, true, true, true, true}
brokenCol, _ := column.NewNullableColumnBool("broken", brokenValues, brokenValid)

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("pk", []int64{1, 2, 3, 4, 5, 6}).
    WithFloatVectorColumn("embedding", 3, [][]float32{
        {0.1, 0.2, 0.3},
        {0.4, 0.5, 0.6},
        {0.2, 0.3, 0.1},
        {0.9, 0.1, 0.4},
        {0.8, 0.5, 0.3},
        {0.1, 0.6, 0.9},
    }).
    WithColumns(priceCol, ageCol, brokenCol),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
let price_col = FieldData::float(
    "price",
    vec![99.99, 149.50, 199.99, 0.0, 59.99, 0.0],
).nullable(vec![true, true, true, false, true, false]);
let age_col = FieldData::int64(
    "age",
    vec![25, 30, 0, 45, 0, 60],
).nullable(vec![true, true, false, true, false, true]);
let broken_col = FieldData::bool(
    "broken",
    vec![false, true, false, true, false, false],
).nullable(vec![true, true, true, true, true, true]);

client
    .insert(
        InsertRequest::builder()
            .collection_name("my_collection")
            .columns(vec![
                FieldData::int64("pk", vec![1, 2, 3, 4, 5, 6]),
                FieldData::float_vector("embedding", vec![
                    vec![0.1, 0.2, 0.3],
                    vec![0.4, 0.5, 0.6],
                    vec![0.2, 0.3, 0.1],
                    vec![0.9, 0.1, 0.4],
                    vec![0.8, 0.5, 0.3],
                    vec![0.1, 0.6, 0.9],
                ]),
                price_col,
                age_col,
                broken_col,
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {
    {{"age", int64_t(25)}, {"price", float(99.99)}, {"pk", int64_t(1)}, {"embedding", std::vector<float>{0.1, 0.2, 0.3}}},
    {{"age", int64_t(30)}, {"price", float(149.50)}, {"pk", int64_t(2)}, {"embedding", std::vector<float>{0.4, 0.5, 0.6}}},
    {{"age", int64_t(35)}, {"price", float(199.99)}, {"pk", int64_t(3)}, {"embedding", std::vector<float>{0.2, 0.3, 0.1}}},
    {{"age", int64_t(45)}, {"pk", int64_t(4)}, {"embedding", std::vector<float>{0.9, 0.1, 0.4}}},
    {{"price", float(59.99)}, {"pk", int64_t(5)}, {"embedding", std::vector<float>{0.8, 0.5, 0.3}}},
    {{"age", int64_t(60)}, {"pk", int64_t(6)}, {"embedding", std::vector<float>{0.1, 0.6, 0.9}}}
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
const data = [
  { age: 25, price: 99.99, pk: 1, embedding: [0.1, 0.2, 0.3] },
  { age: 30, price: 149.5, pk: 2, embedding: [0.4, 0.5, 0.6] },
  { age: 35, price: 199.99, pk: 3, embedding: [0.2, 0.3, 0.1] },
  { age: 45, price: null, pk: 4, embedding: [0.9, 0.1, 0.4] },
  { age: null, price: 59.99, pk: 5, embedding: [0.8, 0.5, 0.3] },
  { age: 60, price: null, pk: 6, embedding: [0.1, 0.6, 0.9] },
];

await client.insert({
  collection_name: "my_collection",
  data: data,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "data": [
        {"age": 25, "broken": false, "price": 99.99, "pk": 1, "embedding": [0.1, 0.2, 0.3]},
        {"age": 30, "broken": true, "price": 149.50, "pk": 2, "embedding": [0.4, 0.5, 0.6]},
        {"age": 35, "broken": false, "price": 199.99, "pk": 3, "embedding": [0.2, 0.3, 0.1]},
        {"age": 45, "broken": true, "price": null, "pk": 4, "embedding": [0.9, 0.1, 0.4]},
        {"age": null, "broken": false, "price": 59.99, "pk": 5, "embedding": [0.8, 0.5, 0.3]},
        {"age": 60, "broken": false, "price": null, "pk": 6, "embedding": [0.1, 0.6, 0.9]}
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## フィルター式を使用してクエリする\{#query-with-filter-expressions}

エンティティを挿入したら、`query` メソッドを使用して、指定したフィルター式に一致するエンティティを取得します。

`age` が 30 より大きいエンティティを取得するには：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age > 30'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "age > 30";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
//
// [
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}), 
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 30"
queryResult, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("age > 30")
            .output_fields(vec!["age", "price", "pk"])
            .build()?,
    )
    .await?;
for row in results.rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter("age > 30")
                       .AddOutputField("age")
                       .AddOutputField("price")
                       .AddOutputField("pk");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& row : response.Results()) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.query({
    collection_name: 'my_collection',
    filter: 'age > 30',
    output_fields: ['age', 'price', 'pk']
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "filter": "age > 30",
    "outputFields": ["age","price", "pk"]
}'

## {"code":0,"cost":0,"data":[{"age":30,"pk":2,"price":149.5},{"age":35,"pk":3,"price":199.99}]}
```

</TabItem>
</Tabs>

`price` が null であるエンティティを取得するには：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price is null'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 30, 'price': None, 'pk': 2}",
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 45, 'price': None, 'pk': 4}",
#     "{'age': 60, 'price': None, 'pk': 6}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "price is null";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
// [
//    QueryResp.QueryResult(entity={price=null, pk=2, age=30}), 
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}), 
//    QueryResp.QueryResult(entity={price=null, pk=4, age=45}), 
//    QueryResp.QueryResult(entity={price=null, pk=6, age=60})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter := "price is null"
queryResult, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("price is null")
            .output_fields(vec!["age", "price", "pk"])
            .build()?,
    )
    .await?;
for row in results.rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter("price is null")
                       .AddOutputField("age")
                       .AddOutputField("price")
                       .AddOutputField("pk");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& row : response.Results()) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'price is null';

const res = await client.query({
    collection_name: "my_collection",
    filter: filter,
    output_fields: ["age", "price", "pk"]
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
  "collectionName": "my_collection",
  "filter": "price is null",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

`age` の値が `18` であるエンティティを取得するには、以下の式を使用します。`age` のデフォルト値は `18` であるため、期待される結果には、`age` を明示的に `18` に設定したエンティティ、または `age` を null に設定したエンティティが含まれます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age == 18'

res = client.query(
    collection_name="my_collection",
    filter=filter,
    output_fields=["age", "price", "pk"]
)

print(res)

# Example output:
# data: [
#     "{'age': 18, 'price': None, 'pk': 3}",
#     "{'age': 18, 'price': 59.99, 'pk': 5}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age == 18";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter(filter)
        .outputFields(Arrays.asList("age", "price", "pk"))
        .build());
System.out.println(resp.getQueryResults());

// Output
// [
//    QueryResp.QueryResult(entity={price=null, pk=3, age=18}), 
//    QueryResp.QueryResult(entity={price=59.99, pk=5, age=18})
// ]
```

</TabItem>

<TabItem value='go'>

```go
filter = "age == 18"
queryResult, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter(filter).
    WithOutputFields("pk", "age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("pk", queryResult.GetColumn("pk"))
fmt.Println("age", queryResult.GetColumn("age"))
fmt.Println("price", queryResult.GetColumn("price"))
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("age == 18")
            .output_fields(vec!["age", "price", "pk"])
            .build()?,
    )
    .await?;
for row in results.rows()? {
    println!("{:?}", row);
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter("age == 18")
                       .AddOutputField("age")
                       .AddOutputField("price")
                       .AddOutputField("pk");

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& row : response.Results()) {
    std::cout << "\t" << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
const filter = 'age == 18';

const res = await client.query({
    collection_name:"my_collection",
    filter:filter,
    output_fields=["age", "price", "pk"]
});

console.log(res);

// Example output:
// data: [
//     "{'age': 18, 'price': None, 'pk': 3}",
//     "{'age': 18, 'price': 59.99, 'pk': 5}"
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
  "collectionName": "my_collection",
  "filter": "age == 18",
  "outputFields": ["age", "price", "pk"]
}'
```

</TabItem>
</Tabs>

## フィルター式を使用したベクトル検索\{#vector-search-with-filter-expressions}

基本的な数値フィールドのフィルタリングに加えて、ベクトル類似検索と数値フィールドフィルターを組み合わせることができます。たとえば、次のコードは、ベクトル検索に数値フィールドフィルターを追加する方法を示しています：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "25 <= age <= 35"

res = client.search(
    collection_name="my_collection",
    data=[[0.3, -0.6, 0.1]],
    limit=5,
    search_params={"params": {"nprobe": 10}},
    output_fields=["age","price"],
    filter=filter
)

print(res)

# Example output:
# data: [
#     "[{'id': 2, 'distance': -0.2016308456659317, 'entity': {'age': 30, 'price': None}}, {'id': 1, 'distance': -0.23643313348293304, 'entity': {'age': 25, 'price': 99.98999786376953}}]"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String filter = "25 <= age <= 35";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("embedding")
        .data(Collections.singletonList(new FloatVec(new float[]{0.3f, -0.6f, 0.1f})))
        .topK(5)
        .outputFields(Arrays.asList("age", "price"))
        .filter(filter)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [
//   [
//     SearchResp.SearchResult(entity={price=null, age=30}, score=-0.20163085, id=2),
//     SearchResp.SearchResult(entity={price=99.99, age=25}, score=-0.23643313, id=1)
//   ]
// ]
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.3, -0.6, 0.1}
filter = "25 <= age <= 35"

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("embedding").
    WithFilter(filter).
    WithAnnParam(annParam).
    WithOutputFields("age", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("age: ", resultSet.GetColumn("age"))
    fmt.Println("price: ", resultSet.GetColumn("price"))
}
```

</TabItem>

<TabItem value='rust'>

```rust
let results = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("embedding")
            .vectors(SearchVectors::Float(vec![vec![0.3, -0.6, 0.1]]))
            .limit(5)
            .filter("25 <= age <= 35")
            .output_fields(vec!["age", "price"])
            .build()?,
    )
    .await?;
println!("{:?}", results.results());
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3, -0.6, 0.1};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("embedding")
                   .WithLimit(5)
                   .WithFilter("25 <= age <= 35")
                   .AddOutputField("age")
                   .AddOutputField("price")
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
await client.search({
    collection_name: 'my_collection',
    data: [0.3, -0.6, 0.1],
    limit: 5,
    output_fields: ['age', 'price'],
    filter: '25 <= age <= 35'
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3, -0.6, 0.1]
    ],
    "annsField": "embedding",
    "limit": 5,
    "outputFields": ["age", "price"]
}'

## {"code":0,"cost":0,"data":[{"age":35,"distance":-0.19054288,"id":3,"price":199.99},{"age":30,"distance":-0.20163085,"id":2,"price":149.5},{"age":25,"distance":-0.2364331,"id":1,"price":99.99}]}
```

</TabItem>
</Tabs>

この例では、まずクエリベクトルを定義し、検索時にフィルター条件 `25 <= age <= 35` を追加します。これにより、検索結果がクエリベクトルに類似しているだけでなく、指定した年齢範囲も満たすことが保証されます。詳細については、[Filtering Explained](./filtering-overview) を参照してください。

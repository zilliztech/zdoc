---
title: "プライマリフィールドとAutoID | Cloud"
slug: /primary-field-auto-id
sidebar_label: "プライマリフィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のすべてのコレクションには、各エンティティを一意に識別するためのプライマリフィールドが必要です。このフィールドにより、すべてのエンティティを曖昧さなく挿入、更新、クエリ、または削除できます。 | Cloud"
type: origin
token: D2ctwKZhNilLY0ke1vpcHL62n5G
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# プライマリフィールドとAutoID

Zilliz Cloud のすべてのコレクションには、各エンティティを一意に識別するためのプライマリフィールドが必要です。このフィールドにより、すべてのエンティティを曖昧さなく挿入、更新、クエリ、または削除できます。

ユースケースに応じて、Zilliz Cloud に ID を自動生成させる（AutoID）ことも、自分で ID を手動で割り当てることもできます。

## プライマリフィールドとは何ですか？\{#what-is-a-primary-field}

プライマリフィールドは、従来のデータベースにおけるプライマリキーのように、コレクション内の各エンティティの一意キーとして機能します。Zilliz Cloud は、挿入、upsert、削除、およびクエリ操作の際に、プライマリフィールドを使用してエンティティを管理します。

主な要件:

- 各コレクションには **ちょうど 1 つ** のプライマリフィールドが必要です。

- プライマリフィールドの値を null にすることはできません。

- データ型は作成時に指定する必要があり、後から変更することはできません。

## サポートされるデータ型\{#supported-data-types}

プライマリフィールドには、エンティティを一意に識別できる、サポート対象のスカラーデータ型を使用する必要があります。

| データ型 | 説明 |
| --- | --- |
| `INT64` | 64 ビット整数型で、一般的に AutoID とともに使用されます。ほとんどのユースケースで推奨される選択肢です。 |
| `VARCHAR` | 可変長文字列型です。エンティティ識別子が外部システムから来る場合（たとえば、製品コードやユーザー ID）に使用します。値ごとに許可される最大バイト数を定義するために `max_length` プロパティが必要です。 |

## AutoID と手動 ID の選択\{#choose-between-autoid-and-manual-ids}

Zilliz Cloud は、プライマリキー値の割り当てに 2 つのモードをサポートしています。

| モード | 説明 | 推奨される用途 |
| --- | --- | --- |
| AutoID | Zilliz Cloud が、挿入またはインポートされたエンティティに対して一意の識別子を自動生成します。 | ID を手動管理する必要がないほとんどのシナリオ。 |
| Manual ID | データの挿入またはインポート時に、自分で一意の ID を指定します。 | ID を外部システムや既存のデータセットと一致させる必要がある場合。 |

<Admonition type="info" icon="📘" title="メモ">

- どちらのモードを選ぶべきかわからない場合は、より簡単なデータ取り込みと一意性の保証のために、[AutoID から始めてください](./primary-field-auto-id#quickstart-use-autoid)。

- 手動でプライマリキーを設定することに利点がある場合を除き、すべてのケースで `autoId` に依存することを推奨します。

</Admonition>

## クイックスタート: AutoID を使う\{#quickstart-use-autoid}

ID 生成は Zilliz Cloud に自動で任せることができます。

### ステップ 1: AutoID を有効にしてコレクションを作成する\{#step-1-create-a-collection-with-autoid}

プライマリフィールド定義で `auto_id=True` を有効にします。Zilliz Cloud が自動的に ID 生成を処理します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# Define primary field with AutoID enabled
# highlight-start
schema.add_field(
    field_name="id", # Primary field name
    is_primary=True,
    auto_id=True,  # Milvus generates IDs automatically; Defaults to False
    datatype=DataType.INT64
)
# highlight-end

# Define the other fields
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # Vector field
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # Scalar field of the VARCHAR type

# Create the collection
if client.has_collection("demo_autoid"):
    client.drop_collection("demo_autoid")
client.create_collection(collection_name="demo_autoid", schema=schema)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

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
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_autoid")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_autoid")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
});

// Define schema fields
const schema = [
  {
    name: "id",
    description: "Primary field",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: true, // Milvus generates IDs automatically
  },
  {
    name: "embedding",
    description: "Vector field",
    data_type: DataType.FloatVector,
    dim: 4,
  },
  {
    name: "category",
    description: "Scalar field",
    data_type: DataType.VarChar,
    max_length: 1000,
  },
];

// Create the collection
await client.createCollection({
  collection_name: "demo_autoid",
  fields: schema,
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export SCHEMA='{
    "autoID": true,
    "fields": [
        {
            "fieldName": "id",
            "dataType": "Int64",
            "isPrimary": true,
            "elementTypeParams": {}
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"schema\": $SCHEMA
}"
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
schema->AddField({"id", milvus::DataType::INT64, "Primary field", true, true});
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR, "Vector field").WithDimension(4));
schema->AddField(milvus::FieldSchema("category", milvus::DataType::VARCHAR, "Scalar field").WithMaxLength(1000));

status = client->DropCollection(milvus::DropCollectionRequest().WithCollectionName("demo_autoid"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("demo_autoid")
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### ステップ 2: データを挿入する\{#step-2-insert-data}

**重要:** データにプライマリフィールド列を含めないでください。Zilliz Cloud が自動的に ID を生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_autoid", data=data)
print("Generated IDs:", res.get("ids"))

# Output example:
# Generated IDs: [461526052788333649, 461526052788333650]
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_autoid")
        .data(rows)
        .build());
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const res = await client.insert({
    collection_name: "demo_autoid",
    fields_data: data,
});

console.log(res);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export INSERT_DATA='[
    {
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {{{"embedding", std::vector<float>{0.1, 0.2, 0.3, 0.4}}, {"category", "book"}},
                           {{"embedding", std::vector<float>{0.2, 0.3, 0.4, 0.5}}, {"category", "toy"}}};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("demo_autoid")
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto ids = response.Results().IdArray().IntIDArray();
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="メモ">

既存のエンティティを扱う場合は、重複 ID エラーを避けるために `insert()` の代わりに `upsert()` を使用してください。

</Admonition>

## 手動 ID を使う\{#use-manual-ids}

ID を手動で制御する必要がある場合は、AutoID を無効にして自分で値を指定します。

### ステップ 1: AutoID を無効にしてコレクションを作成する\{#step-1-create-a-collection-without-autoid}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# Define the primary field without AutoID
# highlight-start
schema.add_field(
    field_name="product_id",
    is_primary=True,
    auto_id=False,  # You'll provide IDs manually at data ingestion
    datatype=DataType.VARCHAR,
    max_length=100 # Required when datatype is VARCHAR
)
# highlight-end

# Define the other fields
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # Vector field
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # Scalar field of the VARCHAR type

# Create the collection
if client.has_collection("demo_manual_ids"):
    client.drop_collection("demo_manual_ids")
client.create_collection(collection_name="demo_manual_ids", schema=schema)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.VarChar)
        .isPrimaryKey(true)
        .autoID(false)
        .maxLength(100)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  username: "username",
  password: "Aa12345!!",
});

const schema = [
  {
    name: "product_id",
    data_type: DataType.VARCHAR,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: "embedding",
    data_type: DataType.FLOAT_VECTOR,
    dim: 4,
  },
  {
    name: "category",
    data_type: DataType.VARCHAR,
    max_length: 1000,
  },
];

const res = await client.createCollection({
  collection_name: "demo_autoid",
  schema: schema,
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export SCHEMA='{
    "autoID": false,
    "fields": [
        {
            "fieldName": "product_id",
            "dataType": "VarChar",
            "isPrimary": true,
            "elementTypeParams": {
                "max_length": "100"
            }
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"schema\": $SCHEMA
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
schema->AddField(milvus::FieldSchema("product_id", milvus::DataType::VARCHAR, "", true, false).WithMaxLength(100));
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(4));
schema->AddField(milvus::FieldSchema("category", milvus::DataType::VARCHAR).WithMaxLength(1000));

status = client->DropCollection(milvus::DropCollectionRequest().WithCollectionName("demo_manual_ids"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("demo_manual_ids")
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### ステップ2: 独自のIDでデータを挿入する\{#step-2-insert-data-with-your-ids}

すべての挿入操作で、プライマリフィールド列を含める必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Each entity must contain the primary field `product_id`
data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_manual_ids", data=data)
print("Generated IDs:", res.get("ids"))

# Output example:
# Generated IDs: ['PROD-001', 'PROD-002']
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.addProperty("product_id", "PROD-001");
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.addProperty("product_id", "PROD-002");
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_manual_ids")
        .data(rows)
        .build());
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const insert = await client.insert({
    collection_name: "demo_autoid",
    fields_data: data,
});

console.log(insert);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export INSERT_DATA='[
    {
        "product_id": "PROD-001",
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "product_id": "PROD-002",
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

# 插入数据
curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-H "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {{{"product_id", "PROD-001"}, {"embedding", std::vector<float>{0.1, 0.2, 0.3, 0.4}}, {"category", "book"}},
                           {{"product_id", "PROD-002"}, {"embedding", std::vector<float>{0.2, 0.3, 0.4, 0.5}}, {"category", "toy"}}};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("demo_manual_ids")
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto ids = response.Results().IdArray().StrIDArray()
```

</TabItem>
</Tabs>

ユーザーの責任:

- すべてのエンティティで各 ID が一意であることを確認する

- すべての insert/import 操作にプライマリフィールドを含める

- ID の競合と重複検出を自分で処理する


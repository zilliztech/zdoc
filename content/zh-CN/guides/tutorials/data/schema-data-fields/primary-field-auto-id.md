---
title: "主键与 AutoID | Cloud"
slug: /primary-field-auto-id
sidebar_key: primary-field-auto-id
sidebar_label: "主键与 AutoID"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "每个 Zilliz Cloud 的 Collection 都必须定义一个主键（Primary Field），用于唯一标识每个 Entity。 | Cloud"
type: origin
token: HpViwuoOai3L9Ok073tcihMGnIg
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 主键
  - autoid

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 主键与 AutoID

每个 Zilliz Cloud 的 Collection 都必须定义一个主键（Primary Field），用于唯一标识每个 Entity。

该字段确保每个 Entity 都能被明确地插入、更新、查询或删除，而不会产生歧义。

根据使用场景，你可以让 Zilliz Cloud 自动生成 ID（AutoID），也可以手动指定 Entity ID。

## 什么是主键？\{#what-is-a-primary-field}

主键是 Collection 中每个 Entity 的唯一标识符，类似于传统数据库中的主键（Primary Key）。

Zilliz Cloud 通过主键在插入、更新（upsert）、删除和查询操作中管理 Entity。

主要要求：

- 每个 Collection 必须且只能有一个主键。

- 主键的值不能为空。

- 数据类型必须在创建时指定，且创建后不可更改。

## 支持的数据类型\{#supported-data-types}

主键必须使用支持唯一标识 Entity 的标量数据类型。Zilliz Cloud 当前支持以下两种类型，适用于不同场景：

<table>
   <tr>
     <th><p>数据类型</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p><code>INT64</code></p></td>
     <td><p>64 位整型，常与 AutoID 一起使用，是大多数场景的推荐选项。</p></td>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>可变长度字符串类型，适用于 Entity 标识来自外部系统（例如产品编码或用户 ID）的场景。需要通过 <code>max_length</code> 参数定义每个值的最大字节数。</p></td>
   </tr>
</table>

## 选择 AutoID 或手动 ID 模式\{#choose-between-autoid-and-manual-ids}

Zilliz Cloud 支持两种主键分配方式：

<table>
   <tr>
     <th><p>模式</p></th>
     <th><p>描述</p></th>
     <th><p>推荐场景</p></th>
   </tr>
   <tr>
     <td><p>AutoID（默认）</p></td>
     <td><p>系统在插入或导入数据时自动生成唯一标识符。</p></td>
     <td><p>适用于不需要手动管理 ID 的大多数场景。</p></td>
   </tr>
   <tr>
     <td><p>手动 ID</p></td>
     <td><p>用户在插入或导入数据时自行提供唯一 ID。</p></td>
     <td><p>适用于 ID 需要与外部系统或已有数据集保持一致的场景。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

如果不确定选择哪种模式，建议使用 AutoID，它能简化数据写入流程并自动确保全局唯一性。

</Admonition>

## 快速开始：使用 AutoID\{#quickstart-use-autoid}

你可以让 Zilliz Cloud 自动处理 ID 的生成。

### 步骤 1：创建启用 AutoID 的 Collection\{#step-1-create-a-collection-with-autoID}

在主键定义中启用 `auto_id=True`，系统会自动生成 ID。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
-d "{
    \"collectionName\": \"demo_autoid\",
    \"schema\": $SCHEMA
}"
```

</TabItem>
</Tabs>

### 步骤 2：插入数据\{#step-2-insert-data}

**重要提示：** 插入数据时不要包含主键列，系统会自动生成 ID。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
-d "{
    \"collectionName\": \"demo_autoid\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="说明">

当需要更新已存在的 Entity 时，建议使用 `upsert()` 替代 `insert()`，以避免主键重复错误。

</Admonition>

## 使用手动 ID\{#use-manual-ids}

如果你希望完全控制实体 ID，可禁用 AutoID 并手动提供 ID。

### 步骤 1：创建未启用 AutoID 的 Collection\{#step-1-create-a-collection-without-autoID}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"schema\": $SCHEMA
}"
```

</TabItem>
</Tabs>

### 步骤 2：插入带自定义 ID 的数据\{#step-2-insert-data-with-your-ids}

插入数据时必须包含主键。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Each entity must contain the primary field \`product_id\`
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
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>
</Tabs>

需确保：

- 确保所有 Entity ID 全局唯一。

- 每次插入或导入操作都必须包含主键。

- 自行处理 ID 冲突或重复检测。


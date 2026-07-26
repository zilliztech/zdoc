---
title: "向 Collection 添加字段 | BYOC"
slug: /add-fields-to-an-existing-collection
sidebar_label: "向 Collection 添加字段"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Milvus  允许您向现有 Collection 动态地添加新字段，帮助您在业务需求发生变化时轻松地修改 Collection Schema。本教程将通过若干例子为您演示在不同情况下如何为指定 Collection 添加字段。 | BYOC"
type: origin
token: JU6ZwfYLpilJ6vkncdzcLtFLnjf
sidebar_position: 17
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 添加字段

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 向 Collection 添加字段

Milvus  允许您向现有 Collection 动态地添加新字段，帮助您在业务需求发生变化时轻松地修改 Collection Schema。本教程将通过若干例子为您演示在不同情况下如何为指定 Collection 添加字段。

## 注意事项\{#considerations}

在向指定 Collection 添加字段前，请了解如下注意事项：

- 您可以添加标量字段，包括 `INT64`、`VARCHAR`、`FLOAT`、`DOUBLE` 等，但不能新增向量字段。

- 新增字段的 `nullable` 属性必须开启，以便处理 Collection 中已有 Entity 在该字段没有值的情况。

- 向已经加载的 Collection 添加字段，会增加内存占用。

- 每个 Collection 可以容纳的字段数量是有上限的。具体可以参考 [Milvus 限制](https://milvus.io/docs/limitations.md#Number-of-resources-in-a-collection)。

- 新增字段的名称需要在目标 Collection 中保持唯一。

- 您不可以通过增加名为 `$meta` 的字段来开启 Dynamic Field。只有在创建 Collection 时通过 `enable_dynamic_field=True` 创建的 `$meta` 字段才会被当做 Dynamic Field 使用。

## 前提条件\{#prerequisites}

本教程假设您

- 已经运行了一个 Milvus 实例。

- 已经安装了 Milvus SDK。

- 已经创建了一个 Collection。

<Admonition type="info" icon="📘" title="针对上述任务，需要帮助吗？">

<p>请参考<a href="./manage-collections-sdks">创建 Collection</a> 了解如何创建 Collection 及相关基本操作。</p>

</Admonition>

## 基础用法\{#basic-usage}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Connect to your Milvus server
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT"  # Replace with your Milvus server URI
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'localhost:19530'
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
export CLUSTER_ENDPOINT="localhost:19530"
```

</TabItem>
</Tabs>

## 场景 1：快速添加允许为 Null 的字段\{#scenario-1-quickly-add-nullable-fields}

添加允许为 Null 的字段是快速调整 Collection Schema 的手段之一，适用于需要为您的数据快速添加新属性的情况。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add a nullable field to an existing collection
# This operation:
# - Returns almost immediately (non-blocking)
# - Makes the field available for use with minimal delay
# - Sets NULL for all existing entities
client.add_collection_field(
    collection_name="product_catalog",
    field_name="created_timestamp",  # Name of the new field to add
    data_type=DataType.INT64,        # Data type must be a scalar type
    nullable=True                    # Must be True for added fields
    # Allows NULL values for existing entities
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("created_timestamp")
        .dataType(DataType.Int64)
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addCollectionField({
    collection_name: 'product_catalog',
    field: {
        name: 'created_timestamp',
        dataType: 'Int64',
        nullable: true
     }
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
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "product_catalog",
    "schema": {
      "fieldName": "created_timestamp",
      "dataType": "Int64",
      "nullable": true
    }
  }'
```

</TabItem>
</Tabs>

在此场景下，会出现如下情形：

- Collection 中已经存在的 Entity 在新增字段上的取值为 Null。

- 新插入 Entity 在新增字段上的取值可以是 Null 也可以是具体的取值。

- 在因内部同步机制而导致的微小延迟外，新增字段几乎是在添加后立即可见。

- 在因同样的原因而导致的微小延迟外，新增字段几乎是在添加后立即可查。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Example query result
{
    'id': 1, 
    'created_timestamp': None  # New field shows NULL for existing entities
}
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
{
    'id': 1, 
    'created_timestamp': None  # New field shows NULL for existing entities
}
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
{
  "code": 0,
  "data": {},
  "cost": 0
}
```

</TabItem>
</Tabs>

## 场景 2：添加字段时携带默认值\{#scenario-2-add-fields-with-default-values}

如果您需要为 Collection 中已经存在的 Entity 在新增字段上赋予一个有意义的取值，可以考虑在新增字段的同时为其指定默认值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add a field with default value
# This operation:
# - Sets the default value for all existing entities
# - Makes the field available with minimal delay
# - Maintains data consistency with the default value
client.add_collection_field(
    collection_name="product_catalog",
    field_name="priority_level",     # Name of the new field
    data_type=DataType.VARCHAR,      # String type field
    max_length=20,                   # Maximum string length
    nullable=True,                   # Required for added fields
    default_value="standard"         # Value assigned to existing entities
    # Also used for new entities if no value provided
)
```

</TabItem>

<TabItem value='java'>

```java
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("priority_level")
        .dataType(DataType.VarChar)
        .maxLength(20)
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addCollectionField({
    collection_name: 'product_catalog',
    field: {
        name: 'priority_level',
        dataType: 'VarChar',
        nullable: true,
        default_value: 'standard',
     }
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
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "product_catalog",
    "schema": {
      "fieldName": "priority_level",
      "dataType": "VarChar",
      "nullable": true,
      "defaultValue": "standard",
      "elementTypeParams": {
        "max_length": "20"
      }
    }
  }'
```

</TabItem>
</Tabs>

在此场景下，会出现如下情形：

- Collection 中已经存在的 Entity 在新增字段上的取值为该字段的默认值（如示例中的 `standard`）。

- 新插入 Entity 在新增字段上的取值可以是该字段的默认值也可以是其它指定的取值。

- 在因内部同步机制而导致的微小延迟外，新增字段几乎是在添加后立即可见。

- 在因同样的原因而导致的微小延迟外，新增字段几乎是在添加后立即可查。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Example query result
{
    'id': 1,
    'priority_level': 'standard'  # Shows default value for existing entities
}
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
{
    'id': 1,
    'priority_level': 'standard'  # Shows default value for existing entities
}
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
{
    'id': 1,
    'priority_level': 'standard'  # Shows default value for existing entities
}
```

</TabItem>
</Tabs>

## FAQ\{#faq}

### 我可以通过增加一个名为 `$meta` 的字段来启用 Dynamic Field 吗？\{#can-i-enable-dynamic-schema-functionality-by-adding-a-$meta-field}

不行。您不可以通过增加一个名为 `$meta` 的字段来启用 Dynamic Field 功能。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ❌ This is NOT supported
client.add_collection_field(
    collection_name="existing_collection",
    field_name="$meta",
    data_type=DataType.JSON  # This operation will fail
)
```

</TabItem>

<TabItem value='java'>

```java
// ❌ This is NOT supported
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("existing_collection")
        .fieldName("$meta")
        .dataType(DataType.JSON)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// ❌ This is NOT supported
await client.addCollectionField({
    collection_name: 'product_catalog',
    field: {
        name: '$meta',
        dataType: 'JSON',
     }
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
# ❌ This is NOT supported
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "existing_collection",
    "schema": {
      "fieldName": "$meta",
      "dataType": "JSON",
      "nullable": true
    }
  }'
```

</TabItem>
</Tabs>

要为 Collection 启用 Dynamic Field：

- **新建 Collection**：在创建 Collection 时，将 `enable_dynamic_field` 设置为 True。详情参见 [创建 Collection](./manage-collections-sdks#create-schema)。

- **已有 Collection**：将 Collection 级属性 `dynamicfield.enabled` 设置为 True。详情参见[修改 Collection](./modify-collections#example-4-enable-dynamic-field)。

### 如果我添加的新字段名称与 Dynamic Field 中某个键的名称相同，会发生什么？\{#what-happends-when-i-add-a-field-with-the-same-name-as-a-dynamic-field-key}

当您的 Collection 启用了 Dynamic Field 后，这就意味着该 Collection 中有一个名为 `$meta` 的字段。新增字段的名称可以与 `$meta` 字段中的键名相同。但是在查询时指定该字段名称时，新增字段会生效。但是这并不影响 Dynamic Field 中存放的数据。

为了避免数据冲突，建议为新增字段命名时充分考虑现有字段及 Dynamic Field 中各键的名称。

**示例情形：**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Original collection with dynamic field enabled
# Insert data with dynamic field keys
data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "this is a dynamic field key",  # Dynamic field key as string
    "score": 99.5                                 # Another dynamic field key
}]
client.insert(collection_name="product_catalog", data=data)

# Add static field with same name as existing dynamic field key
client.add_collection_field(
    collection_name="product_catalog",
    field_name="extra_info",         # Same name as dynamic field key
    data_type=DataType.INT64,        # Data type can differ from dynamic field key
    nullable=True                    # Must be True for added fields
)

# Insert new data after adding static field
new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # Now must use INT64 type (static field)
    "score": 88.0                    # Still a dynamic field key
}]
client.insert(collection_name="product_catalog", data=new_data)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

Gson gson = new Gson();
JsonObject row = new JsonObject();
row.addProperty("id", 1);
row.add("my_vector", gson.toJsonTree(new float[]{0.1f, 0.2f, ...}));
row.addProperty("extra_info", "this is a dynamic field key");
row.addProperty("score", 99.5);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(row))
        .build());
        
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("extra_info")
        .dataType(DataType.Int64)
        .isNullable(true)
        .build());
        
JsonObject newRow = new JsonObject();
newRow.addProperty("id", 2);
newRow.add("my_vector", gson.toJsonTree(new float[]{0.3f, 0.4f, ...}));
newRow.addProperty("extra_info", 100);
newRow.addProperty("score", 88.0);

insertR = client.insert(InsertReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(newRow))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Original collection with dynamic field enabled
// Insert data with dynamic field keys
const data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "this is a dynamic field key",  // Dynamic field key as string
    "score": 99.5                                 // Another dynamic field key
}]
await client.insert({
    collection_name: "product_catalog", 
    data: data
});

// Add static field with same name as existing dynamic field key
await client.add_collection_field({
    collection_name: "product_catalog",
    field_name: "extra_info",         // Same name as dynamic field key
    data_type: DataType.INT64,        // Data type can differ from dynamic field key
    nullable: true                   // Must be True for added fields
});

// Insert new data after adding static field
const new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # Now must use INT64 type (static field)
    "score": 88.0                    # Still a dynamic field key
}];

await client.insert({
    collection_name:"product_catalog", 
    data: new_data
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
#!/bin/bash

export MILVUS_HOST="localhost:19530"
export AUTH_TOKEN="your_token_here"
export COLLECTION_NAME="product_catalog"

echo "Step 1: Insert initial data with dynamic fields..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/insert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [{
      \"id\": 1,
      \"my_vector\": [0.1, 0.2, 0.3, 0.4, 0.5],
      \"extra_info\": \"this is a dynamic field key\",
      \"score\": 99.5
    }]
  }"

echo -e "\n\nStep 2: Add static field with same name as dynamic field..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"schema\": {
      \"fieldName\": \"extra_info\",
      \"dataType\": \"Int64\",
      \"nullable\": true
    }
  }"

echo -e "\n\nStep 3: Insert new data after adding static field..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/insert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [{
      \"id\": 2,
      \"my_vector\": [0.3, 0.4, 0.5, 0.6, 0.7],
      \"extra_info\": 100,
      \"score\": 88.0
    }]
  }"
```

</TabItem>
</Tabs>

在此场景下，会出现如下情形：

- Collection 中已经存在的 Entity 在新增字段 `extra_info` 上的取值为 `null`。

- 新插入 Entity 在新增字段上的取值的数据类型必须与该字段的数据类型保持一致（`INT64`）。

- Dynamic Field 中原本存在的同名键值对会予以保留，仍可通过 `$meta['extra_info']` 的方式进行访问。

- 在涉及 `extra_info` 字段日常查询时，新增字段的值生效。

**如需同时访问新增字段和动态字段中的同名键值时，可以参考如下示例：**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 1. Query static field only (dynamic field key is masked)
results = client.query(
    collection_name="product_catalog",
    filter="id == 1",
    output_fields=["extra_info"]
)
# Returns: {"id": 1, "extra_info": None}  # NULL for existing entity

# 2. Query both static and original dynamic values
results = client.query(
    collection_name="product_catalog", 
    filter="id == 1",
    output_fields=["extra_info", "$meta['extra_info']"]
)
# Returns: {
#     "id": 1,
#     "extra_info": None,                           # Static field value (NULL)
#     "$meta['extra_info']": "this is a dynamic field key"  # Original dynamic value
# }

# 3. Query new entity with static field value
results = client.query(
    collection_name="product_catalog",
    filter="id == 2", 
    output_fields=["extra_info"]
)
# Returns: {"id": 2, "extra_info": 100}  # Static field value
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Query static field only (dynamic field key is masked)
let results = client.query({
    collection_name: "product_catalog",
    filter: "id == 1",
    output_fields: ["extra_info"]
})
// Returns: {"id": 1, "extra_info": None}  # NULL for existing entity

// 2. Query both static and original dynamic values
results = client.query({
    collection_name:"product_catalog", 
    filter: "id == 1",
    output_fields: ["extra_info", "$meta['extra_info']"]
});
// Returns: {
//     "id": 1,
//     "extra_info": None,                           # Static field value (NULL)
//     "$meta['extra_info']": "this is a dynamic field key"  # Original dynamic value
// }

// 3. Query new entity with static field value
results = client.query({
    collection_name: "product_catalog",
    filter: "id == 2", 
    output_fields: ["extra_info"]
})
// Returns: {"id": 2, "extra_info": 100}  # Static field value
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
#!/bin/bash

export MILVUS_HOST="localhost:19530"
export AUTH_TOKEN="your_token_here"
export COLLECTION_NAME="product_catalog"

echo "Query 1: Static field only (dynamic field masked)..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\"]
  }"

echo -e "\n\nQuery 2: Both static and original dynamic values..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\", \"\$meta['extra_info']\"]
  }"

echo -e "\n\nQuery 3: New entity with static field value..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 2\",
    \"outputFields\": [\"extra_info\"]
  }"
```

</TabItem>
</Tabs>

### 新增字段在添加后需要多长时间才可以使用\{#how-long-does-it-take-for-a-new-field-to-become-available}

新增字段几乎会立即生效。但由于内部架构变更需要在 Milvus 集群中广播，可能会有短暂延迟。这种同步机制确保所有节点在处理涉及新字段的查询之前，都能知晓架构更新。
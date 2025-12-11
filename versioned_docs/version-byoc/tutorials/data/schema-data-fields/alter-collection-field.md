---
title: "Alter Collection Field | BYOC"
slug: /alter-collection-field
sidebar_label: "Alter Collection Field"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can alter the properties of a collection field to change column constraints or enforce stricter data integrity rules. | BYOC"
type: origin
token: PLjFwlcT8ilFBakYXyfcg6S2n7d
sidebar_position: 16
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - field properties
  - alter collection field
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Alter Collection Field

You can alter the properties of a collection field to change column constraints or enforce stricter data integrity rules. 

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Each collection consists of only one primary field. Once set during collection creation, you cannot change the primary field or alter its properties.</p></li>
<li><p>Each collection can have only one partition key. Once set during collection creation, you cannot change the partition key.</p></li>
</ul>

</Admonition>

## Alter VarChar field\{#alter-varchar-field}

A VarChar field has a property named `max_length`, which constrains the maximum number of characters the field values can contain. You can change the `max_length` property.

The following example assumes the collection has a VarChar field named `varchar` and sets its `max_length` property.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.alter_collection_field(
    collection_name="my_collection",
    field_name="varchar",
    field_params={
        "max_length": 1024
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.service.collection.request.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("varchar")
        .property("max_length", "1024")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionFieldProperties({
  collection_name: LOAD_COLLECTION_NAME,
  field_name: 'varchar',
  properties: { max_length: 1024 },
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/v2/common"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption(
    "my_collection", "varchar").WithProperty(common.MaxLengthKey, 1024))
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
--url "${CLUSTER_ENDPOINT}/v2/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
    "collectionName": "my_collection",
    "field_name": "varchar",
    "properties": {
        "max_length": "1024"
    }
}"
```

</TabItem>
</Tabs>

## Alter ARRAY field\{#alter-array-field}

An array field has two properties, namely `element_type` and `max_capacity`. The former determines the data type of the elements in an array, while the latter constrains the maximum number of elements in the array. You can change the `max_capacity` property only.

The following example assumes the collection has an array field named `array` and sets its `max_capacity` property.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_field(
    collection_name="my_collection",
    field_name="array",
    field_params={
        "max_capacity": 64
    }
)
```

</TabItem>

<TabItem value='java'>

```java
client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("array")
        .property("max_capacity", "64")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionFieldProperties({
  collection_name: "my_collection",
  field_name: 'array',
  properties: { 
      max_capacity: 64 
  }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption(
    "my_collection", "array").WithProperty(common.MaxCapacityKey, 64))
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
--url "${CLUSTER_ENDPOINT}/v2/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
    "collectionName": "my_collection",
    "field_name": "array",
    "properties": {
        "max_capacity": "64"
    }
}"
```

</TabItem>
</Tabs>

## Alter field-level mmap settings\{#alter-field-level-mmap-settings}

Memory mapping (Mmap) enables direct memory access to large files on disk, allowing Zilliz Cloud to store indexes and data in both memory and hard drives. This approach helps optimize data placement policy based on access frequency, expanding storage capacity for collections without impacting search performance.

The following example assumes the collection has a field named `doc_chunk` and sets its `mmap_enabled` property.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_field(
    collection="my_collection",
    field_name="doc_chunk",
    properties={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("doc_chunk")
        .property("mmap.enabled", "True")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
  collection_name: "my_collection",
  field_name: 'doc_chunk',
  properties: { 
      'mmap.enabled': true, 
  }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption(
    "my_collection", "doc_chunk").WithProperty(common.MmapEnabledKey, true))
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
--url "${CLUSTER_ENDPOINT}/v2/collections/fields/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
    "collectionName": "my_collection",
    "field_name": "doc_chunk",
    "properties": {
        "mmap.enabled": True
    }
}"
```

</TabItem>
</Tabs>


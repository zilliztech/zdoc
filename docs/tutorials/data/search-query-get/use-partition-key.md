---
title: "Use Partition Key | Cloud"
slug: /use-partition-key
sidebar_label: "Use Partition Key"
beta: FALSE
notebook: FALSE
description: "The Partition Key is a search optimization solution based on partitions. By designating a specific scalar field as the Partition Key and specifying filtering conditions based on the Partition Key during the search, the search scope can be narrowed down to several partitions, thereby improving search efficiency. This article will introduce how to use the Partition Key and related considerations. | Cloud"
type: origin
token: QWqiwrgJViA5AJkv64VcgQX2nKd
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search optimization
  - partition key
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Partition Key

The Partition Key is a search optimization solution based on partitions. By designating a specific scalar field as the Partition Key and specifying filtering conditions based on the Partition Key during the search, the search scope can be narrowed down to several partitions, thereby improving search efficiency. This article will introduce how to use the Partition Key and related considerations.

## Overview{#overview}

In Zilliz Cloud, you can use partitions to implement data segregation and improve search performance by restricting the search scope to specific partitions. If you choose to manage partitions manually, you can create a maximum of 1,024 partitions in a collection, and insert entities into these partitions based on a specific rule so that you can narrow the search scope by restricting searches within a specific number of partitions.

Zilliz Cloud introduces the Partition Key for you to reuse partitions in data segregation to overcome the limit on the number of partitions you can create in a collection. When creating a collection, you can use a scalar field as the Partition Key. Once the collection is ready, Zilliz Cloud creates the specified number of partitions inside the collection. Upon receiving an inserted entity, Zilliz Cloud calculates a hash value using the Partition Key value of the entity, executes a modulo operation based on the hash value and the `partitions_num` property of the collection to obtain the target partition ID, and stores the entity in the target partition.

![IXXIwZdOYhRFXmbTMdwcaN6fnPe](/img/IXXIwZdOYhRFXmbTMdwcaN6fnPe.png)

The following figure illustrates how Zilliz Cloud processes the search requests in a collection with or without the Partition Key feature enabled. 

- If the Partition Key is disabled, Zilliz Cloud searches for entities that are the most similar to the query vector within the collection. You can narrow the search scope if you know which partition contains the most relevant results.

- If the Partition Key is enabled, Zilliz Cloud determines the search scope based on the Partition Key value specified in a search filter and scans only the entities within the partitions that match.

![RTaqwdaWXhRWPTb4uJTc9Uknn5c](/img/RTaqwdaWXhRWPTb4uJTc9Uknn5c.png)

## Use Partition Key{#use-partition-key}

To use the Partition Key, you need to

- Set the Partition Key,

- Set the number of partitions to create (Optional), and

- Create a filtering condition based on the Partition Key.

### Set Partition Key{#set-partition-key}

To designate a scalar field as the Partition Key, you need to set its `is_partition_key` attribute to `true` when you add the scalar field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient, DataType
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

# Add the partition key
schema.add_field(
    field_name="my_varchar", 
    datatype=DataType.VARCHAR, 
    max_length=512,
    # highlight-next-line
    is_partition_key=True,
)
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
        .token("YOUR_CLUSTER_TOKEN")
        .build());

// Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();

// Add the partition key
schema.addField(AddFieldReq.builder()
        .fieldName("my_varchar")
        .dataType(DataType.VarChar)
        .maxLength(512)
        // highlight-next-line
        .isPartitionKey(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 3. Create a collection in customized setup mode
// 3.1 Define fields
const fields = [
    {
        name: "my_varchar",
        data_type: DataType.VarChar,
        max_length: 512,
        // highlight-next-line
        is_partition_key: true
    }
]
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "my_id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "my_vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            },
            {
                "fieldName": "my_varchar",
                "dataType": "VarChar",
                "isPartitionKey": true,
                "elementTypeParams": {
                    "max_length": 512
                }
            }
        ]
    }'
```

</TabItem>
</Tabs>

### Set Partition Numbers{#set-partition-numbers}

When you designate a scalar field in a collection as the Partition Key, Zilliz Cloud automatically creates 16 partitions in the collection. Upon receiving an entity, Zilliz Cloud chooses a partition based on the Partition Key value of this entity and stores the entity in the partition, resulting in some or all partitions holding entities with different Partition Key values. 

You can also determine the number of partitions to create along with the collection. This is valid only if you have a scalar field designated as the Partition Key.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    num_partitions=1024
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
                .collectionName("my_collection")
                .collectionSchema(schema)
                .numPartitions(1024)
                .build();
        client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    num_partitions: 1024
})
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "partitionsNum": 1024
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"myCollection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### Create Filtering Condition{#create-filtering-condition}

When conducting ANN searches in a collection with the Partition Key feature enabled, you need to include a filtering expression involving the Partition Key in the search request. In the filtering expression, you can restrict the Partition Key value within a specific range so that Zilliz Cloud restricts the search scope within the corresponding partitions. 

When performing delete operations, It is advisable to include a filter expression that specifies a single partition key to achieve more efficient deletion. This approach limits the delete operation to a particular partition, reducing write amplification during compaction and conserving resources for compaction and indexing.

The following examples demonstrate Partition-Key-based filtering based on a specific Partition Key value and a set of Partition Key values.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter based on a single partition key value, or
filter='partition_key == "x" && <other conditions>'

# Filter based on multiple partition key values
filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='java'>

```java
// Filter based on a single partition key value, or
String filter = "partition_key == 'x' && <other conditions>";

// Filter based on multiple partition key values
String filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Filter based on a single partition key value, or
const filter = 'partition_key == "x" && <other conditions>'

// Filter based on multiple partition key values
const filter = 'partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='bash'>

```bash
# Filter based on a single partition key value, or
export filter='partition_key == "x" && <other conditions>'

# Filter based on multiple partition key values
export filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>You have to replace <code>partition_key</code> with the name of the field that is designated as the partition key.</p>

</Admonition>

## Use Partition Key Isolation{#use-partition-key-isolation}

In the multi-tenancy scenario, you can designate the scalar field related to tenant identities as the partition key and create a filter based on a specific value in this scalar field. To further improve search performance in similar scenarios, Zilliz Cloud introduces the Partition Key Isolation feature.

![BVotwv5BvhBWXXbvotUccowZnng](/img/BVotwv5BvhBWXXbvotUccowZnng.png)

As shown in the above figure, Zilliz Cloud groups entities based on the Partition Key value and creates a separate index for each of these groups. Upon receiving a search request, Zilliz Cloud locates the index based on the Partition Key value specified in the filtering condition and restricts the search scope within the entities included in the index, thus avoiding scanning irrelevant entities during the search and greatly enhancing the search performance.

Once you have enabled Partition Key Isolation, you can include only a specific value in the Partition-key-based filter so that Zilliz Cloud can restrict the search scope within the entities included in the index that match.

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, the Partition-Key Isolation feature applies only to <strong>Performance-optimized</strong> clusters.</p>

</Admonition>

### Enable Partition Key Isolation{#enable-partition-key-isolation}

The following code examples demonstrate how to enable Partition Key Isolation.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    properties={"partitionkey.isolation": True}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

Map<String, String> properties = new HashMap<>();
properties.put("partitionkey.isolation", "true");

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .numPartitions(1024)
        .properties(properties)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.alterCollection({
    collection_name: "my_collection",
    properties: {
        "partitionkey.isolation": true
    }
})
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "partitionKeyIsolation": true
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"myCollection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

Once you have enabled Partition Key Isolation, you can still set the Partition Key and number of partitions as described in [Set Partition Numbers](./use-partition-key#set-partition-numbers). Note that the Partition-Key-based filter should include only a specific Partition Key value.
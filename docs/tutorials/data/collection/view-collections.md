---
title: "View Collections | Cloud"
slug: /view-collections
sidebar_label: "View Collections"
beta: FALSE
notebook: FALSE
description: "You can obtain the name list of all the collections in the currently connected database, and check the details of a specific collection. | Cloud"
type: origin
token: VAirw0c7ZiKCSqkjtDscAsC4nAf
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - view collections
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# View Collections

You can obtain the name list of all the collections in the currently connected database, and check the details of a specific collection.

## List Collections{#list-collections}

The following example demonstrates how to obtain the name list of all collections in the currently connected database.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.list_collections()

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

ListCollectionsResp resp = client.listCollections();
System.out.println(resp.getCollectionNames());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN'
});

const collections = await client.listCollections();
console.log(collections);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
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
    // handle err
}
defer client.Close(ctx)

collectionNames, err := client.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(collectionNames)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

If you have already created a collection named `quick_setup`, the result of the above example should be similar to the following.

```json
["quick_setup"]
```

## Describe Collection{#describe-collection}

You can also obtain the details of a specific collection. The following example assumes that you have already created a collection named quick_setup.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.describe_collection(
    collection_name="quick_setup"
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

DescribeCollectionReq request = DescribeCollectionReq.builder()
        .collectionName("quick_setup")
        .build();
DescribeCollectionResp resp = client.describeCollection(request);
System.out.println(resp);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.describeCollection({
    collection_name: "quick_setup"
});

console.log(res);
```

</TabItem>

<TabItem value='go'>

```go
collection, err := client.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}

fmt.Println(collection)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup"
}'
```

</TabItem>
</Tabs>

The result of the above example should be similar to the following.

```plaintext
{
    'collection_name': 'quick_setup', 
    'auto_id': False, 
    'num_shards': 1, 
    'description': '', 
    'fields': [
        {
            'field_id': 100, 
            'name': 'id', 
            'description': '', 
            'type': <DataType.INT64: 5>, 
            'params': {}, 
            'is_primary': True
        }, 
        {
            'field_id': 101, 
            'name': 'vector', 
            'description': '', 
            'type': <DataType.FLOAT_VECTOR: 101>, 
            'params': {'dim': 768}
        }
    ], 
    'functions': [], 
    'aliases': [], 
    'collection_id': 456909630285026300, 
    'consistency_level': 2, 
    'properties': {}, 
    'num_partitions': 1, 
    'enable_dynamic_field': True
}
```


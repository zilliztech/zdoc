---
title: "Modify Collection | Cloud"
slug: /modify-collections
sidebar_label: "Modify Collection"
beta: FALSE
notebook: FALSE
description: "You can rename a collection or change its settings. This page focuses on how to modify a collection. | Cloud"
type: origin
token: WMh8w3tbKiBhukk3ICMc4ctznEg
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - modify collections
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Modify Collection

You can rename a collection or change its settings. This page focuses on how to modify a collection.

## Rename Collection{#rename-collection}

You can rename a collection as follows.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.rename_collection(
    old_name="my_collection",
    new_name="my_new_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.RenameCollectionReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();
    
MilvusClientV2 client = new MilvusClientV2(connectConfig);

RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("my_collection")
        .newCollectionName("my_new_collection")
        .build();

client.renameCollection(renameCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const res = await client.renameCollection({
    oldName: "my_collection",
    newName: "my_new_collection"
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/rename" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "newCollectionName": "my_new_collection"
}'
```

</TabItem>
</Tabs>

## Set Collection Properties{#set-collection-properties}

The following code snippet demonstrates how to set collection TTL. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 60}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.AlterCollectionReq;
import java.util.HashMap;
import java.util.Map;

Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "60");

AlterCollectionReq alterCollectionReq = AlterCollectionReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build();

client.alterCollection(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.alterCollection({
    collection_name: "my_collection",
    properties: {
        "collection.ttl.seconds": 60
    }
})
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/common"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.AlterCollection(ctx, milvusclient.NewAlterCollectionOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# REST
```

</TabItem>
</Tabs>

The applicable collection properties are as follows:

<table>
   <tr>
     <th><p>Property</p></th>
     <th><p>When to Use</p></th>
   </tr>
   <tr>
     <td><p><code>collection.ttl.seconds</code></p></td>
     <td><p>If the data of a collection needs to be deleted after a specific period, consider setting its Time-To-Live (TTL) in seconds. Once the TTL times out, Zilliz Cloud deletes all entities from the collection. </p><p>The deletion is asynchronous, indicating that searches and queries are still possible before the deletion is complete.</p></td>
   </tr>
   <tr>
     <td><p><code>mmap.enabled</code></p></td>
     <td><p>Memory mapping (Mmap) enables direct memory access to large files on disk, allowing Zilliz Cloud to store indexes and data in both memory and hard drives. This approach helps optimize data placement policy based on access frequency, expanding storage capacity for collections without impacting search performance.</p><p></p><p>Zilliz Cloud implements <a href="./use-mmap#global-mmap-strategy">global mmap settings</a> for your clusters. You can change the settings on a specific field or its index.</p><p></p></td>
   </tr>
</table>


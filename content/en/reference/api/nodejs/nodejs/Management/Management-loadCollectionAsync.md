---
title: "loadCollectionAsync() | Node.js"
slug: /node/node/Management-loadCollectionAsync
sidebar_label: "loadCollectionAsync()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation loads collection data into query nodes, then you can do vector search on this collection. This is an async function — use `getLoadState()` or `getLoadingProgress()` to check loading status. | Node.js"
type: docx
token: SqSZdmSoVoBuiSxe1a1cdOuZnDd
sidebar_position: 30
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollectionAsync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadCollectionAsync()

This operation loads collection data into query nodes, then you can do vector search on this collection. This is an async function — use `getLoadState()` or `getLoadingProgress()` to check loading status.

```javascript
await milvusClient.loadCollectionAsync(data: LoadCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.loadCollectionAsync({
    collection_name: string,
    db_name?: string,
    replica_number?: number,
    resource_groups?: string[],
    refresh?: boolean,
    load_fields?: string[],
    skip_load_dynamic_field?: boolean,
    timeout?: number,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection to load.

- **db_name** (*string*) -

    The name of the database. Optional.

- **replica_number** (*number*) -

    The number of replicas to load. Optional.

- **resource_groups** (*string[]*) -

    Resource group names for load balancing. Optional.

- **refresh** (*boolean*) -

    Whether to refresh loading to include new fields. Optional.

- **load_fields** (*string[]*) -

    Specific field names to load. Optional.

- **skip_load_dynamic_field** (*boolean*) -

    Whether to skip loading the dynamic field. Optional.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS:**

*Promise\<ResStatus\>*

**EXCEPTIONS:**

- **MilvusError**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.loadCollectionAsync({
    collection_name: 'my_collection',
});

// Check loading progress
const state = await client.getLoadState({
    collection_name: 'my_collection',
});
```

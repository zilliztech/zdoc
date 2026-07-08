---
title: "flushAll() | Node.js"
slug: /node/node/Management-flushAll
sidebar_label: "flushAll()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation flushes all collections, sealing all segments and persisting data on disk. | Node.js"
type: docx
token: Zyi9dGUnQodt7MxIq17cyN54nOd
sidebar_position: 22
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - flushAll()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushAll()

This operation flushes all collections, sealing all segments and persisting data on disk.

```typescript
await milvusClient.flushAll(data?: FlushAllReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.flushAll({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS** *Promise&lt;FlushAllResponse&gt;*

This method returns a promise that resolves to a **FlushAllResponse** object.

```typescript
{
    flush_all_ts: number,
    flush_all_tss: Record<string, number>,
    flush_all_msgs: Record<string, any>,
    cluster_info: FlushClusterInfo,
    status:  ResStatus
}
```

**PARAMETERS:**

- **flush_all_ts** (*number*) -
A single hybrid timestamp identifying the flush. Deprecated; prefer **flush_all_tss** for multi-cluster deployments.

- **flush_all_tss** (*Record&lt;string, number&gt;*) -
A mapping from cluster ID to the hybrid timestamp at which the flush completed in that cluster.

- **flush_all_msgs** (*Record&lt;string, any&gt;*) -
A mapping from physical channel name to flush metadata used by the storage layer.

- **cluster_info** (*FlushClusterInfo*) -
The cluster topology that participated in the flush.

    - **cluster_id** (*string*) -

        The cluster identifier.

    - **cchannel** (*string*) -

        The control channel name.

    - **pchannels** (*string[]*) -

        The physical channels covered by the flush.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAll();
```

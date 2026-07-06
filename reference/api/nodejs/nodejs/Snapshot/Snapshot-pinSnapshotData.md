---
title: "pinSnapshotData() | Node.js"
slug: /node/node/Snapshot-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation pins snapshot data to prevent it from being garbage collected. Use this to ensure a snapshot remains available for restoration. | Node.js"
type: docx
token: Bx6FdwVlUoqZjVxZwSFcnUr2nDe
sidebar_position: 7
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - pinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

This operation pins snapshot data to prevent it from being garbage collected. Use this to ensure a snapshot remains available for restoration.

```typescript
await milvusClient.pinSnapshotData(data: PinSnapshotDataReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.pinSnapshotData({
    collection_name: string,
    snapshot_name: string,
    ttl_seconds?: number | string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -
**[REQUIRED]**
The name of the collection the snapshot belongs to.

- **snapshot_name** (*string*) -
**[REQUIRED]**
The name of the snapshot to pin.

- **ttl_seconds** (*number | string*) -
Optional pin TTL in seconds. If not specified, the snapshot will be pinned indefinitely.

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS** *Promise&lt;PinSnapshotDataResponse&gt;*

This method returns a promise that resolves to a **PinSnapshotDataResponse** object.

```typescript
{
    pin_id: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **pin_id** (*string*) -
The identifier of the pin lease. Pass this value to `unpinSnapshotData()` to release the pin before its TTL expires.

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

const res = await client.pinSnapshotData({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```

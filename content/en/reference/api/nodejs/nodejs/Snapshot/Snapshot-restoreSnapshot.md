---
title: "restoreSnapshot() | Node.js"
slug: /node/node/Snapshot-restoreSnapshot
sidebar_label: "restoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation restores a collection from a snapshot to a new or existing collection. | Node.js"
type: docx
token: PpuUdB9bLoL1UUxfIH4cxXkXnSb
sidebar_position: 8
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - restoreSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# restoreSnapshot()

This operation restores a collection from a snapshot to a new or existing collection.

```typescript
await milvusClient.restoreSnapshot(data: RestoreSnapshotReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.restoreSnapshot({
    snapshot_name: string,
    source_collection_name: string,
    target_collection_name: string,
    source_db_name?: string,
    target_db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **snapshot_name** (*string*) -
**[REQUIRED]**
The name of the snapshot to restore from.

- **source_collection_name** (*string*) -
**[REQUIRED]**
The name of the source collection.

- **target_collection_name** (*string*) -
**[REQUIRED]**
The name of the target collection to restore to.

- **source_db_name** (*string*) -
The source database name. Optional.

- **target_db_name** (*string*) -
The target database name. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS** *Promise&lt;RestoreSnapshotResponse&gt;*

This method returns a promise that resolves to a **RestoreSnapshotResponse** object.

```typescript
{
    job_id: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **job_id** (*string*) -
The identifier of the asynchronous restore job. Pass this value to `getRestoreSnapshotState()` to poll for completion.

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

const res = await client.restoreSnapshot({
    snapshot_name: 'snapshot_2024_01',
    source_collection_name: 'my_collection',
    target_collection_name: 'restored_collection',
});
```

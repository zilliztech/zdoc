---
title: "listRestoreSnapshotJobs() | Node.js"
slug: /node/node/Snapshot-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all snapshot restore jobs. You can filter by target collection name and database name. | Node.js"
type: docx
token: TIXDdW1BmoPA3FxX0ONczHFqnKf
sidebar_position: 5
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - listRestoreSnapshotJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listRestoreSnapshotJobs()

This operation lists all snapshot restore jobs. You can filter by target collection name and database name.

```typescript
await milvusClient.listRestoreSnapshotJobs(data?: ListRestoreSnapshotJobsReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.listRestoreSnapshotJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -
Optional filter by target collection name.

- **db_name** (*string*) -
Optional filter by database name.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS** *Promise&lt;ListRestoreSnapshotJobsResponse&gt;*

This method returns a promise that resolves to a **ListRestoreSnapshotJobsResponse** object.

```typescript
{
    jobs: RestoreSnapshotJobInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **jobs** (*RestoreSnapshotJobInfo[]*) -
A list of restore jobs that match the requested database and collection filters. For the full **RestoreSnapshotJobInfo** field reference, refer to the `getRestoreSnapshotState()` doc.

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

const res = await client.listRestoreSnapshotJobs({
    collection_name: 'restored_collection',
});
```

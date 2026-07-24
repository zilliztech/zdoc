---
title: "getImportState() | Node.js"
slug: /node/node/DataImport-getImportState
sidebar_label: "getImportState()"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves the current state and metadata of a specific import task. Use this to poll for completion after calling `bulkInsert()`. | Node.js"
type: docx
token: DJ4NdIIQ4oeA7gx4bDQcxT3gn0c
sidebar_position: 17
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - getImportState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getImportState()

This operation retrieves the current state and metadata of a specific import task. Use this to poll for completion after calling `bulkInsert()`.

```typescript
await milvusClient.getImportState(data)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.getImportState({
    task: number,
    timeout?: number
})
```

**PARAMETERS:**

- **task** (*number*) -

    **[REQUIRED]** The ID of the import task returned by `bulkInsert()`.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC.

**RETURNS** *Promise&lt;GetImportStateResponse&gt;*

This method returns a promise that resolves to a **GetImportStateResponse** object.

```typescript
{
    state: ImportState,
    row_count: number,
    id_list: number[],
    infos: KeyValuePair[],
    id: number,
    collection_id: number,
    segment_ids: number[],
    create_ts: number,
    status: ResStatus
}
```

**PARAMETERS:**

- **state** (*ImportState*) -

    The current state of the import task. Possible values include **ImportPending**, **ImportStarted**, **ImportPersisted**, **ImportCompleted**, **ImportFailed**, and **ImportFailedAndCleaned**.

- **row_count** (*number*) -

    The number of rows that have been imported or parsed.

- **id_list** (*number[]*) -

    A list of auto-generated IDs if the primary key uses autoID.

- **infos** (*KeyValuePair[]*) -

    Additional information about the import task, such as progress, file path, or failure reason.

- **id** (*number*) -

    The ID of the import task.

- **collection_id** (*number*) -

    The collection ID associated with the import task.

- **segment_ids** (*number[]*) -

    Segment IDs created by the import task.

- **create_ts** (*number*) -

    The timestamp when the import task was created.

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
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.getImportState({ task: 123456 });
```

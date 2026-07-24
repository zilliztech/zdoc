---
title: "flushSync() | Node.js"
slug: /node/node/Management-flushSync
sidebar_label: "flushSync()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation manually seals a segment and persists the data on disk. It is recommended that this operation be called after all the data has been inserted into a collection. This is the synchronous function that ensures the flush operation is complete before the function returns. | Node.js"
type: docx
token: QsTwdUbgyoZPV1xzCBxchX8Fnid
sidebar_position: 8
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - flushSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushSync()

This operation manually seals a segment and persists the data on disk. It is recommended that this operation be called after all the data has been inserted into a collection. This is the synchronous function that ensures the flush operation is complete before the function returns.

```javascript
await milvusClient.flushSync(data)
```

<Admonition type="info" icon="📘" title="Notes">

Milvus automatically flushes data into persistent storage at intervals. You are advised to rely on this automatic data persistence mechnism.

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.flushSync({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the target database to which the target collections belong.

- **collection_names** (*string[]*) -

    **[REQUIRED]**

    A list of the target collection names.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;GetFlushStateResponse&gt;*

This method returns a promise that resolves to a **GetFlushStateResponse** object.

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **flushed** (*boolean*) -
Whether all targeted segments are flushed to persistent storage. Because `flushSync()` blocks until the flush completes, this value is **true** on success.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const flushSyncStatus = await milvusClient.flushSync({
    collection_names: ['my_collection'],
});
```


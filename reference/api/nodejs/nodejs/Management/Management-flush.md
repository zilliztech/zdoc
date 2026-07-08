---
title: "flush() | Node.js"
slug: /node/node/Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation manually seals a segment and persists the data on disk. It is recommended that this operation be called after all the data has been inserted into a collection. | Node.js"
type: docx
token: E2XJd4ZHvoc7QlxyrEJcrOJOn9f
sidebar_position: 7
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flush()

This operation manually seals a segment and persists the data on disk. It is recommended that this operation be called after all the data has been inserted into a collection.

```javascript
await milvusClient.flush(data)
```

<Admonition type="info" icon="📘" title="Notes">

Milvus automatically flushes data into persistent storage at intervals. You are advised to rely on this automatic data persistence mechnism.

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.flush({
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

**RETURNS** *Promise&lt;FlushResult&gt;*

This method returns a promise that resolves to a **FlushResult** object.

```typescript
{
    coll_segIDs: Record<string, { data: number[] }>,
    status:  ResStatus
}
```

**PARAMETERS:**

- **coll_segIDs** (*Record&lt;string, \{ data: number[] }&gt;*) -
A mapping from collection name to the segment IDs that were sealed by this flush. Use the returned IDs with `getFlushState()` to confirm persistence.

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
const flushStatus = await milvusClient.flush({
    collection_names: ['my_collection'],
});
```


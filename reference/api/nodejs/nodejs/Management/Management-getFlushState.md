---
title: "getFlushState() | Node.js"
slug: /node/node/Management-getFlushState
sidebar_label: "getFlushState()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the flush status of a specific segment. | Node.js"
type: docx
token: X8qWdMHg5oQQK6xZdBYcGNOnn3c
sidebar_position: 10
keywords: 
  - Unstructured Data
  - vector database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushState()
  - nodejs26
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getFlushState()

This operation returns the flush status of a specific segment.

```javascript
getFlushState(data): Promise<GetFlushStateResponse>
```

<Admonition type="info" icon="📘" title="Notes">

<p>Milvus automatically flushes data into persistent storage at intervals. You are advised to rely on this automatic data persistence mechnism.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
milvusClient.getFlushState({
    segment_ids: number[],
    timeout?: number
})
```

**PARAMETERS:**

- **segment_ids** (*number[]*) -

    **[REQUIRED]**

    A list of the target segment IDs.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<GetFlushStateResponse>*

This method returns a promise that resolves to a **GetFlushStateResponse** object.

```javascript
{
    flushed: boolean,
    status: {
        code: number,
        error_code: string | number,
        reason: string
    }
}
```

**PARAMETERS:**

- **flushed** (*boolean*) -

    Whether data in the specified segment is persisted into storage.

- **status** (*ResStatus*) - 

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const flushState = await milvusClient.getFlushState({
    segmentIDs: [1,2,3,4],
});
```


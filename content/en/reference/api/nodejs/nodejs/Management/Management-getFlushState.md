---
title: "getFlushState() | Node.js"
slug: /node/node/Management-getFlushState
sidebar_label: "getFlushState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the flush status of a specific segment. | Node.js"
type: docx
token: X8qWdMHg5oQQK6xZdBYcGNOnn3c
sidebar_position: 10
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushState()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# getFlushState()

This operation returns the flush status of a specific segment.

```javascript
await milvusClient.getFlushState(data)
```

<Admonition type="info" icon="📘" title="Notes">

Milvus automatically flushes data into persistent storage at intervals. You are advised to rely on this automatic data persistence mechnism.

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getFlushState({
    segmentIDs?: number[],
    flush_ts?: number,
    db_name?: string,
    collection_name?: string,
    timeout?: number
})
```

**PARAMETERS:**

- **segmentIDs** (*number[]*) -

    A list of the target segment IDs.

- **flush_ts** (*number*) -

    The flush timestamp to check against.

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    The name of the collection whose flush state to check. Provide at least one of **segmentIDs**, **flush_ts**, or **collection_name**.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS:**

*Promise&lt;GetFlushStateResponse&gt;*

This method returns a promise that resolves to a **GetFlushStateResponse** object.

```javascript
{
    flushed: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **flushed** (*boolean*) -
Whether all targeted segments are flushed to persistent storage. It is **true** when every requested segment ID is sealed and persisted, otherwise **false**.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const flushState = await milvusClient.getFlushState({
    segmentIDs: [1,2,3,4],
});
```


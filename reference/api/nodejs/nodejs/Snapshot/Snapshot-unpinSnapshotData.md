---
title: "unpinSnapshotData() | Node.js"
slug: /node/node/Snapshot-unpinSnapshotData
sidebar_label: "unpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation unpins snapshot data, allowing it to be garbage collected when no longer needed. | Node.js"
type: docx
token: IjXedJe6poxhmAx6hFpcpNyJnsb
sidebar_position: 9
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - unpinSnapshotData()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# unpinSnapshotData()

This operation unpins snapshot data, allowing it to be garbage collected when no longer needed.

```typescript
await milvusClient.unpinSnapshotData(data: UnpinSnapshotDataReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.unpinSnapshotData({
    pin_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **pin_id** (*number | string*) -
**[REQUIRED]**
The pin ID returned by pinSnapshotData().

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS:**

*Promise&lt;ResStatus&gt;*

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

const res = await client.unpinSnapshotData({
    pin_id: 'pin_12345',
});
```

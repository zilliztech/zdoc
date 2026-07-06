---
title: "getFlushAllState() | Node.js"
slug: /node/node/Management-getFlushAllState
sidebar_label: "getFlushAllState()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks whether a flush-all operation has completed. | Node.js"
type: docx
token: WgfTdXbMmoFhO9xBpencxLRRnbb
sidebar_position: 25
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushAllState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getFlushAllState()

This operation checks whether a flush-all operation has completed.

```typescript
await milvusClient.getFlushAllState(data: GetFlushAllStateReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.getFlushAllState({
    flush_all_ts?: number,
    flush_all_tss?: Record\<string, number\>,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **flush_all_ts** (*number*) -
The flush-all timestamp. Optional and deprecated.

- **flush_all_tss** (*Record&lt;string, number&gt;*) -
A map of database names to flush-all timestamps. Optional.

- **db_name** (*string*) -
The name of the database. Optional and deprecated.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS:**

*Promise\<GetFlushAllStateResponse\>*

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

const res = await client.getFlushAllState({
    flush_all_tss: { db1: 123456789 },
});
```

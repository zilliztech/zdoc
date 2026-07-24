---
title: "flushAllSync() | Node.js"
slug: /node/node/Management-flushAllSync
sidebar_label: "flushAllSync()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation flushes all collections and waits until the flush operation is completed. It internally calls flushAll followed by polling getFlushAllState until the flush is complete. | Node.js"
type: docx
token: HoRIdZtHjosja7xOdNPc8CConrb
sidebar_position: 23
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - flushAllSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushAllSync()

This operation flushes all collections and waits until the flush operation is completed. It internally calls flushAll followed by polling getFlushAllState until the flush is complete.

```typescript
await milvusClient.flushAllSync(data?: FlushAllReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.flushAllSync({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS** *Promise&lt;GetFlushAllStateResponse&gt;*

This method returns a promise that resolves to a **GetFlushAllStateResponse** object.

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **flushed** (*boolean*) -
Whether the flush-all operation has fully completed. Because `flushAllSync()` blocks until completion, this value is **true** on success.

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

const res = await client.flushAllSync();
```

---
title: "reconnectToPrimary() | Node.js"
slug: /node/node/Client-reconnectToPrimary
sidebar_label: "reconnectToPrimary()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This operation reconnects the client to the primary cluster of a global cluster topology, rebuilding the channel pool when the primary endpoint has changed. | Node.js"
type: origin
token: shared-Client-reconnectToPrimary
displayed_sidebar: nodeSidebar

---

# reconnectToPrimary()

This operation reconnects the client to the primary cluster of a global cluster topology, rebuilding the channel pool when the primary endpoint has changed.

```javascript
await milvusClient.reconnectToPrimary()
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.reconnectToPrimary()
```

**PARAMETERS:**

This operation has no parameters.

**RETURNS:**

*Promise&lt;boolean&gt;*

This method returns a promise that resolves to a **boolean** indicating whether the client successfully reconnected to the primary cluster.

**EXCEPTIONS:**

- **Error**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const reconnected = await milvusClient.reconnectToPrimary();
```

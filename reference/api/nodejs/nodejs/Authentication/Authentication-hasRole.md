---
title: "hasRole() | Node.js"
slug: /node/node/Authentication-hasRole
sidebar_key: node/Authentication-hasRole
sidebar_label: "hasRole()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation checks if a role exists in the Milvus cluster. | Node.js"
type: docx
token: Beq1d1hDUoTzIsxJ6WTcVtlpnah
sidebar_position: 29
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - hasRole()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# hasRole()

This operation checks if a role exists in the Milvus cluster.

```javascript
await milvusClient.hasRole(data: HasRoleReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.hasRole({
    roleName: string,
    timeout?: number,
})
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role to check.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS:**

*Promise\<HasRoleResponse\>*

The response contains a `hasRole` boolean indicating whether the role exists.

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
const res = await client.hasRole({ roleName: 'my_role' });
console.log(res.hasRole); // true or false
```

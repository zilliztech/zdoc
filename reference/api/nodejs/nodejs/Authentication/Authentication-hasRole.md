---
title: "hasRole() | Node.js"
slug: /node/node/Authentication-hasRole
sidebar_label: "hasRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks if a role exists in the Milvus cluster. | Node.js"
type: docx
token: Beq1d1hDUoTzIsxJ6WTcVtlpnah
sidebar_position: 29
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - hasRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
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

**RETURNS** *Promise&lt;HasRoleResponse&gt;*

This method returns a promise that resolves to a **HasRoleResponse** object.

```typescript
{
    hasRole: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **hasRole** (*boolean*) -
A boolean that indicates whether the requested role exists. It is **true** when the role exists and **false** when it does not.

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
const res = await client.hasRole({ roleName: 'my_role' });
console.log(res.hasRole); // true or false
```

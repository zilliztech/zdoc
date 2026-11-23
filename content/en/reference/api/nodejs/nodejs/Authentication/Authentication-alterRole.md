---
title: "alterRole() | Node.js"
slug: /node/node/Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation alters the description of an existing role. | Node.js"
type: docx
token: Fvw0dyRalo2ceVxdY4Fcf9uTnBg
sidebar_position: 30
keywords: 
  - alter role
  - role
  - rbac
  - zilliz
  - zilliz cloud
  - cloud
  - alterRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterRole()

This operation updates the description of an existing role.

```javascript
await milvusClient.alterRole(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.alterRole({
    roleName: string,
    description: string,
    timeout?: number
})
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role to alter.

- **description** (*string*) -

    **[REQUIRED]**

    The new description of the role.

- **timeout** (*number*) -

    The timeout duration in milliseconds for this operation.

**RETURNS:**

*Promise&lt;ResStatus&gt;*

This method returns a promise that resolves to a **ResStatus** object.

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

const resStatus = await milvusClient.alterRole({
    roleName: 'my_role',
    description: 'Role updated description',
});
```

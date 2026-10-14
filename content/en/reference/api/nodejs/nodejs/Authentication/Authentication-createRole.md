---
title: "createRole() | Node.js"
slug: /node/node/Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a new role in the Milvus server. | Node.js"
type: docx
token: TR8xdMnzEo85sLxAtizcJWZdn6b
sidebar_position: 6
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - createRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createRole()

This operation creates a new role in the Milvus server.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.createRole({ roleName, description?, timeout? })
```

**PARAMETERS:**

- **roleName** (*string*) -

    The name of the new role.

- **description** (*string*) -

    An optional description for the new role.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or error occurs. Default is undefined.

**RETURN TYPE:**

*ResStatus*

**RETURNS:**

The response status: `{error_code, reason}`.

**PARAMETERS:**

- **error_code** (*number*) -

    The error code number: 0 means success.

- **reason** (*string*) -

    The cause of the error, if any.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
await milvusClient.createRole({
  roleName: 'exampleRole',
});
```

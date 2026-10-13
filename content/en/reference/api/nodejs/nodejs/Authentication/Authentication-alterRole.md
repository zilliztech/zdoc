---
title: "alterRole() | Node.js"
slug: /node/node/Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation alters the description of an existing role. | Node.js"
type: docx
token: Fvw0dyRalo2ceVxdY4Fcf9uTnBg
sidebar_position: 30
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - alterRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterRole()

This operation alters the description of an existing role.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.alterRole({ roleName, description, timeout? })
```

**PARAMETERS:**

- **roleName** (*string*) -

    The name of the role to alter.

- **description** (*string*) -

    The new role description.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or error occurs. Default is undefined.

**RETURNS:**

*ResStatus*

The response status has the shape of `{error_code, reason}`.

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
await milvusClient.alterRole({
  roleName: 'exampleRole',
  description: 'example role description',
});
```

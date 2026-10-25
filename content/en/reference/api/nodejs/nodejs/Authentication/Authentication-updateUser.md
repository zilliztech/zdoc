---
title: "updateUser() | Node.js"
slug: /node/node/Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates a user account password, description, or both. | Node.js"
type: docx
token: L4tGd5KqLoLtp2xQRyhcaXjsnL5
sidebar_position: 28
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - updateUser()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# updateUser()

This operation updates a user account password, description, or both.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.updateUser({ username, newPassword?, oldPassword?, description?, timeout? })
```

**PARAMETERS:**

- **username** (*string*) -

    The username of the user to be updated.

- **newPassword** (*string*) -

    The new password for the user. Required only when updating the password.

- **oldPassword** (*string*) -

    The old password of the user. Required when a password update is requested.

- **description** (*string*) -

    The new description for the user.

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
await milvusClient.updateUser({
  username: 'exampleUser',
  description: 'new description',
});
```

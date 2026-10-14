---
title: "createUser() | Node.js"
slug: /node/node/Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a new user account for the Milvus server. | Node.js"
type: docx
token: MtHHdvQ36oZcM8xEDpwcCUBynmb
sidebar_position: 7
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - createUser()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createUser()

This operation creates a new user account for the Milvus server.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.createUser({ username, password, description?, timeout? })
```

**PARAMETERS:**

- **username** (*string*) -

    The username of the new user.

- **password** (*string*) -

    The password for the new user.

- **description** (*string*) -

    An optional description for the new user.

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
await milvusClient.createUser({
  username: 'exampleUser',
  password: 'examplePassword',
});
```

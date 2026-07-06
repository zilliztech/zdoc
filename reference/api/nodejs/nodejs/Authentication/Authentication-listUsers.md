---
title: "listUsers() | Node.js"
slug: /node/node/Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists currently available users. | Node.js"
type: docx
token: Z0EOd1PXooNeowx4SQgcq3synBc
sidebar_position: 21
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - listUsers()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listUsers()

This operation lists currently available users.

```javascript
await milvusClient.listUsers(data)
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.listUsers()
```

**PARAMETERS:**

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;ListCredUsersResponse&gt;*

This method returns a promise that resolves to a **ListCredUsersResponse** object.

```typescript
{
    usernames: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **usernames** (*string[]*) -
A list of usernames that exist in the current Milvus instance.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
milvusClient.listUsers()
```


---
title: "describeUser() | Node.js"
slug: /node/node/Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This is a method template. | Node.js"
type: docx
token: Da9KdvvWroKX9cxOwsmcLRBxnVb
sidebar_position: 10
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - describeUser()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeUser()

This is a method template.

```javascript
await milvusClient.describeUser(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeUser({
    includeRoleInfo?: boolean,
    timeout?: number,
    username: string
})
```

**PARAMETERS:**

- **username** (*string*) -

    **[REQUIRED]**

    The name of the user to describe.

- **includeRoleInfo** (*boolean*) -

    A boolean value indicating whether to include role information.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;SelectUserResponse&gt;*

This method returns a promise that resolves to a **SelectUserResponse** object.

```typescript
{
    results: UserResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*UserResult[]*) -
A list of **UserResult** objects. For `describeUser()`, this list contains a single entry describing the requested user.

    - **user** (*User*) -

        A **User** object identifying the user.

        - **name** (*string*) -

        The username.

        - **name** (*string*) -

            The username.

    - **roles** (*RoleEntity[]*) -

        A list of roles assigned to this user.

        - **name** (*string*) -

        The role name.

        - **name** (*string*) -

            The role name.

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
milvusClient.describeUser({username: 'name'})
```


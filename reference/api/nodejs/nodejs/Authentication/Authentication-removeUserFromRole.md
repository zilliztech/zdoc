---
displayed_sidbar: nodeSidebar
title: "removeUserFromRole() | Node.js"
slug: /node/node/Authentication-removeUserFromRole
sidebar_label: "removeUserFromRole()"
beta: false
notebook: false
description: "This operation removes a user from a specific role. | Node.js"
type: docx
token: XmyMdqvDLosr6oxzvhWcw8H2ntg
sidebar_position: 21
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - removeUserFromRole()
  - nodejs25
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# removeUserFromRole()

This operation removes a user from a specific role.

```javascript
removeUserFromRole(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.removeUserFromRole({
   username: string,
   rolename: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **username** (*string*) -

    **[REQUIRED]**

    The name of a user.

- **rolename** (*string*) -

    **[REQUIRED]**

    The name of a role

- **timeout** (*number*) -  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<ResStatus>*

This method returns a promise that resolves to a **ResStatus** object.

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    A code that indicates the operation result. It remains **0** if this operation succeeds.

- **error_code** (*string* | *number*) -

    An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

- **reason** (*string*) - 

    The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
milvusClient.removeUserFromRole({
   username: 'my',
   roleName: 'myrole'
 });
```


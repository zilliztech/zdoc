---
title: "revokeRole() | Node.js"
slug: /node/node/Authentication-revokeRole
sidebar_label: "revokeRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation revokes the role assigned to a user. | Node.js"
type: docx
token: W7XJdZDHnoFECDxCYoMcrZqrnnd
sidebar_position: 27
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - revokeRole()
  - nodejs26
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# revokeRole()

This operation revokes the role assigned to a user.

```javascript
revokeRole(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.revokeRole({
   username: string,
   roleName: string，
   timeout?: number
 })
```

**PARAMETERS:**

- **username** (*str*) -

    **[REQUIRED]**

    The name of an existing user.

- **roleName** (*str*) -

    **[REQUIRED]**

    The name of the role to revoke.

- **timeout** (*number*)  

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

## Example\{#example}

```java
milvusClient.removeUserFromRole({
   username: 'my',
   roleName: 'myrole'
 });
```


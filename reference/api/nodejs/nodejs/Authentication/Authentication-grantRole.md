---
title: "grantRole() | Node.js"
slug: /node/node/Authentication-grantRole
sidebar_label: "grantRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a role to a user. | Node.js"
type: docx
token: LPJsdEnvwo6apcxjhZgc3rpDnuc
sidebar_position: 14
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - grantRole()
  - nodejs25
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# grantRole()

This operation grants a role to a user.

```javascript
grantRole(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.grantRole({
   username: string,
   roleName: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **username** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of an existing user.

- **roleName** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of the role to assign.

- **timeout** (number)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\&lt;ResStatus&gt;*

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
milvusClient.grantRole({
   username: 'my',
   roleName: 'myrole'
 })
```


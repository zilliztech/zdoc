---
title: "dropAllRoles() | Node.js"
slug: /node/node/Authentication-dropAllRoles
sidebar_label: "dropAllRoles()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops all roles in Milvus. | Node.js"
type: docx
token: E5rYdw3EWo2WKZxEyGac049an3e
sidebar_position: 11
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - dropAllRoles()
  - nodejs26
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropAllRoles()

This operation drops all roles in Milvus.

```javascript
dropAllRoles(data?): Promise<ResStatus[]>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.dropAllRoles({
   timeout?: number
})
```

**PARAMETERS:**

- **timeout** (*number*) -  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<ResStatus[]>*

This method returns a list of promises, each of which resolves to a **ResStatus** object.

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
milvusClient.dropAllRoles()
```


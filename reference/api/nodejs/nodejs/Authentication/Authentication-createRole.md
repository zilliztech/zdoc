---
displayed_sidbar: nodeSidebar
title: "createRole() | Node.js"
slug: /node/node/Authentication-createRole
sidebar_label: "createRole()"
beta: false
notebook: false
description: "This operation creates a custom role. | Node.js"
type: docx
token: SDoYdccLWo1W3PxkNFncibwDnch
sidebar_position: 4
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - createRole()
  - nodejs25
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# createRole()

This operation creates a custom role.

```javascript
createRole(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.createRole({
   roleName: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **roleName** (*string*) -

    **&#91;REQUIRED&#93;**

    The name of the role to create.

- **timeout** (*number*) -

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
milvusClient.createRole({
   roleName: 'exampleRole',
 })
```


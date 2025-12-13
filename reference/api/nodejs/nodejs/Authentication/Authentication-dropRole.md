---
title: "dropRole() | Node.js"
slug: /node/node/Authentication-dropRole
sidebar_label: "dropRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a custom role. | Node.js"
type: docx
token: AnkUdEHXmob3Vwx9GIWcDOQanng
sidebar_position: 13
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - dropRole()
  - nodejs26
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropRole()

This operation drops a custom role.

```javascript
dropRole(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.dropRole({
   roleName: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of the role to drop.

- **timeout** (number)  

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
milvusClient.dropRole({
   roleName: 'exampleRole',
 })
```


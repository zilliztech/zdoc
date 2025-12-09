---
title: "dropPrivilegeGroup() | Node.js"
slug: /node/node/Authentication-dropPrivilegeGroup
sidebar_label: "dropPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a user to a specific role. | Node.js"
type: docx
token: I63tdWAY2ok8V1xrK4tcrkwjncd
sidebar_position: 12
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - dropPrivilegeGroup()
  - nodejs26
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropPrivilegeGroup()

This operation adds a user to a specific role.

```javascript
dropPrivilegeGroup(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.dropPrivilegeGroup({
   timeout?: number
})
```

**PARAMETERS:**

- **timeout** (*number*) -  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<ResStatus>*

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
milvusClient.dropPrivilegeGroup()
```


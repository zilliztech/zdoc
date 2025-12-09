---
title: "removePrivilegesFromGroup() | Node.js"
slug: /node/node/Authentication-removePrivilegesFromGroup
sidebar_label: "removePrivilegesFromGroup()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes privileges from a specific privilege group in Milvus. | Node.js"
type: docx
token: EeAfdukBNoIIgCxX248c6VULnOb
sidebar_position: 22
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - removePrivilegesFromGroup()
  - nodejs26
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# removePrivilegesFromGroup()

This operation removes privileges from a specific privilege group in Milvus.

```javascript
removePrivilegesFromGroup(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.removePrivilegesFromGroup({
   group_name: string,
   privileges: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **group_name** (*string*) -

    **[REQUIRED]**

    The name of a privilege group.

- **privileges** (*string[]*) -

    **[REQUIRED]**

    The list of privileges to remove from the above group.

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

## Example\{#example}

```java
await milvusClient.removePrivilegesFromGroup({
    group_name: 'exampleGroup',
    privileges: ['CreateCollection', 'DropCollection'],
});
```


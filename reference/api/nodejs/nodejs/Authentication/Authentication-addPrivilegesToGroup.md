---
displayed_sidbar: nodeSidebar
title: "addPrivilegesToGroup() | Node.js"
slug: /node/node/Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: false
notebook: false
description: "This operation adds privileges to a specific privilege group in Milvus. | Node.js"
type: docx
token: IEqAdO0Pto6rgbxebo5cIXp0nMX
sidebar_position: 1
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - addPrivilegesToGroup()
  - nodejs25
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# addPrivilegesToGroup()

This operation adds privileges to a specific privilege group in Milvus.

```javascript
addPrivilegesToGroup(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.addPrivilegesToGroup({
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

    The list of privileges to add to the above group.

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
await milvusClient.addPrivilegesToGroup({
    group_name: 'exampleGroup',
    privileges: ['CreateCollection', 'DropCollection'],
});
```


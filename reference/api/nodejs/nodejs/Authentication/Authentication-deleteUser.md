---
title: "deleteUser() | Node.js"
slug: /node/node/Authentication-deleteUser
sidebar_label: "deleteUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a user. | Node.js"
type: docx
token: Cl5PdhU5jouHnrxyYXLcOQAZneb
sidebar_position: 6
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - deleteUser()
  - nodejs25
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# deleteUser()

This operation drops a user.

```javascript
deleteUser(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

This method has the following alternatives.

```javascript
milvusClient.deleteUser({
    username: string,
    timeout?: number
})
```

**PARAMETERS:**

- **username** (*string*) -

    **&#91;REQUIRED&#93;**

    The name of the user to drop.

- **timeout** (*number*)  

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
milvusClient.deleteUser({
    username: 'exampleUser'
})
```


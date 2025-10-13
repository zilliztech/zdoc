---
title: "listUsers() | Node.js"
slug: /node/node/Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists currently available users. | Node.js"
type: docx
token: Z0EOd1PXooNeowx4SQgcq3synBc
sidebar_position: 19
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listUsers()
  - nodejs25
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listUsers()

This operation lists currently available users.

```javascript
listUsers(data): Promise<ListCredUsersResponse>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.listUsers()
```

**PARAMETERS:**

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

*Returns Promise\&lt;ListCredUsersResponse&gt;*

This method returns a promise that resolves to a **ListCredUsersResponse** object.

```javascript
{
    usernames: string
    status: ResStatus
}
```

**PARAMETERS:**

- **usernames** (*string&#91;&#93;*) -

    A list of user names.

- **ResStatus**

    A **ResStatus object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
milvusClient.listUsers()
```


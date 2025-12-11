---
title: "createUser() | Node.js"
slug: /node/node/Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a user. | Node.js"
type: docx
token: JNZxdKEX3ohBl2xud7Wckhq7nVh
sidebar_position: 7
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - createUser()
  - nodejs26
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createUser()

This operation creates a user.

```javascript
createUser(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.createUser({
   username: string,
   password: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **username** (*string*) -

    **[REQUIRED]**

    The name of the user to create.

- **password** (*string*) -

    **[REQUIRED]**

    The password of the user to create.

- **timeout** (*number*)  -

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
milvusClient.createUser({
   username: 'exampleUser',
   password: 'examplePassword',
 })
```


---
title: "getIndexState() | Node.js"
slug: /node/node/Management-getIndexState
sidebar_label: "getIndexState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets the status of the specified index. | Node.js"
type: docx
token: HqE5d2jOroEuObxIjkZcHkX4nWX
sidebar_position: 12
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getIndexState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getIndexState()

This operation gets the status of the specified index.

```javascript
await milvusClient.getIndexState(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getIndexState({
      db_name?: string,
      collection_name: string,
      field_name?: string,
      index_name?: string,
      timeout?: number
});
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **index_name** (*string*) -

    The name of the target index. This parameter and `field_name` are mutually exclusive. 

- **field_name** (*string*) -

    The name of the target field. This parameter and `index_name` are mutually exclusive. When you use this parameter, ensure that an index has been built upon the specified field.

- **timeout** (number) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;GetIndexStateResponse&gt;*

This method returns a promise that resolves to a **GetIndexStateResponse** object.

```typescript
{
    state: IndexState,
    status:  ResStatus
}
```

**PARAMETERS:**

- **state** (*IndexState*) -
The current build state of the index. Possible values are **IndexStateNone**, **Unissued**, **InProgress**, **Finished**, and **Failed**.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const getIndexStateReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.getIndexState(getIndexStateReq);
console.log(res);
```


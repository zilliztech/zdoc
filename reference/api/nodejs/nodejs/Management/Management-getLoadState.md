---
title: "getLoadState() | Node.js"
slug: /node/node/Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation displays whether a specified collection or partition is loaded or not. | Node.js"
type: docx
token: J17ZdPNwqo4nt3x5b8pc0H5Nnph
sidebar_position: 12
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadState()
  - nodejs25
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getLoadState()

This operation displays whether a specified collection or partition is loaded or not.

```javascript
getLoadState(data): Promise<GetLoadStateResponse>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.getLoadState({
   db_name: string,
   collection_name: string,
   partition_names?: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **&#91;REQUIRED&#93;**

    The name of a collection.

- **partition_names** (*string&#91;&#93;*) -

    The names of one or more partitions.

- **timeout** (*number*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise\&lt;GetLoadStateResponse&gt;*

This method returns a promise that resolves to a **GetLoadStateResponse** object.

```javascript
{
    state: LoadState,
    status: ResStatus
}
```

**PARAMETERS:**

- state (*LoadState*) -

    The load status. The are four states:

    - **LoadStateLoaded** indicates the status is loaded.

    - **LoadStateLoading** indicates the status is loading.

    - **LoadStateNotExist** indicates the status is not available.

    - **LoadStateNotLoad** indicates the status is unloaded.

- **status** (*ResStatus*) -

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
 const resStatus = await milvusClient.getLoadState({
   collection_name: 'my_collection',
 });
```


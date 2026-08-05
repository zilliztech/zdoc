---
title: "dropCollectionFunction() | Node.js"
slug: /node/node/Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a custom function from an existing collection. | Node.js"
type: docx
token: T6xNdPPtsotGiYxL1WActF3qnxb
sidebar_position: 24
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

This operation removes a custom function from an existing collection.

```javascript
await milvusClient.dropCollectionFunction(data: DropCollectionFunctionReq)
```

## Request Syntax\{#request-syntax}

```javascript
dropCollectionFunction({
    collection_name: string,
    function_name: string,
    db_name: string,
    timeout: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection containing the function to remove.

- **function_name** (*string*) -

    **[REQUIRED]**

    The name of the function to drop.

- **db_name** (*string*) -

    The name of the database where the collection resides. Optional.

- **timeout** (*number*) -

    The timeout duration in milliseconds for this operation. Optional.

**RETURNS:**

*Promise\<ResStatus\>*

**EXCEPTIONS:**

- **MilvusError**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropCollectionFunction({
    collection_name: 'my_collection',
    function_name: 'my_function'
});
```

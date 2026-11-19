---
title: "dropFunctionField() | Node.js"
slug: /node/node/Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a function from the collection schema. | Node.js"
type: docx
token: MmABd2rdooxiLZxYzwEciyTanOg
sidebar_position: 32
keywords: 
  - drop function
  - function
  - schema
  - zilliz
  - zilliz cloud
  - cloud
  - dropFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropFunctionField()

This operation drops a function and its output fields and indexes from a collection.

```javascript
await milvusClient.dropFunctionField(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropFunctionField({
    collection_name: string,
    function_name: string,
    db_name?: string,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection that holds the function.

- **function_name** (*string*) -

    **[REQUIRED]**

    The name of the function to drop.

- **db_name** (*string*) -

    The name of the database where the collection resides.

- **timeout** (*number*) -

    The timeout duration in milliseconds for this operation.

**RETURNS:**

*Promise&lt;ResStatus&gt;*

This method returns a promise that resolves to a **ResStatus** object.

**EXCEPTIONS:**

- **Error**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.dropFunctionField({
    collection_name: 'my_collection',
    function_name: 'my_bm25_function',
});
```

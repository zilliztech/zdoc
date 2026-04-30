---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_key: node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation modifies a custom function in an existing collection. | Node.js"
type: docx
token: DBEFdVorMomen0x4xNEcKkM1n8O
sidebar_position: 22
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

This operation modifies a custom function in an existing collection.

```typescript
await milvusClient.alterCollectionFunction(data: AlterCollectionFunctionReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.alterCollectionFunction({
    collection_name: string,
    function_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection containing the function to modify.

- **function_name** (*string*) -

    **[REQUIRED]**

    The name of the function to alter.

- **function** (*FunctionObject*) -

    **[REQUIRED]**

    The updated function schema. For the full FunctionObject field reference, refer to `addCollectionFunction()`.

- **db_name** (*string*) -

    The name of the database where the collection resides.

- **timeout** (*number*) -

    The timeout duration in milliseconds for this operation.

**RETURNS:**

*Promise\<ResStatus\>*

**EXCEPTIONS:**

- **MilvusError**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.alterCollectionFunction({
    collection_name: 'my_collection',
    function_name: 'my_bm25_function',
    function: {
        name: 'my_bm25_function',
        description: 'Updated BM25 sparse embedding function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
});
```

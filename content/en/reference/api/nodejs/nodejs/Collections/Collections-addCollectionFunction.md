---
title: "addCollectionFunction() | Node.js"
slug: /node/node/Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a custom function to an existing collection. | Node.js"
type: docx
token: SmI4dGF4qoAjbKxamfhcndjxnCc
sidebar_position: 21
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# addCollectionFunction()

<Admonition type="warning" icon="🚧" title="Warning">

**Deprecated.**

This method is deprecated. Use [addFunctionField()](./Collections-addFunctionField) instead.

</Admonition>

This operation adds a custom function to an existing collection.

```javascript
await milvusClient.addCollectionFunction(data: AddCollectionFunctionReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.addCollectionFunction({
    collection_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection to add the function to.

- **function** (*[FunctionObject](./Collections-FunctionObject)*) -

    **[REQUIRED]**

    The function to add to the collection. See [FunctionObject](./Collections-FunctionObject).

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
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.addCollectionFunction({
    collection_name: 'my_collection',
    function: {
        name: 'my_bm25_function',
        description: 'BM25 sparse embedding function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
});
```


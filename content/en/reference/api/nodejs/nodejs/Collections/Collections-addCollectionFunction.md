---
title: "addCollectionFunction() | Node.js"
slug: /node/node/Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds a function to an existing collection. | Node.js"
type: docx
token: VyADdglU4ohvGTxHuwTc6yBRnTe
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

This operation adds a function to an existing collection.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.addCollectionFunction({ collection_name, function, db_name?, timeout? })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of an existing collection.

- **function** (*FunctionObject*) -

    The function object to add to the collection.

- **db_name** (*string*) -

    The name of the database that holds the collection.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or error occurs. Default is undefined.

**RETURNS:**

*ResStatus*

The response status of the operation has the shape of `{error_code, reason}`.

**PARAMETERS:**

- **error_code** (*number*) -

    The error code number: 0 means success.

- **reason** (*string*) -

    The cause of the error, if any.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
await milvusClient.addCollectionFunction({
  collection_name: 'my_collection',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
});
```

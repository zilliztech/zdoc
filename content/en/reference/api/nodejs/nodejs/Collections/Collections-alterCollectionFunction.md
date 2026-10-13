---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation alters an existing function on a collection. | Node.js"
type: docx
token: McjWdWlspoubE4x3atYc4Fn9n3c
sidebar_position: 22
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

This operation alters an existing function on a collection.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.alterCollectionFunction({ collection_name, function_name, function, db_name?, timeout? })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of an existing collection.

- **function_name** (*string*) -

    The name of the function to alter.

- **function** (*FunctionObject*) -

    The replacement function schema.

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
await milvusClient.alterCollectionFunction({
  collection_name: 'my_collection',
  function_name: 'bm25_fn',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
});
```

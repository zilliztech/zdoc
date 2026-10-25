---
title: "addFunctionField() | Node.js"
slug: /node/node/Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds a function-backed output field and its bound index to an existing collection. | Node.js"
type: docx
token: BjKLdh2SFouRSbxELaqc9b4tnts
sidebar_position: 29
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - addFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# addFunctionField()

This operation adds a function-backed output field and its bound index to an existing collection.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.addFunctionField({ collection_name, field, function, extra_params, index_name?, db_name?, timeout? })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of an existing collection.

- **field** (*FieldType*) -

    The function output field schema to add.

- **function** (*FunctionObject*) -

    The function schema to add.

- **extra_params** (*FunctionFieldIndexParams*) -

    Index parameters for the bound index. Must provide an explicit `index_type` and cannot use AUTOINDEX.

- **index_name** (*string*) -

    The name for the bound index of the new field.

- **db_name** (*string*) -

    The name of the database that holds the collection.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. Default is undefined.

**RETURN TYPE:**

*ResStatus*

**RETURNS:**

The status of the schema change.

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
await milvusClient.addFunctionField({
  collection_name: 'my_collection',
  function: {
    name: 'bm25_fn',
    type: 'BM25',
    input_field_names: ['text'],
    output_field_names: ['sparse_vector'],
    params: {},
  },
  field: {
    name: 'sparse_vector',
    type: 'SparseFloatVector',
  },
  extra_params: {
    index_type: 'SPARSE_INVERTED_INDEX',
    metric_type: 'IP',
  },
});
```

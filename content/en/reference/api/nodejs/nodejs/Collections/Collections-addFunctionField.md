---
title: "addFunctionField() | Node.js"
slug: /node/node/Collections-addFunctionField
sidebar_label: "addFunctionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds a field to the collection schema along with a function. | Node.js"
type: docx
token: BjKLdh2SFouRSbxELaqc9b4tnts
sidebar_position: 29
keywords: 
  - add field
  - bm25
  - function
  - zilliz
  - zilliz cloud
  - cloud
  - addFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addFunctionField()

This operation adds a function-backed vector field and its bound index to an existing collection.

```javascript
await milvusClient.addFunctionField(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.addFunctionField({
    collection_name: string,
    field: FieldType,
    function: FunctionObject,
    index_name?: string,
    extra_params: FunctionFieldIndexParams,
    db_name?: string,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection to add the function-backed field to.

- **field** (*[FieldType](./Collections-FieldType)*) -

    **[REQUIRED]**

    The schema of the function output field. See [FieldType](./Collections-FieldType).

- **function** (*[FunctionObject](./Collections-FunctionObject)*) -

    **[REQUIRED]**

    The function schema. See [FunctionObject](./Collections-FunctionObject).

- **index_name** (*string*) -

    The name of the bound index for the new field.

- **extra_params** (*FunctionFieldIndexParams*) -

    **[REQUIRED]**

    The bound-index metadata, which must provide an explicit `index_type`. `AUTOINDEX` is not supported.

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
import { MilvusClient, DataType, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.addFunctionField({
    collection_name: 'my_collection',
    field: {
        name: 'sparse_vector',
        data_type: DataType.SparseFloatVector,
        is_function_output: true,
    },
    function: {
        name: 'my_bm25_function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
    index_name: 'sparse_vector_index',
    extra_params: {
        index_type: 'SPARSE_INVERTED_INDEX',
        params: { metric_type: 'BM25' },
    },
});
```

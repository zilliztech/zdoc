---
title: "alterCollectionSchema() | Node.js"
slug: /node/node/Collections-alterCollectionSchema
sidebar_label: "alterCollectionSchema()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds a function-backed output field to a collection schema. | Node.js"
type: docx
token: VD1AddhBlo14dnxad79cWBEinMe
sidebar_position: 30
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionSchema()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionSchema()

This operation adds a function-backed output field to a collection schema.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.alterCollectionSchema({ collection_name, field, function, db_name?, timeout? })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of an existing collection.

- **field** (*FieldType*) -

    The function output field schema to add.

- **function** (*FunctionObject*) -

    The function schema to add.

- **db_name** (*string*) -

    The name of the database that holds the collection.

- **timeout** (*number*) -

    Optional RPC timeout in milliseconds.

**RETURN TYPE:**

*AlterCollectionSchemaResponse*

**RETURNS:**

The response from Milvus. The `index_status` field is removed from the wire response and stays only for compatibility.

**PARAMETERS:**

- **alter_status** (*ResStatus*) -

    The alter status of the schema change: `{error_code, reason}`.

- **index_status** (*ResStatus*) -

    Deprecated and removed from the wire response; kept for compatibility.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
await milvusClient.alterCollectionSchema({
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
});
```

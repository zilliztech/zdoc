---
title: "add_function_field() | Python | MilvusClient"
slug: /python/python/Function-add_function_field
sidebar_label: "add_function_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a function field to an existing collection in one call it inserts the field schema, binds the function that produces the field, and creates the backing index. | Python | MilvusClient"
type: docx
token: SPl9dAH9noQ2e9xu86Zcy4XxnTb
sidebar_position: 6
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - add_function_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_function_field()

This operation adds a function field to an existing collection in one call: it inserts the field schema, binds the function that produces the field, and creates the backing index.

## Request Syntax\{#request-syntax}

```python
add_function_field(
    collection_name: str,
    field_schema: FieldSchema,
    func: Function,
    index_params: IndexParams,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **field_schema** ([FieldSchema](./MilvusClient-FieldSchema)) -

    The schema of the function output field to add, such as a sparse float vector field.

- **func** ([Function](./MilvusClient-Function)) -

    The function whose output populates the field. The function output field names must include the added field.

- **index_params** (*IndexParams*) -

    The index parameters for the added field.

- **timeout** (*float | None*) -

    Default: `None`

    The timeout in seconds for this operation.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient, FieldSchema, Function, FunctionType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
field = FieldSchema(
    name="bm25_sparse",
    dtype="SPARSE_FLOAT_VECTOR",
)
func = Function(
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["bm25_sparse"],
)
client.add_function_field(
    collection_name="docs",
    field_schema=field,
    func=func,
    index_params=index_params,
)
```

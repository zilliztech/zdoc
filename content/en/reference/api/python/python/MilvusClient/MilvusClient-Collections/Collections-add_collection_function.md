---
title: "add_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_function
sidebar_label: "add_collection_function()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds a new function to the collection. Functions allow you to define custom processing logic such as BM25 scoring or embedding generation. | Python | MilvusClient"
type: docx
token: SHnzddV1yo6yO3xCxJpcztCCnsw
sidebar_position: 21
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - add_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_collection_function()

This operation adds a new function to the collection. Functions allow you to define custom processing logic such as BM25 scoring or embedding generation.

<Admonition type="info" title="Note">

Deprecated in PyMilvus v3.0.2 or later. This method is deprecated because Milvus 3.0 and later do not support adding a function separately. Use add_function_field() instead, which adds the function together with its output field and index.

</Admonition>

<Admonition type="info" title="Note">

This does not apply to external collections.

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.add_collection_function(
    collection_name: str,
    function: Function,
    timeout: float = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection.

- **function** (*[Function](Function/Function.md*) -

    **[REQUIRED]**

    An option that &ast;) - The function schema to add. This is a Function object that defines the function name, type, input fields, output fields, and parameters.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

- **kwargs** (*dict*) -

    Optional additional parameters.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation. This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

bm25_function = Function(
    name="bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
)

client.add_collection_function(
    collection_name="my_collection",
    function=bm25_function,
)
```

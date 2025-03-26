---
displayed_sidbar: pythonSidebar
title: "add_function() | Python | MilvusClient"
slug: /python/python/Function-add_function
sidebar_label: "add_function()"
beta: false
notebook: false
description: "This operation adds a function to convert raw data into vector representations. | Python | MilvusClient"
type: docx
token: XhcVd1JXvoAgUfxSEpQcL2H6nVg
sidebar_position: 1
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - add_function()
  - pymilvus25
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_function()

This operation adds a function to convert raw data into vector representations.

## Request Syntax{#request-syntax}

```python
add_function(
   function: Function
)
```

**PARAMETERS:**

- `function` (*[Function](./MilvusClient-Function)*)

    **[REQUIRED]**

    An instance of the `Function` class that converts data into vector embeddings. This function will be added to the schema of a collection.

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

A `CollectionSchema` object

**EXCEPTIONS:**

- `FunctionIncorrectType`

    This exception will be raised when the `function` parameter is of the incorrect type.

## Examples{#examples}

```python
from pymilvus import MilvusClient, Function, FunctionType

schema = MilvusClient.create_schema()

bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names="sparse_vector",
    function_type=FunctionType.BM25,
)

schema.add_function(bm25_function)
```


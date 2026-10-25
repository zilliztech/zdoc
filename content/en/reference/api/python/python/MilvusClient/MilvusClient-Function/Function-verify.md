---
title: "verify() | Python | MilvusClient"
slug: /python/python/Function-verify
sidebar_label: "verify()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation validates the input and output fields of a function defined in the CollectionSchema. | Python | MilvusClient"
type: docx
token: HR2Sd7RpWoy3Jrxt7zCcrUFjnmf
sidebar_position: 5
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# verify()

This operation validates the input and output fields of a function defined in the CollectionSchema.

## Request Syntax\{#request-syntax}

```python
verify(
```

**RETURN TYPE:**

*None*

**RETURNS:**

None.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation. This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

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

# Verify the function
bm25_function.verify(schema)
```

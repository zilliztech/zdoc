---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/Function-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a dictionary representation of the `Function` object. | Python | MilvusClient"
type: docx
token: AmwJdW0z6opMPcxhMlBcYPIWn2M
sidebar_position: 4
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus26
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

This operation returns a dictionary representation of the `Function` object.

## Request Syntax\{#request-syntax}

```python
to_dict()
```

**PARAMETERS:**

None

**RETURN TYPE:**

*dict*

**RETURNS:**

The dictionary representation of the `Function` object.

**EXCEPTIONS:**

- `MilvusException`

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import Function, FunctionType

bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names="sparse_vector",
    function_type=FunctionType.BM25,
)

bm25_func_dict = bm25_function.to_dict()

print(bm25_func_dict)
```

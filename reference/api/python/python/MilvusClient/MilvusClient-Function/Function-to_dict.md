---
displayed_sidbar: pythonSidebar
title: "to_dict() | Python | MilvusClient"
slug: /python/python/Function-to_dict
sidebar_label: "to_dict()"
beta: false
notebook: false
description: "This operation returns a dictionary representation of the `Function` object. | Python | MilvusClient"
type: docx
token: AmwJdW0z6opMPcxhMlBcYPIWn2M
sidebar_position: 4
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus25
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# to_dict()

This operation returns a dictionary representation of the `Function` object.

## Request Syntax{#request-syntax}

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

## Examples{#examples}

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

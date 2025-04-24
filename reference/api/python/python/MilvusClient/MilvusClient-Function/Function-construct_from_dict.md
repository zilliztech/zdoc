---
displayed_sidbar: pythonSidebar
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/Function-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
notebook: false
description: "This operation constructs a `Function` object from a dictionary representation. | Python | MilvusClient"
type: docx
token: Ulypd24byoDBOpxGnnJcbF3Nnkb
sidebar_position: 2
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dict()
  - pymilvus25
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# construct_from_dict()

This operation constructs a `Function` object from a dictionary representation.

## Request Syntax{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

**PARAMETERS:**

- `raw` (*dict*)

    A dictionary containing the raw data to construct the collection schema.

**RETURN TYPE:**

*Function*

**RETURNS:**

A `Function` object.

**EXCEPTIONS:**

- `MilvusException`

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Function  

function_dict = {  
    "name": "bm25",  
    "type": "BM25",  
    "input_field_names": ["text"],  
    "output_field_names": ["score"],  
    "description": "BM25 text search function",  
}  

function = Function.construct_from_dict(function_dict)  

print(function)
```


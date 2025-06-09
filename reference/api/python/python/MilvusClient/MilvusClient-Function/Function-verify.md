---
displayed_sidbar: pythonSidebar
title: "verify() | Python | MilvusClient"
slug: /python/python/Function-verify
sidebar_label: "verify()"
beta: false
notebook: false
description: "This operation validates the input and output fields of a function defined in the CollectionSchema. | Python | MilvusClient"
type: docx
token: YXogdv0Dpovi2Pxbyh2cdA4nnbe
sidebar_position: 5
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus25
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# verify()

This operation validates the input and output fields of a function defined in the CollectionSchema.

## Request Syntax{#request-syntax}

```python
verify(
    schema: CollectionSchema
)
```

**PARAMETERS:**

None

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

- `MilvusException`

    This exception will be raised when any error occurs during this operation.

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

# Verify the function
bm25_function.verify(schema)
```

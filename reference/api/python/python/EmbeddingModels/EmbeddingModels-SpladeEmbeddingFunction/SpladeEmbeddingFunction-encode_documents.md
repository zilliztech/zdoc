---
title: "encode_documents() | Python"
slug: /python/python/SpladeEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation takes in documents and encodes them into vector embeddings. | Python"
type: docx
token: PwL1dndmVoxP98xp0pXcOci4nSe
sidebar_position: 1
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - encode_documents()
  - pymilvus26
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_documents()

This operation takes in documents and encodes them into vector embeddings.

## Request syntax\{#request-syntax}

```python
encode_documents(
    documents: List[str], 
) -> csr_array
```

**PARAMETERS:**

- **documents** (*List[str]*)

    A list of string values, where each string represents a document that will be passed to the embedding model for encoding. The model will generate an embedding vector for each string in the list.

**RETURN TYPE:**

*csr_array*

**RETURNS:**

Compressed sparse row matrices representing the document embeddings.

**Exceptions:**

- **ImportError**

    This exception will be raised when the transformers library is not installed.

## Examples\{#examples}

```python
from pymilvus import model

splade_ef = model.sparse.SpladeEmbeddingFunction(
    model_name="naver/splade-cocondenser-selfdistil", 
    device="cpu"
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = splade_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# since the output embeddings are in a 2D csr_array format, we convert them to a list for easier manipulation.
print("Sparse dim:", splade_ef.dim, list(docs_embeddings)[0].shape)

# Embeddings:   (0, 2001)   0.6392706036567688
#   (0, 2034)   0.024093208834528923
#   (0, 2082)   0.3230178654193878
# ...
#   (2, 23602)  0.5671860575675964
#   (2, 26757)  0.5770265460014343
#   (2, 28639)  3.1990697383880615
# Sparse dim: 30522 (1, 30522)
```

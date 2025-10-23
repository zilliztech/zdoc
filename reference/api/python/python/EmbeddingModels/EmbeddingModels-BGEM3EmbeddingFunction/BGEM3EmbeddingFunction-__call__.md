---
title: "\_\_call\_\_() | Python"
slug: /python/python/BGEM3EmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation in BGEM3EmbeddingFunction takes a list of text strings and directly encodes them into vector embeddings. | Python"
type: docx
token: K7qWdSwtNo976VxcvopczGLjnLf
sidebar_position: 4
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call\_\_()
  - pymilvus25
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

This operation in [BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) takes a list of text strings and directly encodes them into vector embeddings.

The **\_\_call\_\_()** method of BGEM3EmbeddingFunction shares the same functionality as [encode_documents()](./BGEM3EmbeddingFunction-encode_documents) and [encode_queries()](./BGEM3EmbeddingFunction-encode_queries).

## Request syntax{#request-syntax}

```python
# Instance created
bge_m3_ef = BGEM3EmbeddingFunction()

# __call__ method will be called
bge_m3_ef(
    texts: List[str]
) -> Dict
```

**PARAMETERS:**

- **texts** (*List[str]*)

    A list of string values, where each string represents text that will be passed to the embedding model for encoding. The model will generate an embedding vector for each string in the list.

**RETURN TYPE:**

*Dict*

**RETURNS:**

A dictionary containing the document embeddings.

When initializing [BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction), if **return_dense**, **return_sparse**, and **return_colbert_vecs** are set to **True**, the returned dictionary will contain the keys **dense**, **sparse**, and **colbert_vecs**, with the corresponding dense embeddings, sparse word embeddings, and ColBERT vectors.

**Exceptions:**

- **ImportError**

    This exception will be raised when the FlagEmbedding module is not installed.

## Examples{#examples}

```python
from pymilvus import model

# Create a BGEM3EmbeddingFunction instance
bge_m3_ef = model.hybrid.BGEM3EmbeddingFunction(
    model_name='BAAI/bge-m3', # Specify t`he model name
    device='cpu', # Specify the device to use, e.g., 'cpu' or 'cuda:0'
    use_fp16=False # Whether to use fp16. `False` for `device='cpu'`.
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

# bge_m3_ef.__call__ will be called
bge_m3_ef(docs)

# {'dense': [array([-0.02505937, -0.00142193,  0.04015467, ..., -0.02094924,
#           0.02623661,  0.00324098], dtype=float32),
#   array([ 0.00118463,  0.00649292, -0.00735763, ..., -0.01446293,
#           0.04243685, -0.01794822], dtype=float32),
#   array([ 0.00415287, -0.0101492 ,  0.0009811 , ..., -0.02559666,
#           0.08084674,  0.00141647], dtype=float32)],
#  'sparse': <3x250002 sparse array of type '<class 'numpy.float32'>'
#   with 43 stored elements in Compressed Sparse Row format>}
```

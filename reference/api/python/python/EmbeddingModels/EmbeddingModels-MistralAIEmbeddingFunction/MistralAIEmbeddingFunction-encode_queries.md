---
title: "encode_queries() | Python"
slug: /python/python/MistralAIEmbeddingFunction-encode_queries
sidebar_label: "encode_queries()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation takes in a list of query strings and encodes each query into a vector embedding. | Python"
type: docx
token: SptWdOyFqoGM5VxVS16cofqfnDg
sidebar_position: 2
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - encode_queries()
  - pymilvus25
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_queries()

This operation takes in a list of query strings and encodes each query into a vector embedding.

## Request syntax{#request-syntax}

```python
encode_queries(
    queries: List[str], 
) -> List[np.array]
```

**PARAMETERS:**

- **queries** (*List&#91;str&#93;*)

    A list of string values, where each string represents a query that will be passed to the embedding model for encoding. The model will generate an embedding vector for each string in the list.

**RETURN TYPE:**

*List&#91;np.array&#93;*

**RETURNS:**

A list where each element is a NumPy array.

**Exceptions:**

- **ValueError**

    This exception will be raised when `api_key` is not provided and the `MISTRALAI_API_KEY` environment variable is also not set.

## Examples{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # Defaults to `mistral-embed`
    api_key="MISTRAL_API_KEY" # Provide your Mistral AI API key
)

queries = ["When was artificial intelligence founded", 
           "Where was Alan Turing born?"]

query_embeddings = ef.encode_queries(queries)

print("Embeddings:", query_embeddings)
print("Dim", ef.dim, query_embeddings[0].shape)

# Embeddings: [array([-0.04916382,  0.04568481,  0.03594971, ..., -0.02653503,
#         0.02804565,  0.00600815]), array([-0.05938721,  0.07098389,  0.01773071, ..., -0.01708984,
#         0.03582764,  0.00366592])]
# Dim 1024 (1024,)
```

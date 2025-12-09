---
title: "\_\_call\_\_() | Python"
slug: /python/python/MistralAIEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation in MistralAIEmbeddingFunction takes a list of text strings and directly encodes them into vector embeddings. | Python"
type: docx
token: Z23IddhHhom7AyxDMXecLORVnDh
sidebar_position: 4
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call\_\_()
  - pymilvus26
  - Unstructured Data
  - vector database
  - IVF
  - knn
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

This operation in [MistralAIEmbeddingFunction](./EmbeddingModels-MistralAIEmbeddingFunction) takes a list of text strings and directly encodes them into vector embeddings.

The **\_\_call\_\_()** method of MistralAIEmbeddingFunction shares the same functionality as [encode_documents()](./MistralAIEmbeddingFunction-encode_documents) and [encode_queries()](./MistralAIEmbeddingFunction-encode_queries).

## Request syntax\{#request-syntax}

```python
# Instance created

ef = MistralAIEmbeddingFunction()

# __call__ method will be called
ef(
    texts: List[str]
) -> List[np.array]
```

**PARAMETERS:**

- **texts** (*List[str]*)

    A list of string values, where each string represents text that will be passed to the embedding model for encoding. The model will generate an embedding vector for each string in the list.

**RETURN TYPE:**

*List[np.array]*

**RETURNS:**

A list where each element is a NumPy array.

**Exceptions:**

- **ValueError**

    This exception will be raised when `api_key` is not provided and the `MISTRALAI_API_KEY` environment variable is also not set.

## Examples\{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # Defaults to `mistral-embed`
    api_key="MISTRAL_API_KEY" # Provide your Mistral AI API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

ef(docs)

# [array([-0.06051636,  0.03207397,  0.04684448, ..., -0.01618958,
#         0.02442932, -0.01302338]), array([-0.04675293,  0.06512451,  0.04290771, ..., -0.01454926,
#         0.0014801 ,  0.00686646]), array([-0.05978394,  0.08728027,  0.02217102, ..., -0.00681305,
#         0.03634644, -0.01802063])]
```

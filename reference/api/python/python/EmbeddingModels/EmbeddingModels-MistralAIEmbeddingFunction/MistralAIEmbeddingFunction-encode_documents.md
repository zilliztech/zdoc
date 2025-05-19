---
displayed_sidbar: pythonSidebar
title: "encode_documents() | Python"
slug: /python/python/MistralAIEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
notebook: false
description: "This operation takes in documents and encodes them into vector embeddings. | Python"
type: docx
token: SeFLdfKVjoGX8Xx11e3cmkY4n7g
sidebar_position: 1
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - encode_documents()
  - pymilvus25
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# encode_documents()

This operation takes in documents and encodes them into vector embeddings.

## Request syntax{#request-syntax}

```python
encode_documents(
    documents: List[str], 
) -> List[np.array]
```

**PARAMETERS:**

- **documents** (*List[str]*)

    A list of string values, where each string represents a document that will be passed to the embedding model for encoding. The model will generate an embedding vector for each string in the list.

**RETURN TYPE:**

*List[np.array]*

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

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

docs_embeddings = ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension and shape of embeddings
print("Dim:", ef.dim, docs_embeddings[0].shape)

# Embeddings: [array([-0.06051636,  0.03207397,  0.04684448, ..., -0.01618958,
#         0.02442932, -0.01302338]), array([-0.04675293,  0.06512451,  0.04290771, ..., -0.01454926,
#         0.0014801 ,  0.00686646]), array([-0.05978394,  0.08728027,  0.02217102, ..., -0.00681305,
#         0.03634644, -0.01802063])]
# Dim: 1024 (1024,)
```

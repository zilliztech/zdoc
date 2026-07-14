---
title: "encode_documents() | Python"
slug: /python/python/InstructorEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: Mp7CdNfJnoBF2DxscRNc6RO0n7d
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
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# encode_documents()

この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。

## リクエスト構文\{#request-syntax}

```python
encode_documents(
    documents: List[str], 
) -> List[np.array]
```

**PARAMETERS:**

- **documents** (*List[str]*)

    各文字列がエンコードのために埋め込みモデルに渡されるドキュメントを表す、文字列値のリストです。モデルはリスト内の各文字列に対して埋め込みベクトルを生成します。

**RETURN TYPE:**

*List[np.array]*

**RETURNS:**

各要素が NumPy 配列であるリストです。

**Exceptions:**

*None*

## 例\{#examples}

```python
from pymilvus.model.dense import InstructorEmbeddingFunction

ef = InstructorEmbeddingFunction(
    model_name="hkunlp/instructor-xl", # Defaults to `hkunlp/instructor-xl`
    query_instruction="Represent the question for retrieval:",
    doc_instruction="Represent the document for retrieval:"
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

# Embeddings: [array([ 1.08575663e-02,  3.87877878e-03,  3.18090729e-02, -8.12458917e-02,
#        -4.68971021e-02, -5.85585833e-02, -5.95418774e-02, -8.55880603e-03,
#        -5.54775111e-02, -6.08020350e-02,  1.76202394e-02,  1.06648318e-02,
#        -5.89960292e-02, -7.46861771e-02,  6.60329172e-03, -4.25189249e-02,
#        ...
#        -1.26921125e-02,  3.01475357e-02,  8.25323071e-03, -1.88470203e-02,
#        6.04814291e-03, -2.81618331e-02,  5.91602828e-03,  7.13866428e-02],
#        dtype=float32)]
# Dim: 768 (768,)
```

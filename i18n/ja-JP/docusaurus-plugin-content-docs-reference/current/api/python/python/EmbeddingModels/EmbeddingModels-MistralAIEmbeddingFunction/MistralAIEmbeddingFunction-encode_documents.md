---
title: "encode_documents() | Python"
slug: /python/python/MistralAIEmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はドキュメントを受け取り、それらを vector embedding にエンコードします。 | Python"
type: docx
token: SeFLdfKVjoGX8Xx11e3cmkY4n7g
sidebar_position: 1
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
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

この操作はドキュメントを受け取り、それらを vector embedding にエンコードします。

## Request syntax\{#request-syntax}

```python
encode_documents(
    documents: List[str], 
) -> List[np.array]
```

**PARAMETERS:**

- **documents** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるドキュメントを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**RETURN TYPE:**

*List[np.array]*

**RETURNS:**

各要素が NumPy array であるリストです。

**Exceptions:**

- **ValueError**

    `api_key` が指定されておらず、`MISTRALAI_API_KEY` 環境変数も設定されていない場合に、この例外が発生します。

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

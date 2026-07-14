---
title: "MGTEEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-MGTEEmbeddingFunction
sidebar_label: "MGTEEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MGTEEmbeddingFunction は pymilvus のクラスで、MGTE embedding model を使用してテキストを embeddings にエンコードし、Milvus での embedding retrieval をサポートします。 | Python"
type: docx
token: OF1mdh4tSo8ZQQxxVgEcdITRndb
sidebar_position: 3
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - MGTEEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# MGTEEmbeddingFunction

MGTEEmbeddingFunction は pymilvus のクラスで、MGTE embedding model を使用してテキストを embeddings にエンコードし、Milvus での embedding retrieval をサポートします。

```python
pymilvus.model.hybrid.MGTEEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに MGTEEmbeddingFunction を構築します。

```python
MGTEEmbeddingFunction(
    model_name: str = "Alibaba-NLP/gte-multilingual-base",
    batch_size: int = 16,
    device: str = "",
    normalize_embeddings: bool = True,
    dimensions: Optional[int] = None,
    use_fp16: bool = False,
    return_dense: bool = True,
    return_sparse: bool = True,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコードに使用する GTE embedding model の名前。デフォルト値は `Alibaba-NLP/gte-multilingual-base` です。詳細については、[Models](https://huggingface.co/Alibaba-NLP) を参照してください。

- **batch_size** (*int*)

    エンコードに使用する batch size。

- **device** (*string*)

    model に使用するデバイス。

- **normalize_embeddings** (*bool*)

    dense embeddings を正規化するかどうか。

- **dimensions** (*int*)

    dense embeddings の次元数。指定しない場合は、model のデフォルト hidden size が使用されます。

- **use_fp16** (*bool*)

    16-bit floating point precision を使用するかどうか。

- **return_dense** (*bool*)

    dense embeddings を返すかどうか。

- **return_sparse** (*bool*)

    sparse embeddings を返すかどうか。

- **kwargs**

    model の初期化に追加のキーワード引数を渡せます。

## Examples\{#examples}

```python
from pymilvus.model.hybrid import MGTEEmbeddingFunction

ef = MGTEEmbeddingFunction(
    model_name="Alibaba-NLP/gte-multilingual-base",
)
```

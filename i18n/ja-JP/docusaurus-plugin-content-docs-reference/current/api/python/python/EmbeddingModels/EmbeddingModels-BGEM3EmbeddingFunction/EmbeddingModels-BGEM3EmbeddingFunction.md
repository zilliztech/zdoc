---
title: "BGEM3EmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-BGEM3EmbeddingFunction
sidebar_label: "BGEM3EmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "BGEM3EmbeddingFunction は pymilvus のクラスで、BGE M3 モデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートします。 | Python"
type: docx
token: XYSVdCqCDoJ9Y5xqKEAceYkpnnh
sidebar_position: 1
keywords: 
  - Milvus とは
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - BGEM3EmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# BGEM3EmbeddingFunction

**BGEM3EmbeddingFunction** は pymilvus のクラスで、BGE M3 モデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートします。

```python
pymilvus.model.hybrid.BGEM3EmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに BGEM3EmbeddingFunction を構築します。

```python
BGEM3EmbeddingFunction(
    model_name: str = "BAAI/bge-m3",
    batch_size: int = 16,
    device: str = "",
    normalize_embeddings: bool = True,
    use_fp16: bool = True,
    return_dense: bool = True,
    return_sparse: bool = True,
    return_colbert_vecs: bool = False,
    **kwargs,
)
```

**PARAMETERS:**

- **model_name** (*string*) -

    エンコードに使用するモデルの名前です。デフォルト値は **BAAI/bge-m3** です。

- **batch_size** (*int*) -

    計算に使用される batch size です。

- **device** (*string*) -

    使用するデバイスです。CPU には **cpu**、n 番目の GPU デバイスには **cuda:n** を指定します。

- **normalize_embeddings** (*bool*) -

    埋め込みベクトルを単位長に正規化するかどうかです。

- **use_fp16** (*bool*) -

    16 ビット浮動小数点精度（fp16）を使用するかどうかです。**device** が **cpu** の場合は **False** を指定します。

- **return_dense** (*bool*) -

    密な埋め込みベクトルを返すかどうかです。 

- **return_sparse** (*bool*) -

    疎な埋め込みベクトルを返すかどうかです。

- **return_colbert_vecs** (*bool*) -

    ColBERT スタイルの文脈化された埋め込みベクトルを返すかどうかです。

- **&ast;&ast;kwargs**

    追加のキーワード引数をモデルの初期化に渡せます。詳細については、[bge_m3](https://github.com/FlagOpen/FlagEmbedding/blob/master/FlagEmbedding/bge_m3.py) を参照してください。

## Examples\{#examples}

```python
from pymilvus import model

bge_m3_ef = model.hybrid.BGEM3EmbeddingFunction(
    model_name='BAAI/bge-m3', # Specify t`he model name
    device='cpu', # Specify the device to use, e.g., 'cpu' or 'cuda:0'
    use_fp16=False # Whether to use fp16. `False` for `device='cpu'`.
)
```


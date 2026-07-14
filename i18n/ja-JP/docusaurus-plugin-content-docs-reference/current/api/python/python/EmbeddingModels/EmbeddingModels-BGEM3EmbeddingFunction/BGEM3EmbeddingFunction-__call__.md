---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/BGEM3EmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "BGEM3EmbeddingFunction におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: K7qWdSwtNo976VxcvopczGLjnLf
sidebar_position: 4
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - zilliz
  - zilliz cloud
  - cloud
  - \_\_call\_\_()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

[BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

BGEM3EmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./BGEM3EmbeddingFunction-encode_documents) および [encode_queries()](./BGEM3EmbeddingFunction-encode_queries) と同じ機能を共有しています。

## リクエスト構文\{#request-syntax}

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

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるテキストを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**RETURN TYPE:**

*Dict*

**RETURNS:**

ドキュメント埋め込みを含む辞書です。

[BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) の初期化時に、**return_dense**、**return_sparse**、および **return_colbert_vecs** が **True** に設定されている場合、返される辞書には **dense**、**sparse**、および **colbert_vecs** のキーが含まれ、それぞれ対応する dense embeddings、sparse word embeddings、および ColBERT vectors が格納されます。

**Exceptions:**

- **ImportError**

    この例外は、FlagEmbedding モジュールがインストールされていない場合に発生します。

## 例\{#examples}

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

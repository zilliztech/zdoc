---
title: "encode_documents() | Python"
slug: /python/python/BGEM3EmbeddingFunction-encode_documents
sidebar_label: "encode_documents()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はドキュメントを受け取り、それらをベクトル埋め込みにエンコードします。 | Python"
type: docx
token: Q0rYdTPkEoRZgUx99LCcfMDUnvh
sidebar_position: 2
keywords: 
  - マルチモーダル RAG
  - llm ハルシネーション
  - ハイブリッド検索
  - 語彙検索
  - zilliz
  - zilliz cloud
  - クラウド
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
) -> Dict
```

**PARAMETERS:**

- **documents** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるドキュメントを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**RETURN TYPE:**

*Dict*

**RETURNS:**

ドキュメント埋め込みを含む辞書。

[BGEM3EmbeddingFunction](./EmbeddingModels-BGEM3EmbeddingFunction) を初期化する際に、**return_dense**、**return_sparse**、**return_colbert_vecs** が **True** に設定されている場合、返される辞書には **dense**、**sparse**、**colbert_vecs** のキーが含まれ、それぞれ対応する dense embeddings、sparse word embeddings、ColBERT vectors が格納されます。

**Exceptions:**

- **ImportError**

    FlagEmbedding モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

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

docs_embeddings = bge_m3_ef.encode_documents(docs)

# Print embeddings
print("Embeddings:", docs_embeddings)
# Print dimension of dense embeddings
print("Dense document dim:", bge_m3_ef.dim["dense"], docs_embeddings["dense"][0].shape)
# Since the sparse embeddings are in a 2D csr_array format, we convert them to a list for easier manipulation.
print("Sparse document dim:", bge_m3_ef.dim["sparse"], list(docs_embeddings["sparse"])[0].shape)

# Embeddings: {'dense': [array([-0.02505937, -0.00142193,  0.04015467, ..., -0.02094924,
#         0.02623661,  0.00324098], dtype=float32), array([ 0.00118463,  0.00649292, -0.00735763, ..., -0.01446293,
#         0.04243685, -0.01794822], dtype=float32), array([ 0.00415287, -0.0101492 ,  0.0009811 , ..., -0.02559666,
#         0.08084674,  0.00141647], dtype=float32)], 'sparse': <3x250002 sparse array of type '<class 'numpy.float32'>'
#   with 43 stored elements in Compressed Sparse Row format>}
# Dense document dim: 1024 (1024,)
# Sparse document dim: 250002 (1, 250002)
```

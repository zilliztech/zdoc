---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/Model2VecEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: WJpVd6gQzoxCEUxM93ScXsL5ntA
sidebar_position: 4
keywords: 
  - Chroma ベクトルデータベース
  - nlp 検索
  - hallucinations llm
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - \_\_call\_\_()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# \_\_call\_\_()

[Model2VecEmbeddingFunction](./EmbeddingModels-Model2VecEmbeddingFunction) におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

Model2VecEmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./Model2VecEmbeddingFunction-encode_documents) および [encode_queries()](./Model2VecEmbeddingFunction-encode_queries) と同じ機能を持ちます。

## リクエスト構文\{#request-syntax}

```python
# Instance created
model2vec_ef = Model2VecEmbeddingFunction()

# __call__ method will be called
model2vec_ef(
    texts: List[str]
) -> List[np.array]
```

**パラメータ:**

- **texts** (*List[str]*)

    文字列値のリストで、各文字列はエンコードのために埋め込みモデルに渡されるテキストを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

- **ImportError**

    `model2vec` モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

model2vec_ef = Model2VecEmbeddingFunction(
    model_source="minishlab/potion-base-8M" # Specify the model source (loads from Hugging Face or local path)
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

model2vec_ef(docs)

# [array([ 0.02220882,  0.11436888, -0.15094341,  0.08149259,  0.20425692,
#       -0.15727402, -0.25320682, -0.00669029,  0.03157463,  0.08974048,
#       -0.00148778, -0.01803541,  0.00230828, -0.0137875 , -0.19242321,
#       -2.64913328e-02,  1.35472575e-02, -5.33258542e-02,  2.47090831e-02,
# ...
#       -4.66700038e-03,  9.53254756e-03,  1.12857306e-02, -2.91118585e-02,
#       -7.29782460e-03, -2.15345751e-02, -4.13905866e-02,  3.70773636e-02,
#        5.45082428e-02,  1.36436718e-02,  1.38598625e-02,  3.91175086e-03],
#      dtype=float32)]
```


---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/OnnxEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "OnnxEmbeddingFunction におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: PlzSdJTGnoFVH6xSlS6cYBHZnph
sidebar_position: 4
keywords: 
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - Vector embeddings
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

[OnnxEmbeddingFunction](./EmbeddingModels-OnnxEmbeddingFunction) におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

OnnxEmbeddingFunction の `call` メソッドは、[encode_documents()](./OnnxEmbeddingFunction-encode_documents) および [encode_queries()](./OnnxEmbeddingFunction-encode_queries) と同じ機能を持ちます。

## リクエスト構文\{#request-syntax}

```python
# Instance created
onnx_ef = OnnxEmbeddingFunction()

# __call__ method will be called
onnx_ef(
    texts: List[str]
) -> List[np.array]
```

**パラメーター:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために埋め込みモデルに渡されるテキストを表します。モデルは、リスト内の各文字列に対して埋め込みベクトルを生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

*None*

## 例\{#examples}

```python
from pymilvus.model.dense import OnnxEmbeddingFunction

onnx_ef = OnnxEmbeddingFunction(
    model_name="GPTCache/paraphrase-albert-onnx", # Defaults to `GPTCache/paraphrase-albert-onnx`
    tokenizer_name="GPTCache/paraphrase-albert-small-v2" # Defaults to `GPTCache/paraphrase-albert-small-v2`
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

onnx_ef(docs)

# [array([ 1.07279094e-02, -3.58951056e-02,  1.87497448e-02,  1.63487596e-02,
#          3.65169223e-02,  3.58818956e-03, -4.00472457e-04,  2.85293215e-02,
#          2.27457494e-03,  1.83626742e-03,  4.22583687e-03,  2.71739219e-02,
# ...
#         -1.82832424e-02,  4.70027002e-02, -8.62051580e-02, -5.58088603e-03,
#         -7.23840262e-02,  5.29176208e-02,  3.04039875e-02,  6.54351067e-02,
#          4.97930995e-02,  4.34017292e-02, -4.95981596e-02,  2.43449939e-02,
#          1.97417933e-02,  2.92120624e-02, -4.64168786e-02,  3.49774291e-03,
#          7.58170658e-02, -5.85279444e-02, -7.13737298e-03, -4.12926800e-02])]
```

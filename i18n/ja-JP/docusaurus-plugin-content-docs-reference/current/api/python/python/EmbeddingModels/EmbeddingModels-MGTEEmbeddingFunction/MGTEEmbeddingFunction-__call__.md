---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/MGTEEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MGTEEmbeddingFunction におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。 | Python"
type: docx
token: L4PUdEhrpoS1Q5xN3m2chVVEnWg
sidebar_position: 4
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
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

[MGTEEmbeddingFunction](./EmbeddingModels-MGTEEmbeddingFunction) におけるこの操作は、テキスト文字列のリストを受け取り、それらを直接ベクトル埋め込みにエンコードします。

MGTEEmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./MGTEEmbeddingFunction-encode_documents) および [encode_queries()](./MGTEEmbeddingFunction-encode_queries) と同じ機能を持ちます。

## リクエスト構文\{#request-syntax}

```python
# Instance created

ef = MGTEEmbeddingFunction()

# __call__ method will be called
ef(
    texts: List[str]
) -> Dict
```

**パラメータ:**

- **texts** (*List[str]*)

    文字列値のリストで、各文字列はエンコードのために embedding model に渡されるテキストを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**戻り値の型:**

*Dict*

**戻り値:**

エンコードされた埋め込み（dense と sparse の両方）を含む辞書。

**例外:**

*None*

## 例\{#examples}

```python
from pymilvus.model.hybrid import MGTEEmbeddingFunction

ef = MGTEEmbeddingFunction()

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

ef(docs)

# {'dense': [tensor([-4.9149e-03,  1.6553e-02, -9.5524e-03, -2.1800e-02,  1.2075e-02,
#          1.8500e-02, -3.0632e-02,  5.5909e-02,  8.7365e-02,  1.8763e-02,
#          2.1708e-03, -2.7530e-02, -1.1523e-01,  6.5810e-03, -6.4674e-02,
#          6.7966e-02,  1.3005e-01,  1.1942e-01, -1.2174e-02, -4.0426e-02,
#          ...
#          2.0129e-02, -2.3657e-02,  2.2626e-02,  2.1858e-02, -1.9181e-02,
#          6.0706e-02, -2.0558e-02, -4.2050e-02], device='mps:0')], 'sparse': <Compressed Sparse Row sparse array of dtype 'float64'
#         with 41 stored elements and shape (3, 250002)>}
```

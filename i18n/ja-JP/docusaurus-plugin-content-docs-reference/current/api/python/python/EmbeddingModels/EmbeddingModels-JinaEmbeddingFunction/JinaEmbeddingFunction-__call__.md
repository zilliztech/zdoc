---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/JinaEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaEmbeddingFunction のこの操作は、テキスト文字列のリストを受け取り、それらを直接 vector embeddings にエンコードします。 | Python"
type: docx
token: Yf9GddNheoKrFCxcUeYc7NHjnVb
sidebar_position: 4
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
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

[JinaEmbeddingFunction](./EmbeddingModels-JinaEmbeddingFunction) のこの操作は、テキスト文字列のリストを受け取り、それらを直接 vector embeddings にエンコードします。

JinaEmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./JinaEmbeddingFunction-encode_documents) および [encode_queries()](./JinaEmbeddingFunction-encode_queries) と同じ機能を持ちます。

## リクエスト構文\{#request-syntax}

```python
# Instance created

jina_ef = JinaEmbeddingFunction()

# __call__ method will be called
jina_ef(
    texts: List[str]
) -> List[np.array]
```

**パラメータ:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるテキストを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy array であるリストです。

**例外:**

- **RuntimeError**

    Jina API からのレスポンスに `data` キーが含まれていない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import JinaEmbeddingFunction

jina_ef = JinaEmbeddingFunction(
    model_name="jina-embeddings-v2-base-en", # Defaults to `jina-embeddings-v2-base-en`
    api_key="YOUR_JINAAI_API_KEY" # Provide your Jina AI API key
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

jina_ef(docs)

# [array([-4.88487840e-01, -4.28095880e-01,  4.90086500e-01, -1.63274320e-01,
#          3.43437800e-01,  3.21476880e-01,  2.83173790e-02, -3.10403670e-01,
#          4.76985040e-01, -1.77410420e-01, -3.84803180e-01, -2.19224200e-01,
# ...
#          1.09233186e-01, -6.33286400e-01,  4.29109450e-01,  2.58604170e-01,
#         -9.05579500e-01,  2.96900120e-02,  4.06175500e-01,  6.30184400e-01,
#         -2.04462400e-01,  7.14229800e-01, -1.66823000e-01,  8.72551440e-01,
#          5.53560140e-01,  8.92506300e-01, -2.39408610e-01, -4.22413560e-01,
#         -3.19551350e-01,  5.59153850e-01,  2.44338100e-01, -8.60452100e-01])]
```

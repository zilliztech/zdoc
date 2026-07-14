---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/MistralAIEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "MistralAIEmbeddingFunction のこの操作は、テキスト文字列のリストを受け取り、それらを直接 vector embeddings にエンコードします。 | Python"
type: docx
token: Z23IddhHhom7AyxDMXecLORVnDh
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

[MistralAIEmbeddingFunction](./EmbeddingModels-MistralAIEmbeddingFunction) のこの操作は、テキスト文字列のリストを受け取り、それらを直接 vector embeddings にエンコードします。

MistralAIEmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./MistralAIEmbeddingFunction-encode_documents) および [encode_queries()](./MistralAIEmbeddingFunction-encode_queries) と同じ機能を共有します。

## リクエスト構文\{#request-syntax}

```python
# インスタンスを作成済み

ef = MistralAIEmbeddingFunction()

# __call__ メソッドが呼び出されます
ef(
    texts: List[str]
) -> List[np.array]
```

**パラメータ:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるテキストを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**戻り値の型:**

*List[np.array]*

**戻り値:**

各要素が NumPy 配列であるリストです。

**例外:**

- **ValueError**

    `api_key` が指定されておらず、`MISTRALAI_API_KEY` 環境変数も設定されていない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus.model.dense import MistralAIEmbeddingFunction

ef = MistralAIEmbeddingFunction(
    model_name="mistral-embed", # デフォルトは `mistral-embed`
    api_key="MISTRAL_API_KEY" # Mistral AI API key を指定します
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

ef(docs)

# [array([-0.06051636,  0.03207397,  0.04684448, ..., -0.01618958,
#         0.02442932, -0.01302338]), array([-0.04675293,  0.06512451,  0.04290771, ..., -0.01454926,
#         0.0014801 ,  0.00686646]), array([-0.05978394,  0.08728027,  0.02217102, ..., -0.00681305,
#         0.03634644, -0.01802063])]
```

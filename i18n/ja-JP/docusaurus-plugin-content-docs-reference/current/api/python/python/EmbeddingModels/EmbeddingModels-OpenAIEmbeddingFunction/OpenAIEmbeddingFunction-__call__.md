---
title: "\\_\\_call\\_\\_() | Python"
slug: /python/python/OpenAIEmbeddingFunction-__call__
sidebar_label: "__call__()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "OpenAIEmbeddingFunction のこの操作は、テキスト文字列のリストを受け取り、それらを直接 vector embeddings にエンコードします。 | Python"
type: docx
token: FieTdj7WDoVbBVxp5xjcqO02nrh
sidebar_position: 4
keywords: 
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
  - rag vector database
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

[OpenAIEmbeddingFunction](./EmbeddingModels-OpenAIEmbeddingFunction) のこの操作は、テキスト文字列のリストを受け取り、それらを直接 vector embeddings にエンコードします。

OpenAIEmbeddingFunction の **\_\_call\_\_()** メソッドは、[encode_documents()](./OpenAIEmbeddingFunction-encode_documents) および [encode_queries()](./OpenAIEmbeddingFunction-encode_queries) と同じ機能を持ちます。

## リクエスト構文\{#request-syntax}

```python
# Instance created
openai_ef = OpenAIEmbeddingFunction()

# __call__ method will be called
openai_ef(
    texts: List[str]
) -> List[np.array]
```

**PARAMETERS:**

- **texts** (*List[str]*)

    文字列値のリストです。各文字列は、エンコードのために embedding model に渡されるテキストを表します。モデルは、リスト内の各文字列に対して embedding vector を生成します。

**RETURN TYPE:**

*List[np.array]*

**RETURNS:**

各要素が NumPy 配列であるリストです。

**Exceptions:**

- **ImportError**

    OpenAI モジュールがインストールされていない場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import model

openai_ef = model.dense.OpenAIEmbeddingFunction(
    model_name='text-embedding-3-large', # Specify the model name
    dimensions=512 # Set the embedding dimensionality according to MRL feature.
)

docs = [
    "Artificial intelligence was founded as an academic discipline in 1956.",
    "Alan Turing was the first person to conduct substantial research in AI.",
    "Born in Maida Vale, London, Turing was raised in southern England.",
]

openai_ef(docs)

# [array([ 1.77358780e-02, -2.06100717e-02, -1.10160727e-02, -5.27569763e-02,
#          4.22616638e-02, -6.68976083e-03,  4.18110052e-03,  1.04632668e-01,
# ...
#          3.78031246e-02, -4.20645699e-02, -4.66991328e-02, -3.67034003e-02,
#         -2.61381622e-02, -7.74914995e-02,  1.88917443e-02,  2.48224158e-02,
#         -8.93921182e-02,  6.78001530e-03,  3.54858451e-02, -5.09016626e-02,
#          3.80731490e-03,  4.72489968e-02,  2.11893879e-02,  9.96136945e-03,
#         -5.77749610e-02,  9.73062310e-03,  4.63456511e-02, -4.32428494e-02])]
```


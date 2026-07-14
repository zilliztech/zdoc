---
title: "BGERerankFunction | Python"
slug: /python/python/Rerankers-BGERerankFunction
sidebar_label: "BGERerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "BGERerankFunction は milvusmodel のクラスで、query と document を入力として受け取り、embeddings ではなく類似度スコアを直接返します。この機能は基盤となる BGE reranking モデルを使用します。 | Python"
type: docx
token: GxAZd9O9gozzhExhMHWcMnXPngh
sidebar_position: 1
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - BGERerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# BGERerankFunction

**BGERerankFunction** は [milvus_model](https://github.com/milvus-io/milvus-model) のクラスで、query と document を入力として受け取り、embeddings ではなく類似度スコアを直接返します。この機能は基盤となる BGE reranking モデルを使用します。

```python
pymilvus.model.reranker.BGERerankFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの BGERerankFunction を構築します。

```python
BGERerankFunction(
    model_name: str = "BAAI/bge-reranker-v2-m3",
    use_fp16: bool = True,
    batch_size: int = 32,
    normalize: bool = True,
    device: Optional[str] = None,
)
```

**PARAMETERS:**

- **model_name** (*string*) -

    使用するモデルの名前。利用可能な任意の BGE reranker モデル名を指定できます。たとえば、`BAAI/bge-reranker-base`、`BAAI/bge-reranker-large` などです。このパラメータを指定しない場合は、`BAAI/bge-reranker-v2-m3` が使用されます。利用可能なモデルの一覧については、[Model List](https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/llm_reranker#model-list) を参照してください。

- **use_fp16** (*bool*) -

    16-bit 浮動小数点精度（fp16）を使用するかどうか。`device` が `cpu` の場合、この値は `false` です。

- **batch_size** (*int*) -

    計算に使用される batch size。

- **normalize** (*bool*)

    reranking スコアを正規化するかどうか。

- **device** (*string*) -

    オプション。モデルの実行に使用するデバイス。指定しない場合、モデルは CPU 上で実行されます。CPU には `cpu`、n 番目の GPU デバイスには `cuda:n` を指定できます。

## Examples\{#examples}

```python
from pymilvus.model.reranker import BGERerankFunction

# Define the rerank function
bge_rf = BGERerankFunction(
    model_name="BAAI/bge-reranker-v2-m3",  # Specify the model name. Defaults to `BAAI/bge-reranker-v2-m3`.
    device="cpu" # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)
```

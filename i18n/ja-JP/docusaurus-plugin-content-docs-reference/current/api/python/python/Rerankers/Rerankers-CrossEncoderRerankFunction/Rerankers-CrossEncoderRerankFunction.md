---
title: "CrossEncoderRerankFunction | Python"
slug: /python/python/Rerankers-CrossEncoderRerankFunction
sidebar_label: "CrossEncoderRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CrossEncoderRerankFunction は milvusmodel のクラスで、クエリとドキュメントを入力として受け取り、embedding ではなく類似度スコアを直接返します。この機能は基盤となる Cross-Encoder reranking モデルを使用します。 | Python"
type: docx
token: HVGNdMYOvojQoXxvDmEcnHYanMh
sidebar_position: 1
keywords: 
  - マネージド vector database
  - Pinecone vector database
  - 音声検索
  - semantic search とは
  - zilliz
  - zilliz cloud
  - cloud
  - CrossEncoderRerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CrossEncoderRerankFunction

**CrossEncoderRerankFunction** は [milvus_model](https://github.com/milvus-io/milvus-model) のクラスで、クエリとドキュメントを入力として受け取り、embedding ではなく類似度スコアを直接返します。この機能は基盤となる Cross-Encoder reranking モデルを使用します。

```python
pymilvus.model.reranker.CrossEncoderRerankFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの CrossEncoderRerankFunction を構築します。

```python
CrossEncoderRerankFunction(
    model_name: str = "",
    device: str = "",
    batch_size: int = 32,
    activation_fct: Any = None,
    **kwargs,
)
```

**Parameters**:

- **model_name** (*string*)

    使用するモデルの名前です。利用可能な任意の Cross-Encoder モデル名を指定できます。たとえば、`cross-encoder/ms-marco-TinyBERT-L-2-v2`、`cross-encoder/ms-marco-MiniLM-L-2-v2` などです。このパラメータを指定しない場合は、空文字列が使用されます。利用可能なモデルの一覧については、[Pretrained Cross-Encoders](https://www.sbert.net/docs/pretrained_cross-encoders.html) を参照してください。

- **device** (*string*)

    モデルの実行に使用するデバイスです。CPU には `cpu`、n 番目の GPU デバイスには `cuda:n` を指定できます。

- **batch_size** (*int*)

    計算に使用するバッチサイズです。

- **activation_fct**

    モデルの logits 出力の上に適用される活性化関数です。

- **&ast;&ast;kwargs**

    モデル初期化に追加のキーワード引数を渡せます。詳細については、[cross_encoder](https://www.sbert.net/docs/package_reference/cross_encoder.html#cross-encoder) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.reranker import CrossEncoderRerankFunction

# Define the rerank function
ce_rf = CrossEncoderRerankFunction(
    model_name="cross-encoder/ms-marco-MiniLM-L-6-v2",  # Specify the model name. Defaults to an emtpy string.
    device="cpu" # Specify the device to use, e.g., 'cpu' or 'cuda:0'
)
```

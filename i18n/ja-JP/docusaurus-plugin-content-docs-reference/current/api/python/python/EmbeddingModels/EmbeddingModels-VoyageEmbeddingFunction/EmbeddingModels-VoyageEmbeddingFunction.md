---
title: "VoyageEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-VoyageEmbeddingFunction
sidebar_label: "VoyageEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "VoyageEmbeddingFunction は pymilvus のクラスで、Voyage モデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートします。 | Python"
type: docx
token: HEyLd2lxzo3bl4xqVBOco8vWn1c
sidebar_position: 3
keywords: 
  - 管理型 vector database
  - Pinecone vector database
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - クラウド
  - VoyageEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VoyageEmbeddingFunction

**VoyageEmbeddingFunction** は pymilvus のクラスで、Voyage モデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートします。

```python
pymilvus.model.dense.VoyageEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの VoyageEmbeddingFunction を構築します。

```python
VoyageEmbeddingFunction(
    model_name: str = "voyage-2",
    api_key: Optional[str] = None,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコードに使用する Voyage モデルの名前です。利用可能な Voyage モデル名であれば、`voyage-law-2`、`voyage-code-2` など任意のものを指定できます。このパラメータを指定しない場合は、`voyage-2` が使用されます。利用可能なモデルの一覧については、[Voyage 公式ドキュメント](https://docs.voyageai.com/docs/embeddings) を参照してください。

- **api_key** (*string*)

    Voyage API にアクセスするための API key です。API key の作成方法については、[API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation) を参照してください。

- **kwargs**

    追加のキーワード引数をモデルの初期化に渡せます。詳細については、[Python API](https://docs.voyageai.com/docs/embeddings#python-api) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.dense import VoyageEmbeddingFunction

voyage_ef = VoyageEmbeddingFunction(
    model_name="voyage-lite-02-instruct", # Defaults to `voyage-2`
    api_key='YOUR_API_KEY' # Replace with your own Voyage API key
)
```

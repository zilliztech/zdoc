---
title: "OpenAIEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-OpenAIEmbeddingFunction
sidebar_label: "OpenAIEmbeddingFunction"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "OpenAIEmbeddingFunction は、OpenAI モデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートする pymilvus のクラスです。 | Python"
type: docx
token: QPcodlsnAoSMvIxEFmlcMNPbntd
sidebar_position: 3
keywords: 
  - 非構造化データ
  - vector database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - OpenAIEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# OpenAIEmbeddingFunction

**OpenAIEmbeddingFunction** は、OpenAI モデルを使用してテキストを埋め込みにエンコードし、Milvus での埋め込み検索をサポートする pymilvus のクラスです。

```python
pymilvus.model.dense.OpenAIEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに OpenAIEmbeddingFunction を構築します。

```python
OpenAIEmbeddingFunction(
    model_name: str = "text-embedding-ada-002", 
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    dimensions: Optional[int] = None,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*) -

    エンコードに使用する OpenAI モデルの名前。使用可能なオプションは **text-embedding-3-small**、**text-embedding-3-large**、および **text-embedding-ada-002**（デフォルト）です。

- **api_key** (*string*) -

    OpenAI API にアクセスするための API key。指定しない場合、コードはフォールバックとして環境変数から API key を確認します。

- **base_url** (*string*) -

    テキストを埋め込みにエンコードするために使用する OpenAI API エンドポイントのベース URL。値のデフォルトは **None** で、この場合はデフォルトのエンドポイントにある公開 OpenAI API サーバーを使用します。

- **dimensions** (*int*) -

    出力される埋め込みが持つべき次元数。**text-embedding-3** 以降のモデルでのみサポートされます。

- **&ast;&ast;kwargs**

    追加のキーワード引数をモデルの初期化に渡せます。詳細については、[Client](https://github.com/openai/openai-python/blob/main/src/openai/_client.py) を参照してください。

## Examples\{#examples}

```python
from pymilvus import model

openai_ef = model.dense.OpenAIEmbeddingFunction(
    model_name='text-embedding-3-large', # モデル名を指定します
    dimensions=512 # MRL 機能に応じて埋め込みの次元数を設定します。
)
```


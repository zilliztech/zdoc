---
title: "NomicEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-NomicEmbeddingFunction
sidebar_label: "NomicEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "NomicEmbeddingFunction は、Milvus での埋め込み検索をサポートするために、Nomic 埋め込みモデルを使用してテキストを埋め込みにエンコードする処理を行う pymilvus のクラスです。 | Python"
type: docx
token: OOQvdXDqdoqKfmxEkTecfuVMnsb
sidebar_position: 3
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - NomicEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# NomicEmbeddingFunction

NomicEmbeddingFunction は、Milvus での埋め込み検索をサポートするために、Nomic 埋め込みモデルを使用してテキストを埋め込みにエンコードする処理を行う pymilvus のクラスです。

```python
pymilvus.model.dense.NomicEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの NomicEmbeddingFunction を構築します。

```python
NomicEmbeddingFunction(
    model_name: str = "nomic-embed-text-v1.5",
    task_type: str = "search_document",
    dimensions: int = 768,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコードに使用する Nomic 埋め込みモデルの名前です。デフォルト値は `nomic-embed-text-v1.5` です。詳細については、[Nomic 公式ドキュメント](https://docs.nomic.ai/atlas/models/image-embedding) を参照してください。

- **task_type** (*string*)

    モデルが使用されるタスクの種類です。

- **dimensions** (*int*)

    出力埋め込みの次元数です。

- **kwargs**

    - **long_text_mode** (*string*)

        モデルが受け付けられる長さを超えるテキストをどのように処理するかを指定します。`mean` または `truncate` のいずれかです。

## Examples\{#examples}

```python
from pymilvus.model.dense import NomicEmbeddingFunction

ef = NomicEmbeddingFunction(
    model_name="nomic-embed-text-v1.5", # Defaults to `mistral-embed`
)
```

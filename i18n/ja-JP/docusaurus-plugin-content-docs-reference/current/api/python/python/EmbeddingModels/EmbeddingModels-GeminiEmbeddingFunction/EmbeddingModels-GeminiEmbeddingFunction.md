---
title: "GeminiEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-GeminiEmbeddingFunction
sidebar_label: "GeminiEmbeddingFunction"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Model2VecEmbeddingFunction は、GeminiEmbeddingFunction モジュールを使用してテキストを embeddings にエンコードし、Milvus での embedding 取得をサポートする pymilvus のクラスです。 | Python"
type: docx
token: DhZRdYbfMoYIBtxrudGcwWjrngd
sidebar_position: 3
keywords: 
  - Faiss
  - 動画検索
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - GeminiEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# GeminiEmbeddingFunction

**[Model2VecEmbeddingFunction](./EmbeddingModels-Model2VecEmbeddingFunction)** は、GeminiEmbeddingFunction モジュールを使用してテキストを embeddings にエンコードし、Milvus での embedding 取得をサポートする pymilvus のクラスです。

```python
pymilvus.model.dense.GeminiEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けの GeminiEmbeddingFunction を構築します。

```python
GeminiEmbeddingFunction(
    model_name: str = "gemini-embedding-exp-03-07",
    api_key: Optional[str] = None,
    config: Optional['types.EmbedContentConfig']=None,
    **kwargs,
)
```

**PARAMETERS:**

- **model_name (string) -**

    エンコードに使用する Gemini モデルの名前。有効なオプションは **gemini-embedding-exp-03-07**（デフォルト）、**models/embedding-001**、および **models/text-embedding-004** です。

- **api_key (*string*)-**

Gemini API にアクセスするための API key。

- **config** **(*types.EmbedContentConfig*) -**

    embedding モデルのオプション設定。

    - **output_dimensionality** では、生成される出力 embeddings の数を指定できます。

        | **Model Name** | **Dimensions** |
        | --- | --- |
        | emini-embedding-exp-03-07 | 3072(*default*),1536,768 |
        | models/embedding-001 | 768 |
        | models/text-embedding-004 | 768 |

    - **task_type** では、特定のタスク向けに最適化された embeddings の生成を指定でき、時間とコストを節約しつつパフォーマンスを向上できます。**gemini-embedding-exp-03-07** モデルでのみサポートされます。

        | Task Type | Description |
        | --- | --- |
        | SEMANTIC_SIMILARITY | テキストの類似性を評価するために最適化された embeddings を生成するために使用されます。 |
        | CLASSIFICATION | 事前設定されたラベルに従ってテキストを分類するために最適化された embeddings を生成するために使用されます。 |
        | CLUSTERING | 類似性に基づいてテキストをクラスタリングするために最適化された embeddings を生成するために使用されます。 |
        | RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, QUESTION_ANSWERING, and FACT_VERIFICATION | ドキュメント検索または情報検索向けに最適化された embeddings を生成するために使用されます。 |
        | CODE_RETRIEVAL_QUERY | sort an array や reverse a linked list のような自然言語クエリに基づいてコードブロックを取得するために使用されます。コードブロックの embeddings は RETRIEVAL_DOCUMENT を使用して計算されます。 |

## Examples\{#examples}

```python
from pymilvus import model

gemini_ef = model.dense.GeminiEmbeddingFunction(
    model_name="gemini-embedding-exp-03-07",
    api_key="YOUR_API_KEY",
)
```


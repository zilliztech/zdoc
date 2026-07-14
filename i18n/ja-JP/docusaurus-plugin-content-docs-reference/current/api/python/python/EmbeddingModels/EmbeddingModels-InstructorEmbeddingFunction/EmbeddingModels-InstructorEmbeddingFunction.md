---
title: "InstructorEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-InstructorEmbeddingFunction
sidebar_label: "InstructorEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "InstructorEmbeddingFunction は、Milvus での embedding 検索をサポートするために、Instructor embedding モデルを使用してテキストを embeddings にエンコードする処理を行う pymilvus のクラスです。 | Python"
type: docx
token: YmnmdEeHFoctZexccqNcr8xXn8c
sidebar_position: 3
keywords: 
  - 音声検索
  - セマンティック検索とは
  - Embedding モデル
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - InstructorEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# InstructorEmbeddingFunction

InstructorEmbeddingFunction は、Milvus での embedding 検索をサポートするために、Instructor embedding モデルを使用してテキストを embeddings にエンコードする処理を行う pymilvus のクラスです。

```python
pymilvus.model.dense.InstructorEmbeddingFunction
```

## Constructor\{#constructor}

一般的なユースケース向けに MistralAIEmbeddingFunction を構築します。

```python
InstructorEmbeddingFunction(
    model_name: str = "hkunlp/instructor-xl",
    batch_size: int = 32,
    query_instruction: str = "Represent the question for retrieval:",
    doc_instruction: str = "Represent the document for retrieval:",
    device: str = "cpu",
    normalize_embeddings: bool = True,
    **kwargs
)
```

**PARAMETERS:**

- **model_name** (*string*)

    エンコードに使用する Mistral AI embedding モデルの名前です。デフォルト値は `hkunlp/instructor-xl` です。詳細については、[Model List](https://github.com/xlang-ai/instructor-embedding?tab=readme-ov-file#model-list) を参照してください。

- **batch_size** (*int*)

    計算に使用されるバッチサイズです。各バッチでまとめて処理される文の数を決定します。

- **query_instruction** (*string*)

    クエリまたは質問に対する embedding をどのように生成するかをモデルに指示する、タスク固有の instruction です。

- **doc_instruction** (*string*)

    ドキュメントに対する embedding を生成するようモデルに指示する、タスク固有の instruction です。

- **device** (*string*)

    計算に使用する torch.device を指定します。指定しない場合、関数はデフォルトの device を使用します。

- **normalize_embeddings** (*bool*)

    `True` に設定すると、返される vector の長さは 1 になり、正規化されていることを示します。この場合、類似性検索ではコサイン類似度の代わりに、より高速なドット積 (`util.dot_score`) が使用されます。

- **kwargs**

    モデル初期化に追加のキーワード引数を渡せます。詳細については、[instructor-embedding](https://github.com/xlang-ai/instructor-embedding?tab=readme-ov-file#the-encode-function) を参照してください。

## Examples\{#examples}

```python
from pymilvus.model.dense import InstructorEmbeddingFunction

ef = InstructorEmbeddingFunction(
    model_name="hkunlp/instructor-xl", # Defaults to `hkunlp/instructor-xl`
    query_instruction="Represent the question for retrieval:",
    doc_instruction="Represent the document for retrieval:"
)
```

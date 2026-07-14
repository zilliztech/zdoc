---
title: "SemanticHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-SemanticHighlighter
sidebar_label: "SemanticHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "SemanticHighlighter は、検索結果内のテキストフィールドに対する後処理のセマンティックハイライトを設定します。正確な用語に一致する lexical highlighting とは異なり、semantic highlighting はクエリとの意味的類似性に基づいて関連するテキストセグメントを識別し、マークします。ハイライトは、カスタマイズ可能なタグを使用して一致した範囲に注釈を付けます。これは、検索、フィルタリング、ランキング、スコアリングには影響しません。 | Python | MilvusClient"
type: docx
token: SVoVdTdZRotav9xFjdFcZ8V2n3d
sidebar_position: 2
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - SemanticHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SemanticHighlighter

**SemanticHighlighter** は、検索結果内のテキストフィールドに対する後処理のセマンティックハイライトを設定します。正確な用語に一致する lexical highlighting とは異なり、semantic highlighting はクエリとの意味的類似性に基づいて関連するテキストセグメントを識別し、マークします。ハイライトは、カスタマイズ可能なタグを使用して一致した範囲に注釈を付けます。これは、検索、フィルタリング、ランキング、スコアリングには影響しません。

```python
class pymilvus.SemanticHighlighter
```

## Constructor\{#constructor}

semantic search で使用する highlighter 設定を初期化します。

```python
SemanticHighlighter(
    queries: List[str],
    input_fields: List[str],
    pre_tags: Optional[List[str]] = None,
    post_tags: Optional[List[str]] = None,
    threshold: Optional[float] = None,
    highlight_only: Optional[bool] = None,
    model_deployment_id: Optional[str] = None,
    max_client_batch_size: Optional[int] = None,
)
```

**PARAMETERS:**

- **queries** (*list[str]*) - 

    ドキュメントに対して照合する検索クエリのリストです。highlighter はこれらのクエリを使用して、結果内の意味的に関連するテキストセグメントを識別します。

- **input_fields** (*list[str]*) - 

    ハイライトするスキーマフィールドです。検索結果内のどのテキストフィールドを semantic highlighting の対象として処理するかを指定します。

- **pre_tags** (*list[str]*) - 

    返されるハイライト内で、一致した各セグメントの前に挿入されるタグです。プレーン文字列（例: `{`）または HTML-safe なマーカー（例: `<em>`, `<mark>`）をサポートします。複数のタグが指定された場合、タグは一致順に応じてローテーションされます。

- **post_tags** (*list[str]*) - 

    一致した各セグメントの後に挿入されるタグで、`pre_tags` と対になります。複数のタグが指定された場合、ローテーションは `pre_tags` と同じ順序に従います。

- **threshold** (*float*) - 

    ハイライトにおける「十分な一致」を定義する最小信頼スコア（0.0 ～ 1.0）です。semantic highlighting は top-k retrieval の後に各項目ごとに適用され、このしきい値を上回ってクエリに意味的に一致するセグメントのみが、`pre_tags`/`post_tags` を含むハイライト断片として返されます。未設定の場合、このしきい値を下回るセグメントは空の結果（`fragments=[], scores=[]`）を返します。

- **highlight_only** (*bool*) - 

    `True`（デフォルト）の場合、クエリと意味的に関連する文レベルの断片のみが返されるため、最も関連性の高いコンテキストに集中しやすくなります。`False` に設定した場合は、長さがモデルのコンテキスト制限を超えない限り、それらの断片を含む段落全体が代わりに返されます。ただし、段落全体が返される場合、`scores` フィールドはもはや意味を持ちません。

- **model_deployment_id** (*str*) - 

    semantic inference に使用されるデプロイ済みハイライトモデルの ID です。このモデルは、クエリとドキュメントセグメント間の意味的類似性をどのように計算するかを決定します。

- **max_client_batch_size** (*int*) - 

    単一バッチで処理される項目数を制限します。メモリ使用量と処理スループットの制御に役立ちます。

**RETURN TYPE:**

*SemanticHighlighter*

**RETURNS:**

SemanticHighlighter オブジェクト。

## Examples\{#examples}

dense vector search で意味的に関連するテキストをハイライトします。

```python
from pymilvus import MilvusClient, SemanticHighlighter

queries = ["When was artificial intelligence founded",
           "Where was Alan Turing born?"]

highlighter = SemanticHighlighter(
    queries,
    ["document"],
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    model_deployment_id="your-model-deployment-id",
)

results = client.search(
    collection_name="your_collection",
    data=queries,
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    highlighter=highlighter,
)
```

検索結果には、ハイライトされた断片とその信頼スコアを含む `highlight` フィールドが含まれます。

```python
# Example output:
# hit: {
#     'id': 1,
#     'distance': 0.766,
#     'entity': {'document': 'Artificial intelligence was founded as an academic discipline in 1956.'},
#     'highlight': {
#         'document': {
#             'fragments': ['<mark>Artificial intelligence was founded as an academic discipline in 1956.</mark>'],
#             'scores': [1.0]
#         }
#     }
# }
```

低信頼度のハイライトをフィルタリングするには `threshold` を使用します。

```python
from pymilvus import MilvusClient, SemanticHighlighter

highlighter = SemanticHighlighter(
    queries=["machine learning applications"],
    input_fields=["content"],
    pre_tags=["<em>"],
    post_tags=["</em>"],
    threshold=0.8,
    model_deployment_id="your-model-deployment-id",
)

results = client.search(
    collection_name="your_collection",
    data=["machine learning applications"],
    anns_field="dense",
    limit=10,
    output_fields=["content"],
    highlighter=highlighter,
)
```

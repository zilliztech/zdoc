---
title: "with_query() | Python | MilvusClient"
slug: /python/python/Highlighter-with_query
sidebar_label: "with_query()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "フィルタリング式（例: TEXTMATCH）で一致したテキストをハイライトするために、`LexicalHighlighter` 設定へクエリ語定義を追加します。これにより、どのフィールドと用語をハイライトするか、およびそれらを生成したフィルタ型を記述するエントリが `highlightquery` に1件追加されます。ハイライトは後処理として実行され、取得、フィルタリング、ランキング、スコアリングには影響しません。 | Python | MilvusClient"
type: docx
token: KdiQdpHp3oEQwNx2hd5chqQKn2D
sidebar_position: 3
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - with_query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# with_query()

フィルタリング式（例: TEXT_MATCH）で一致したテキストをハイライトするために、`LexicalHighlighter` 設定へクエリ語定義を追加します。これにより、どのフィールドと用語をハイライトするか、およびそれらを生成したフィルタ型を記述するエントリが `highlight_query` に1件追加されます。ハイライトは後処理として実行され、取得、フィルタリング、ランキング、スコアリングには影響しません。

## Request syntax\{#request-syntax}

```python
with_query(
    field: str,
    text: str,
    query_type: str
)
```

**PARAMETERS**:

- **field** (*str*) -<br/>
  一致がフィルタリング式によって検出された際に内容へ注釈を付ける対象のテキストフィールド名です。collection スキーマ内の **VARCHAR** テキストフィールドに対応している必要があります。

- **text** (*str*) -<br/>
  フィルタリング式からハイライトする用語またはフレーズです。たとえば、**"my doc"** は指定したフィールド内で **"my"** と **"doc"** の一致をハイライトします。

- **query_type** (*str*) -<br/>
  ハイライトする用語を提供するフィルタリングの種類です。テキストベースのフィルタリングでは、**TEXT_MATCH** 条件に対応する **"TextMatch"** を使用します。

**RETURNS**:

*None*

## Examples\{#examples}

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
)

highlighter.with_query(field="text", text="my doc", query_type="TextMatch")

results = client.search(
    collection_name="your_collection",
    data=["test"],
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```

---
title: "with_query() | Python | MilvusClient"
slug: /python/python/Highlighter-with_query
sidebar_label: "with_query()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "フィルタリング式（例: TEXTMATCH）で一致したテキストをハイライトするために、`LexicalHighlighter` 設定へクエリ語の定義を追加します。これにより、どのフィールドと語句をハイライトするか、およびそれらを生成したフィルタタイプを記述する 1 つのエントリが `highlightquery` に追加されます。ハイライトは後処理として実行され、取得、フィルタリング、ランキング、スコアリングには影響しません。 | Python | MilvusClient"
type: docx
token: KdiQdpHp3oEQwNx2hd5chqQKn2D
sidebar_position: 3
keywords: 
  - ベクターデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - クラウド
  - with_query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# with_query()

フィルタリング式（例: TEXT_MATCH）で一致したテキストをハイライトするために、`LexicalHighlighter` 設定へクエリ語の定義を追加します。これにより、どのフィールドと語句をハイライトするか、およびそれらを生成したフィルタタイプを記述する 1 つのエントリが `highlight_query` に追加されます。ハイライトは後処理として実行され、取得、フィルタリング、ランキング、スコアリングには影響しません。

## リクエスト構文\{#request-syntax}

```python
with_query(
    field: str,
    text: str,
    query_type: str
)
```

**PARAMETERS**:

- **field** (*str*) -<br/>
  一致がフィルタリング式によって見つかったときに、その内容へ注釈を付ける対象テキストフィールド名。collection スキーマ内の **VARCHAR** テキストフィールドに対応している必要があります。

- **text** (*str*) -<br/>
  フィルタリング式からハイライトする語句またはフレーズ。たとえば、**"my doc"** を指定すると、指定されたフィールド内で **"my"** と **"doc"** の一致がハイライトされます。

- **query_type** (*str*) -<br/>
  ハイライトする語句を提供するフィルタタイプ。テキストベースのフィルタリングでは、**TEXT_MATCH** 条件に対応する **"TextMatch"** を使用します。

**RETURNS**:

*None*

## 例\{#examples}

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

---
title: "with_query() | Python | MilvusClient"
slug: /python/python/Highlighter-with_query
sidebar_label: "with_query()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "`LexicalHighlighter` 設定にクエリ用語の定義を追加し、フィルタリング式（TEXTMATCH など）に一致したテキストをハイライトします。これにより、`highlightquery` に、ハイライトするフィールドと用語、およびそれらを生成したフィルタータイプを記述するエントリが 1 つ追加されます。ハイライトは後処理として実行され、取得、フィルタリング、ランキング、スコアリングには影響しません。 | Python | MilvusClient"
type: docx
token: SzT2dS1cko3x0RxjkAEcMJLwnlf
sidebar_position: 3
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
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

`LexicalHighlighter` 設定にクエリ用語の定義を追加し、フィルタリング式（TEXT_MATCH など）に一致したテキストをハイライトします。これにより、`highlight_query` に、ハイライトするフィールドと用語、およびそれらを生成したフィルタータイプを記述するエントリが 1 つ追加されます。ハイライトは後処理として実行され、取得、フィルタリング、ランキング、スコアリングには影響しません。

## リクエスト構文\{#request-syntax}

```python
with_query(
    field: str,
    text: str,
    query_type: str
)
```

**パラメーター:**

- **field**（*str*）-

    フィルタリング式で一致が見つかったときに、その内容に注釈を付ける対象のテキストフィールド名です。コレクションスキーマ内の VARCHAR テキストフィールドに対応している必要があります。

- **text**（*str*）-

    フィルタリング式からハイライトする用語またはフレーズです。たとえば、"my doc" を指定した場合、指定したフィールド内で "my" と "doc" の一致がハイライトされます。

- **query_type**（*str*）-

    ハイライトする用語を提供するフィルタリングタイプです。テキストベースのフィルタリングでは、TEXT_MATCH 条件に対応する "TextMatch" を使用します。

**戻り値の型:**

*with_query*

**戻り値:**

*なし*。

## 例\{#examples}

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
)

highlighter.with_query(
    field="text",
    text="my doc",
    query_type="TextMatch",
)

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

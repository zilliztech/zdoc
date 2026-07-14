---
title: "LexicalHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "LexicalHighlighter は、検索結果内のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、一致したスパンにカスタマイズ可能なタグで注釈を付け、可読性と UI レンダリングを向上させるためにフラグメントベースのスニペットを返すこともできます。これは取得、フィルタリング、ランキング、スコアリングには影響しません。 | Python | MilvusClient"
type: docx
token: DXTJdXSquo8NutxCqfBccO7pnWw
sidebar_position: 1
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - vector embeddings とは
  - zilliz
  - zilliz cloud
  - cloud
  - LexicalHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

**LexicalHighlighter** は、検索結果内のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、一致したスパンにカスタマイズ可能なタグで注釈を付け、可読性と UI レンダリングを向上させるためにフラグメントベースのスニペットを返すこともできます。これは取得、フィルタリング、ランキング、スコアリングには影響しません。

```python
class pymilvus.LexicalHighlighter
```

## Constructor\{#constructor}

検索および scalar フィルタリングで使用される highlighter の設定を初期化します。

```python
LexicalHighlighter(
    highlight_query: Optional[List] = None,
    highlight_search_text: Optional[bool] = None,
    pre_tags: Optional[List[str]] = None,
    post_tags: Optional[List[str]] = None,
    fragment_offset: Optional[int] = None,
    fragment_size: Optional[int] = None,
)
```

**PARAMETERS**:

- **highlight_query** (*list[dict]*) -
テキストベースのフィルターからどのクエリ用語をハイライトするかを定義します。各エントリは dict である必要があります:

    ```python
    [
        {"type": "<QueryType>", "field": "<text field name>", "text": "<terms to highlight>"},
        {...},
    ]
    ```

    設定しない場合、フィルタリング用語はハイライトされません。

    詳細については、[Text Highlighter](https://milvus.io/docs/text-highlighter.md) を参照してください。

- **highlight_search_text** (*bool*) -
BM25 全文検索で使用される検索用語をハイライトするかどうか。True の場合、BM25 のクエリ用語がハイライトされる用語のソースとして使用されます。未設定の場合、BM25 検索用語はハイライトされません。

- **pre_tags** (*list[str]*) -
返されるハイライト内で各一致用語の前に挿入されるタグ。プレーン文字列（例: `{`）または HTML-safe なマーカー（例: `<em>`, `<mark>`）をサポートします。複数のタグが指定された場合、タグは一致順にローテーションされます。

- **post_tags** (*list[str]*) -
各一致用語の後に挿入されるタグで、`pre_tags` と対になります。複数のタグが指定された場合、ローテーションは pre_tags と同じ順序に従います。

- **fragment_offset** (*int*) -
フラグメントベースの出力を返す際に、最初のハイライトされた一致の前に保持する先行コンテキストの文字数。デフォルトの動作では、追加の先行コンテキストは保持されません。

- **fragment_size** (*int*) -
返される各フラグメントの最大長（文字数）。highlighter はフラグメント長をおおよそこのサイズに制限します。

- **num_of_fragments** (*int*) -
テキスト値ごとに返すフラグメントの最大数。未設定の場合、デフォルトでは複数フラグメントになります（実装のデフォルト値。一般的な値については Examples を参照してください）。

**RETURN TYPE**:

*LexicalHighlighter*

**RETURNS**:

**LexicalHighlighter** オブジェクト。

## Examples\{#examples}

BM25 全文検索で検索用語をハイライトする:

```python
from pymilvus import MilvusClient, LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
)

results = client.search(
    collection_name="your_collection",
    data=["test"],                 # BM25 query term
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```

Text Match でクエリ用語をハイライトする:

```python
from pymilvus import MilvusClient, LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    highlight_query=[{"type": "TextMatch", "field": "text", "text": "my doc"}],
)

results = client.search(
    collection_name="your_collection",
    data=["test"],                 # BM25 can be combined
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```

---
title: "LexicalHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "LexicalHighlighter は、検索結果のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、カスタマイズ可能なタグを使用して一致した範囲に注釈を付け、読みやすさと UI レンダリングを向上させるためのフラグメントベースのスニペットを返すことができます。取得、フィルタリング、ランキング、スコアリングには影響しません。 | Python | MilvusClient"
type: docx
token: WytXd3BYFo2bY2xDrRIcCcoXnb0
sidebar_position: 1
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - クラウド
  - LexicalHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

**LexicalHighlighter** は、検索結果のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、カスタマイズ可能なタグを使用して一致した範囲に注釈を付け、読みやすさと UI レンダリングを向上させるためのフラグメントベースのスニペットを返すことができます。取得、フィルタリング、ランキング、スコアリングには影響しません。

## リクエスト構文\{#request-syntax}

```python
class pymilvus.LexicalHighlighter
```

**パラメーター:**

- **highlight_query** (*list[dict]*) -

    テキストベースのフィルターからのどのクエリ語をハイライトするかを定義するオプションです。各エントリは dict である必要があります。未設定の場合、フィルタリング用語はハイライトされません。詳細は、Text Highlighter を参照してください。

- **highlight_search_text** (*bool*) -

    BM25 全文検索で使用される検索語をハイライトするかどうかを示すフラグです。True の場合、BM25 クエリ語がハイライト対象語のソースとして使用されます。未設定の場合、BM25 検索語はハイライトされません。

- **pre_tags** (*list[str]*) -

    返されるハイライト内で、一致した各用語の前に挿入されるタグを指定するオプションです。プレーン文字列（例: \{）または HTML セーフなマーカー（例: &lt;em>、&lt;mark>）をサポートします。複数のタグを指定した場合、タグは一致した順序に従ってローテーションされます。

- **post_tags** (*list[str]*) -

    一致した各用語の後に挿入されるタグを指定するオプションで、pre_tags と組み合わせて使用します。複数のタグを指定した場合、ローテーションは pre_tags と同じ順序に従います。

- **fragment_offset** (*int*) -

    フラグメントベースの出力を返すときに、最初に一致したハイライトの前に保持する先行コンテキストの文字数です。デフォルトの動作では、先頭に追加のコンテキストは保持されません。

- **fragment_size** (*int*) -

    返される各フラグメントの最大長（文字数）を指定するオプションです。ハイライターは、フラグメントの長さをこのサイズ程度に制限します。

- **num_of_fragments** (*int*) -

    1 つのテキスト値に対して返すフラグメントの最大数を指定するオプションです。未設定の場合、デフォルトは複数のフラグメントです（実装のデフォルトです。一般的な値については、例を参照してください）。

**戻り値の型:**

*LexicalHighlighter*

**戻り値:**

LexicalHighlighter オブジェクトです。

## 例\{#examples}

BM25 全文検索で検索語をハイライトします。

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

Text Match でクエリ語をハイライトします。

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

---
title: "StructArray を使ったフィルタ付き検索 | Cloud"
slug: /filtered-search-with-struct-arrays
sidebar_label: "フィルタ付き検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールドのベクトル検索にスカラー フィルタリングを追加する方法を説明します。StructArray フィルタリングには 2 つのレベルがあります。行レベルのフィルタは親エンティティを選択し、要素レベルのフィルタは要素レベルのベクトル検索に参加する Struct 要素を制約します。 | Cloud"
type: origin
token: WDjyw7hO3i26RckEgqIcf36snMh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったフィルタ付き検索

このページでは、StructArray フィールドのベクトル検索にスカラー フィルタリングを追加する方法を説明します。StructArray フィルタリングには 2 つのレベルがあります。行レベルのフィルタは親エンティティを選択し、要素レベルのフィルタは要素レベルのベクトル検索に参加する Struct 要素を制約します。

このページでは、[Create a StructArray Field](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあり、`section`、`page`、`quality_score`、`has_code` などのスカラー サブフィールドに加え、検索用のベクトル サブフィールドも含まれています。

## フィルタの種類を選択する\{#choose-a-filter-type}

| 目的 | 使用方法 | 結果の動作 |
| --- | --- | --- |
| `category` などのトップレベルのスカラー フィールドでフィルタする。 | 通常のフィルタ式。 | 検索前または検索中に親エンティティを選択します。 |
| スカラー条件に一致する Struct 要素に要素レベルのベクトル検索を制約する。 | `element_filter`。 | 一致する Struct 要素のみを検索し、一致した要素のオフセットを返すことができます。 |
| いずれか、すべて、または特定数の Struct 要素が述語に一致するかどうかでエンティティを選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT`。 | 行レベルのフィルタリングです。これらの演算子自体はオフセットを返しません。 |

<Admonition type="info" icon="📘" title="Notes">

このページでは、検索ワークフローで StructArray フィルタを使用する方法を説明します。完全な構文ルール、サポートされる述語タイプ、サポートされない述語のマトリクスについては、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## トップレベル フィールドでフィルタする\{#filter-by-top-level-fields}

条件が個々の Struct 要素ではなく親エンティティに属する場合は、通常のフィルタ式を使用します。これは EmbeddingList 検索と要素レベル検索の両方で機能します。

```python
from pymilvus import MilvusClient
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query = EmbeddingList()
query.add([0.12, 0.21, 0.32, 0.44])
query.add([0.18, 0.23, 0.29, 0.36])

results = client.search(
    collection_name="tech_articles",
    data=[query],
    anns_field="chunks[emb_list_vector]",
    filter='category == "search"',
    limit=3,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)
```

上記のフィルタは、トップレベルの `category` フィールドが `"search"` であるエンティティのみを選択します。これは一致した 1 つの Struct 要素を特定するものではありません。

## 要素レベルのベクトル検索をフィルタする\{#filter-element-level-vector-search}

スカラー条件を、要素レベルのベクトル検索に参加する同じ Struct 要素に適用する必要がある場合は、`element_filter(structArrayField, predicate)` を使用します。述語内では、現在の Struct 要素のスカラー サブフィールドを参照するために `$[subfield]` を使用します。

```python
query_vector = [0.19, 0.24, 0.30, 0.37]

filter_expr = (
    'category == "search" && '
    'element_filter(chunks, '
    '$[section] == "index" && '
    '$[quality_score] > 0.9 && '
    '$[has_code] == true)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    filter=filter_expr,
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[page]",
        "chunks[quality_score]",
        "chunks[has_code]",
    ],
)

for hits in results:
    for hit in hits:
        print(
            "doc_id:", hit["id"],
            "distance:", hit["distance"],
            "offset:", hit.get("offset"),
            "entity:", hit["entity"],
        )
```

この例では、トップレベルの述語 `category == "search"` が候補エンティティを選択し、`element_filter` が要素レベルのベクトル検索を、同じ Struct 要素内で `section`、`quality_score`、`has_code` がすべて一致する chunk に制限します。

<Admonition type="warning" icon="🚧" title="Warning">

トップレベルの述語と `element_filter` を組み合わせる場合は、式の最後に `element_filter` を配置してください。1 つのフィルタ式には 1 つの `element_filter` しか含められず、別の StructArray 演算子の中に `element_filter` や `MATCH_*` をネストすることはできません。

</Admonition>

## MATCH 演算子でエンティティをフィルタする\{#filter-entities-with-match-operators}

フィルタが Struct 要素に基づいて親エンティティを対象とするかどうかを決定する必要がある場合は、`MATCH_*` 演算子を使用します。これらの演算子は行レベルのフィルタです。つまり、エンティティを選択しますが、それ自体では要素オフセットを返しません。

| 演算子 | 使用する場面 | 例 |
| --- | --- | --- |
| `MATCH_ANY` | 少なくとも 1 つの Struct 要素が述語を満たす必要がある。 | `MATCH_ANY(chunks, $[section] == "index")` |
| `MATCH_ALL` | すべての Struct 要素が述語を満たす必要がある。 | `MATCH_ALL(chunks, $[quality_score] > 0.5)` |
| `MATCH_LEAST` | 少なくとも `N` 個の Struct 要素が述語を満たす必要がある。 | `MATCH_LEAST(chunks, $[has_code] == true, threshold=2)` |
| `MATCH_MOST` | 高々 `N` 個の Struct 要素が述語を満たす必要がある。 | `MATCH_MOST(chunks, $[section] == "appendix", threshold=1)` |
| `MATCH_EXACT` | ちょうど `N` 個の Struct 要素が述語を満たす必要がある。 | `MATCH_EXACT(chunks, $[section] == "summary", threshold=1)` |

```python
filter_expr = (
    'category == "search" && '
    'MATCH_ANY(chunks, $[section] == "index" && $[quality_score] > 0.9)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query],
    anns_field="chunks[emb_list_vector]",
    filter=filter_expr,
    limit=3,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)
```

ここでは EmbeddingList 検索結果がエンティティ レベルであるため、`MATCH_ANY` を使用します。このフィルタでは、エンティティ内の少なくとも 1 つの chunk が高品質な `"index"` chunk であることを要求しますが、検索結果自体は引き続き親エンティティを表します。

## ハイブリッド検索でフィルタを使う\{#use-filters-in-hybrid-search}

ハイブリッド検索では、条件を適用したい場所に StructArray フィルタを適用します。トップレベルのフィルタはハイブリッド検索全体で共有できます。`element_filter` は、要素レベルの制約が必要な StructArray の要素レベル リクエストに付加する必要があります。

```python
from pymilvus import AnnSearchRequest, RRFRanker

query_vector = [0.19, 0.24, 0.30, 0.37]

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    limit=10,
)

chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    limit=10,
    expr='element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
    filter='category == "search"',
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)
```

`filter` 引数はトップレベルのエンティティ条件を適用し、`chunk_req` 上の `expr` は StructArray の要素レベル ベクトル リクエストのみに制約をかけます。サポートされるハイブリッド検索の組み合わせとバージョン固有の制限については、[Hybrid Search with StructArray](./hybrid-search-with-struct-array) と [StructArray Limits](./struct-array-limits) を参照してください。

## 述語サポートの概要\{#predicate-support-summary}

StructArray の述語ではスカラー サブフィールドを使用します。ベクトル サブフィールドはスカラー述語の入力ではありません。

| サブフィールドの型 | 一般的な述語の例 |
| --- | --- |
| `BOOL` | `$[has_code] == true`, `!($[has_code] == true)` |
| 整数型 | `$[page] >= 2`, `$[page] in [1, 2, 3]` |
| `FLOAT`, `DOUBLE` | `$[quality_score] > 0.9`, `0.7 < $[quality_score] < 0.95` |
| `VARCHAR` | `$[section] == "index"`, `$[text] like "range%"` |
| ベクトル サブフィールド | `$[...]` のスカラー述語入力としてはサポートされません。代わりにベクトル検索でベクトル サブフィールドを使用してください。 |

JSON パス、配列コンテナ関数、テキスト マッチ関数、`$[...]` に対する null 述語、Geometry 関数、Timestamptz 式、汎用関数呼び出しなどのサポートされないケースについては、[StructArray Operators](./struct-array-filtering) を参照してください。

## よくある間違い\{#common-mistakes}

- `element_filter` または `MATCH_*` の外で `$[subfield]` を使う。

- `element_filter(chunks, $[section] == "index")` のような StructArray 演算子構文の代わりに `chunks.section` を使う。

- 行レベルのフィルタリングだけでよいのに `element_filter` を使う。エンティティを選択するだけでよい場合は、代わりに `MATCH_ANY` を使用してください。

- `MATCH_*` が要素オフセットを返すと期待する。これらの演算子はエンティティを選択しますが、それ自体では一致した 1 つの要素を特定しません。

- `$[has_code]` のような裸の真偽値述語を書く。`$[has_code] == true` のような明示的な比較を使用してください。

- 同じフィルタ式でトップレベルの述語より前に `element_filter` を置く。

## 次のステップ\{#next-steps}

1. StructArray フィルタの完全な構文を確認するには、[StructArray Operators](./struct-array-filtering) を参照してください。

1. まずフィルタなしのベクトル検索を実行するには、[Basic Vector Search with StructArray](./search-with-struct-array) を参照してください。

1. 頻繁に使用する StructArray フィルタ用のスカラー index を作成するには、[Index StructArray Fields](./index-struct-array) を参照してください。

1. バージョン固有のフィルタと検索の制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。


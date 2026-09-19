---
title: "StructArray を使用したフィルター付き検索 | BYOC"
slug: /filtered-search-with-struct-arrays
sidebar_label: "フィルター付き検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールドに対するベクトル検索にスカラーフィルタリングを追加する方法を説明します。StructArray のフィルタリングには 2 つのレベルがあります。行レベルのフィルターは親エンティティを選択し、要素レベルのフィルターは要素レベルのベクトル検索に参加する Struct 要素を制限します。 | BYOC"
type: origin
token: WDjyw7hO3i26RckEgqIcf36snMh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用したフィルター付き検索

このページでは、StructArray フィールドに対するベクトル検索にスカラーフィルタリングを追加する方法を説明します。StructArray のフィルタリングには 2 つのレベルがあります。行レベルのフィルターは親エンティティを選択し、要素レベルのフィルターは要素レベルのベクトル検索に参加する Struct 要素を制限します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには `chunks` という名前の StructArray フィールドがあり、`section`、`page`、`quality_score`、`has_code` などのスカラーサブフィールドに加えて、検索用のベクトルサブフィールドが含まれています。

## フィルターの種類を選択する\{#choose-a-filter-type}

| 目的 | 使用するもの | 結果の動作 |
| --- | --- | --- |
| `category` などのトップレベルのスカラーフィールドでフィルタリングする。 | 通常のフィルター式。 | 検索の前または検索中に親エンティティを選択します。 |
| スカラー条件に一致する Struct 要素に要素レベルのベクトル検索を制限する。 | `element_filter`。 | 一致する Struct 要素のみを検索し、一致した要素のオフセットを返すことができます。 |
| いずれか、すべて、または特定の数の Struct 要素が述語に一致するかどうかでエンティティを選択する。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT`。 | 行レベルのフィルタリングです。これらの演算子は単独ではオフセットを返しません。 |

<Admonition type="info" title="Notes">

このページでは、検索ワークフローで StructArray フィルターを使用する方法を説明します。完全な構文ルール、サポートされる述語の種類、サポートされない述語のマトリクスについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

</Admonition>

## トップレベルのフィールドでフィルタリングする\{#filter-by-top-level-fields}

条件が個々の Struct 要素ではなく親エンティティに属する場合は、通常のフィルター式を使用します。これは EmbeddingList 検索と要素レベル検索の両方で機能します。

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

上記のフィルターは、トップレベルの `category` フィールドが `"search"` であるエンティティのみを選択します。一致した Struct 要素を 1 つ特定するものではありません。

## 要素レベルのベクトル検索をフィルタリングする\{#filter-element-level-vector-search}

スカラー条件を、要素レベルのベクトル検索に参加する同じ Struct 要素に適用する必要がある場合は、`element_filter(structArrayField, predicate)` を使用します。述語の内部では、`$[subfield]` を使用して現在の Struct 要素のスカラーサブフィールドを参照します。

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

この例では、トップレベルの述語 `category == "search"` が候補エンティティを選択し、`element_filter` は要素レベルのベクトル検索を、`section`、`quality_score`、`has_code` がすべて同じ Struct 要素内で一致する chunk に制限します。

<Admonition type="warning" title="Warning">

トップレベルの述語と `element_filter` を組み合わせる場合は、式の末尾に `element_filter` を配置してください。フィルター式に含めることができる `element_filter` は 1 つだけであり、`element_filter` や `MATCH_*` を別の StructArray 演算子の内部にネストすることはできません。

</Admonition>

## MATCH 演算子でエンティティをフィルタリングする\{#filter-entities-with-match-operators}

`MATCH_*` 演算子は、親エンティティがその Struct 要素に基づいて条件を満たすかどうかをフィルターで判断する場合に使用します。これらの演算子は行レベルのフィルターであり、エンティティを選択しますが、単独では要素のオフセットを返しません。

| 演算子 | 使用する場合 | 例 |
| --- | --- | --- |
| `MATCH_ANY` | 少なくとも 1 つの Struct 要素が述語を満たす必要があります。 | `MATCH_ANY(chunks, $[section] == "index")` |
| `MATCH_ALL` | すべての Struct 要素が述語を満たす必要があります。 | `MATCH_ALL(chunks, $[quality_score] > 0.5)` |
| `MATCH_LEAST` | 少なくとも `N` 個の Struct 要素が述語を満たす必要があります。 | `MATCH_LEAST(chunks, $[has_code] == true, threshold=2)` |
| `MATCH_MOST` | 最大で `N` 個の Struct 要素が述語を満たす必要があります。 | `MATCH_MOST(chunks, $[section] == "appendix", threshold=1)` |
| `MATCH_EXACT` | ちょうど `N` 個の Struct 要素が述語を満たす必要があります。 | `MATCH_EXACT(chunks, $[section] == "summary", threshold=1)` |

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

ここで `MATCH_ANY` を使用するのは、EmbeddingList 検索の結果がエンティティレベルであるためです。このフィルターは、エンティティ内に高品質な `"index"` chunk が少なくとも 1 つ存在することを要求しますが、検索結果自体は依然として親エンティティを表します。

## ハイブリッド検索でフィルターを使用する\{#use-filters-in-hybrid-search}

ハイブリッド検索では、条件を適用する必要がある場所に StructArray フィルターを適用します。トップレベルのフィルターはハイブリッド検索全体で共有できます。`element_filter` は、要素レベルの制約が必要な StructArray 要素レベルのリクエストに付加する必要があります。

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

`filter` 引数はトップレベルのエンティティ条件を適用し、`chunk_req` の `expr` は StructArray の要素レベルのベクトルリクエストのみを制限します。サポートされるハイブリッド検索の組み合わせとバージョン固有の制限については、[StructArray を使用したハイブリッド検索](./hybrid-search-with-struct-array) および [StructArray の制限](./struct-array-limits) を参照してください。

## 述語のサポート状況\{#predicate-support-summary}

StructArray の述語ではスカラーサブフィールドを使用します。ベクトルサブフィールドはスカラー述語の入力ではありません。

| サブフィールド型 | 述語の一般的な例 |
| --- | --- |
| `BOOL` | `$[has_code] == true`, `!($[has_code] == true)` |
| 整数型 | `$[page] >= 2`, `$[page] in [1, 2, 3]` |
| `FLOAT`、`DOUBLE` | `$[quality_score] > 0.9`, `0.7 < $[quality_score] < 0.95` |
| `VARCHAR` | `$[section] == "index"`, `$[text] like "range%"` |
| ベクトルサブフィールド | `$[...]` のスカラー述語入力としてはサポートされていません。代わりに、ベクトルサブフィールドはベクトル検索を介して使用してください。 |

JSON パス、配列コンテナ関数、テキスト一致関数、`$[...]` に対する null 述語、Geometry 関数、Timestamptz 式、汎用関数呼び出しなど、サポートされないケースについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

## よくある間違い\{#common-mistakes}

- `element_filter` または `MATCH_*` の外側で `$[subfield]` を使用する。

- `element_filter(chunks, $[section] == "index")` のような StructArray 演算子構文ではなく、`chunks.section` を使用する。

- 行レベルのフィルタリングのみが必要な場合に `element_filter` を使用する。エンティティを選択するだけでよい場合は、代わりに `MATCH_ANY` を使用してください。

- `MATCH_*` が要素のオフセットを返すことを期待する。これらの演算子はエンティティを選択し、単独では一致した要素を 1 つ特定しません。

- `$[has_code]` のような裸のブール述語を記述する。`$[has_code] == true` のような明示的な比較を使用してください。

- 同じフィルター式内で、トップレベルの述語より前に `element_filter` を配置する。

## 次のステップ\{#next-steps}

1. StructArray フィルターの完全な構文を確認するには、[StructArray 演算子](./struct-array-filtering) を参照してください。

1. 先にフィルターなしのベクトル検索を実行するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. よく使用する StructArray フィルター用のスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. バージョン固有のフィルターと検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


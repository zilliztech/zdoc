---
title: "StructArray を使ったフィルタ付き検索 | Cloud"
slug: /filtered-search-with-struct-arrays
sidebar_label: "フィルタ付き検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールドに対するベクトル検索にスカラーフィルタリングを追加する方法を説明します。StructArray のフィルタリングには 2 つのレベルがあります。行レベルのフィルタは親エンティティを選択し、要素レベルのフィルタは要素レベルのベクトル検索に参加する Struct 要素を制約します。 | Cloud"
type: origin
token: WDjyw7hO3i26RckEgqIcf36snMh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったフィルタ付き検索

このページでは、StructArray フィールドに対するベクトル検索にスカラーフィルタリングを追加する方法を説明します。StructArray のフィルタリングには 2 つのレベルがあります。行レベルのフィルタは親エンティティを選択し、要素レベルのフィルタは要素レベルのベクトル検索に参加する Struct 要素を制約します。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには `chunks` という名前の StructArray フィールドがあり、`section`、`page`、`quality_score`、`has_code` などのスカラーサブフィールドと、検索用のベクトルサブフィールドがあります。

## フィルタの種類を選択する\{#choose-a-filter-type}

| 目的 | 使用するもの | 結果の動作 |
| --- | --- | --- |
| `category` などのトップレベルスカラーフィールドでフィルタします。 | 通常のフィルタ式です。 | 検索前または検索中に親エンティティを選択します。 |
| スカラー条件に一致する Struct 要素に要素レベルのベクトル検索を制約します。 | `element_filter`。 | 一致する Struct 要素のみを検索し、一致した要素のオフセットを返すこともできます。 |
| いずれか、すべて、または特定の数の Struct 要素が述語に一致するかどうかでエンティティを選択します。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT`。 | 行レベルのフィルタリングです。これらの演算子自体はオフセットを返しません。 |

<Admonition type="info" title="Notes">

このページでは、検索ワークフローで StructArray フィルタを使用する方法について説明します。完全な構文ルール、サポートされる述語の種類、サポートされない述語のマトリックスについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

</Admonition>

## トップレベルフィールドでフィルタする\{#filter-by-top-level-fields}

条件が個々の Struct 要素ではなく親エンティティに属する場合は、通常のフィルタ式を使用します。これは EmbeddingList 検索と要素レベルの検索の両方で機能します。

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

上記のフィルタは、トップレベルの `category` フィールドが `"search"` であるエンティティのみを選択します。一致した 1 つの Struct 要素を特定するものではありません。

## 要素レベルのベクトル検索をフィルタする\{#filter-element-level-vector-search}

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

この例では、トップレベルの述語 `category == "search"` が候補エンティティを選択し、`element_filter` は要素レベルのベクトル検索を、`section`、`quality_score`、`has_code` がすべて同じ Struct 要素内で一致するチャンクに制限します。

<Admonition type="warning" title="Warning">

トップレベルの述語と `element_filter` を組み合わせる場合は、`element_filter` を式の末尾に配置してください。フィルタ式に含めることができる `element_filter` は 1 つだけであり、別の StructArray 演算子の中に `element_filter` や `MATCH_*` をネストすることはできません。

</Admonition>

## MATCH 演算子でエンティティをフィルタする\{#filter-entities-with-match-operators}

フィルタが、親エンティティの Struct 要素に基づいてそのエンティティが条件を満たすかどうかを判断する場合は、`MATCH_*` 演算子を使用します。これらの演算子は行レベルのフィルタです。エンティティを選択しますが、それ自体では要素のオフセットを返しません。

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

ここで `MATCH_ANY` を使用するのは、EmbeddingList 検索の結果がエンティティレベルであるためです。このフィルタは、エンティティ内の少なくとも 1 つのチャンクが高品質の `"index"` チャンクであることを要求しますが、検索結果自体は依然として親エンティティを表します。

## ハイブリッド検索でフィルタを使用する\{#use-filters-in-hybrid-search}

ハイブリッド検索では、条件を適用する場所に StructArray フィルタを適用します。トップレベルのフィルタは、ハイブリッド検索全体で共有できます。`element_filter` は、要素レベルの制約が必要な StructArray の要素レベルのリクエストに付加する必要があります。

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

`filter` 引数はトップレベルのエンティティ条件を適用し、`chunk_req` の `expr` は StructArray の要素レベルのベクトルリクエストのみを制約します。サポートされるハイブリッド検索の組み合わせとバージョン固有の制限については、[StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) および [StructArray の制限](./struct-array-limits) を参照してください。

## 述語のサポートの概要\{#predicate-support-summary}

StructArray の述語ではスカラーサブフィールドを使用します。ベクトルサブフィールドはスカラー述語の入力にはなりません。

| サブフィールド型 | 一般的な述語の例 |
| --- | --- |
| `BOOL` | `$[has_code] == true`, `!($[has_code] == true)` |
| 整数型 | `$[page] >= 2`, `$[page] in [1, 2, 3]` |
| `FLOAT`, `DOUBLE` | `$[quality_score] > 0.9`, `0.7 < $[quality_score] < 0.95` |
| `VARCHAR` | `$[section] == "index"`, `$[text] like "range%"` |
| ベクトルサブフィールド | `$[...]` スカラー述語の入力としてはサポートされません。代わりに、ベクトル検索を通じてベクトルサブフィールドを使用してください。 |

JSON パス、配列コンテナ関数、テキスト一致関数、`$[...]` に対する null 述語、Geometry 関数、Timestamptz 式、汎用関数呼び出しなど、サポートされないケースについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

## よくある間違い\{#common-mistakes}

- `element_filter` または `MATCH_*` の外で `$[subfield]` を使用するのは避けてください。

- StructArray 演算子の構文（`element_filter(chunks, $[section] == "index")` など）の代わりに `chunks.section` を使用するのは避けてください。

- 行レベルのフィルタリングのみが必要な場合に `element_filter` を使用するのは避けてください。エンティティを選択するだけでよい場合は、代わりに `MATCH_ANY` を使用してください。

- `MATCH_*` が要素のオフセットを返すことを期待するのは避けてください。これらの演算子はエンティティを選択するものであり、それ自体では一致した 1 つの要素を特定しません。

- `$[has_code]` のような裸の boolean 述語を記述するのは避けてください。`$[has_code] == true` のような明示的な比較を使用してください。

- 同じフィルタ式内でトップレベルの述語より前に `element_filter` を配置するのは避けてください。

## 次のステップ\{#next-steps}

1. StructArray フィルタの完全な構文を確認するには、[StructArray 演算子](./struct-array-filtering) を参照してください。

1. フィルタなしでベクトル検索を先に実行するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. よく使用する StructArray フィルタにスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. バージョン固有のフィルタと検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


---
title: "StructArray を使用した範囲検索 | Cloud"
slug: /range-search-with-struct-arrays
sidebar_label: "範囲検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクターサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定した境界内に収まるベクターヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクター検索とともに範囲検索を使用します。 | Cloud"
type: origin
token: ZR1bwJFFSio2jkkabd7c1YAYncf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用した範囲検索

このページでは、StructArray ベクターサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定した境界内に収まるベクターヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクター検索とともに範囲検索を使用します。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクターサブフィールドは、`COSINE`、`IP`、`L2` などの通常のベクターメトリックを使用した要素レベル検索向けにインデックス化されています。

## StructArray への範囲検索の適用方法\{#how-range-search-applies-to-structarray}

| Search mode | Range search behavior | Result granularity |
| --- | --- | --- |
| EmbeddingList search | サポートされていません。 | 該当なし。 |
| Element-level search | `radius` と、必要に応じて `range_filter` を使用した通常のベクタークエリを使用します。 | Struct 要素レベル。 |
| Hybrid search | StructArray リクエストが要素レベルのベクターフィールドを対象とする場合にサポートされます。EmbeddingList レベルのリクエストでは範囲検索はサポートされません。 | 要素レベルのサブ検索、その後 hybrid reranking。 |

<Admonition type="info" icon="📘" title="注意">

最も近い Struct 要素のみが必要な場合は、まず [StructArray を使用した基本ベクター検索](./search-with-struct-array) を参照してください。範囲検索は、結果が単なる top-K ランキングではなく、スコアまたは距離の境界条件を満たす必要がある場合に使用します。

</Admonition>

## 始める前に\{#before-you-begin}

範囲検索を実行する前に、collection、データ、およびインデックスを準備してください。

| Requirement | Details |
| --- | --- |
| StructArray field | collection には `chunks` などの StructArray フィールドが含まれています。 |
| Element-level vector subfield | 対象のベクターサブフィールドは `chunks[emb]` であり、`chunks[emb_list_vector]` ではありません。 |
| Index metric | ベクターサブフィールドは、`COSINE`、`IP`、`L2` などの通常のベクターメトリックでインデックス化されています。 |
| Query data | クエリは `EmbeddingList` ではなく通常のベクターです。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## radius と range_filter を使用する\{#use-radius-and-rangefilter}

検索境界を定義するには `radius` を設定します。内側の境界も必要な場合は `range_filter` を設定します。方向は、距離が小さいほど良いのか、類似度スコアが大きいほど良いのかによって異なります。

| Metric type | Higher score is better? | Range condition when `range_filter` is used |
| --- | --- | --- |
| `L2` | いいえ。距離が小さいほど良いです。 | `range_filter <= distance < radius` |
| `IP`, `COSINE` | はい。スコアが大きいほど良いです。 | `radius < distance <= range_filter` |

`radius` のみを設定した場合、範囲検索はそのメトリックにおける外側の境界を満たすヒットを返します。埋め込みのスコアまたは距離のスケールに応じて値を選択してください。

## 要素レベルの範囲検索を実行する\{#run-element-level-range-search}

次の例では、`chunks[emb]` ベクターがクエリベクターに十分似ている個々のチャンクを検索します。各結果ヒットは、一致した Struct 要素を表します。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query_vector = [0.19, 0.24, 0.30, 0.37]

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    search_params={
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    limit=10,
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[page]",
        "chunks[quality_score]",
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

この例では、`COSINE` は類似度スタイルのメトリックであるため、結果の範囲は `radius` より大きく、`range_filter` 以下になります。返される場合、`offset` 値は `chunks` 配列内で一致した Struct 要素を識別します。

## scalar フィルターを追加する\{#add-scalar-filters}

要素レベルの範囲検索は、StructArray の scalar フィルタリングと組み合わせることができます。親エンティティフィールドにはトップレベルの述語を使用し、ベクター範囲検索に参加する Struct 要素を制約するには `element_filter` を使用します。

```python
filter_expr = (
    'category == "search" && '
    'element_filter(chunks, '
    '$[section] == "index" && '
    '$[quality_score] > 0.9)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    search_params={
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    filter=filter_expr,
    limit=10,
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

トップレベルの述語は候補エンティティを選択します。`element_filter` 述語は、一致する Struct 要素に対してのみベクター範囲検索を行うよう制限します。フィルタリングの詳細な例については、[StructArray を使用したフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

## hybrid search で範囲検索を使用する\{#use-range-search-in-hybrid-search}

StructArray の要素レベルベクターフィールドは、hybrid search での範囲検索をサポートしています。StructArray の要素レベルベクターフィールドを対象とする `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加してください。

```python
from pymilvus import AnnSearchRequest, RRFRanker

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    limit=10,
)

chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    param={
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    limit=10,
    expr='element_filter(chunks, $[section] == "index")',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)
```

この例では、`chunks[emb]` サブリクエストのみが範囲検索パラメーターを使用しています。StructArray リクエストは引き続き要素レベルのセマンティクスに従います。つまり、hybrid search が結果を結合して再ランク付けする前に、範囲境界が Struct 要素ヒットに適用されます。

## 範囲検索結果を解釈する\{#interpret-range-results}

| Result item | Meaning |
| --- | --- |
| `id` | 一致した Struct 要素を含むエンティティの主キー。 |
| `distance` or score | クエリベクターと一致した Struct 要素ベクターとの間のスコアまたは距離。 |
| `offset` | 返される場合、StructArray フィールド内で一致した Struct 要素の 0 ベース位置。 |
| Repeated primary keys | あり得ます。同じエンティティ内の複数の Struct 要素が指定された範囲内に入ることがあります。 |
| `limit` | 一意な親エンティティではなく、要素ヒットに適用されます。 |

## 制限事項\{#limitations}

- StructArray ベクターサブフィールドの範囲検索では、`EmbeddingList` クエリまたは `MAX_SIM*` メトリックを使用しないでください。EmbeddingList レベルの検索は範囲検索をサポートしていません。

- 範囲検索を grouping search と組み合わせないでください。親エンティティごとに 1 件の結果が必要な場合は、範囲パラメーターなしで要素レベル検索を実行し、サポートされている場合は grouping を使用してください。

- hybrid range search は StructArray の要素レベルベクターフィールドでサポートされています。EmbeddingList レベルの StructArray リクエストではサポートされていません。

## よくある間違い\{#common-mistakes}

- `chunks[emb_list_vector]` に対して範囲検索を実行すること。これは EmbeddingList 検索用です。

- 要素レベルの範囲検索で、`COSINE` のような通常のメトリックではなく `MAX_SIM_COSINE` を使用すること。

- 通常のベクタークエリではなく `EmbeddingList` クエリを使用すること。

- 範囲検索の結果が親エンティティ単位で一意になると期待すること。範囲検索は一致した Struct 要素ヒットを返します。

- 必要なサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使用すること。

## 次のステップ\{#next-steps}

1. StructArray ベクター検索の 2 つの基本モードについて学ぶには、[StructArray を使用した基本ベクター検索](./search-with-struct-array) を参照してください。

1. 範囲検索に scalar フィルターを追加するには、[StructArray を使用したフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

1. サポートされている場合に親エンティティごとに最大 1 件の結果を返すには、[StructArray を使用したグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. バージョン固有の検索制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


---
title: "StructArray を使用した範囲検索 | Cloud"
slug: /range-search-with-struct-arrays
sidebar_label: "範囲検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクトルサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まるベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索とともに範囲検索を使用します。 | Cloud"
type: origin
token: ZR1bwJFFSio2jkkabd7c1YAYncf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用した範囲検索

このページでは、StructArray ベクトルサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まるベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索とともに範囲検索を使用します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクトルサブフィールドは、`COSINE`、`IP`、`L2` などの通常のベクトル metric を用いた要素レベル検索向けに index 化されています。

## 範囲検索が StructArray にどのように適用されるか\{#how-range-search-applies-to-structarray}

| 検索モード | 範囲検索の動作 | 結果の粒度 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当なし。 |
| 要素レベル検索 | `radius` と、必要に応じて `range_filter` を指定した通常のベクトルクエリを使用します。 | Struct 要素レベル。 |
| ハイブリッド検索 | StructArray リクエストが要素レベルのベクトルフィールドを対象とする場合にサポートされます。EmbeddingList レベルのリクエストでは範囲検索はサポートされません。 | 要素レベルのサブ検索の後、ハイブリッド再ランキング。 |

<Admonition type="info" icon="📘" title="注意">

最も近い Struct 要素だけが必要な場合は、まず [StructArray を使用した基本ベクトル検索](./search-with-struct-array) を参照してください。範囲検索は、結果が単なる top-K ランキングではなく、スコアまたは距離の境界条件を満たす必要がある場合に使用します。

</Admonition>

## 始める前に\{#before-you-begin}

範囲検索を実行する前に、collection、データ、indexes を準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection に `chunks` などの StructArray フィールドが含まれていること。 |
| 要素レベルのベクトルサブフィールド | 対象のベクトルサブフィールドが `chunks[emb]` であり、`chunks[emb_list_vector]` ではないこと。 |
| Index metric | ベクトルサブフィールドが、`COSINE`、`IP`、`L2` などの通常のベクトル metric で index 化されていること。 |
| クエリデータ | クエリが `EmbeddingList` ではなく通常のベクトルであること。 |

index の設定については、[StructArray フィールドの index 化](./index-struct-array) を参照してください。

## radius と range_filter を使用する\{#use-radius-and-rangefilter}

検索境界を定義するには `radius` を設定します。内側の境界も必要な場合は `range_filter` を設定します。方向は、距離が小さいほど良いのか、類似度スコアが大きいほど良いのかによって異なります。

| Metric type | 高いスコアほど良いか | `range_filter` を使用する場合の範囲条件 |
| --- | --- | --- |
| `L2` | いいえ。距離が小さいほど良いです。 | `range_filter <= distance < radius` |
| `IP`, `COSINE` | はい。スコアが大きいほど良いです。 | `radius < distance <= range_filter` |

`radius` のみを設定した場合、範囲検索はその metric の外側境界を満たすヒットを返します。embedding のスコアまたは距離のスケールに応じて値を選択してください。

## 要素レベルの範囲検索を実行する\{#run-element-level-range-search}

次の例では、`chunks[emb]` ベクトルがクエリベクトルと十分に類似している個々の chunk を検索します。各結果ヒットは一致した Struct 要素を表します。

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

この例では、`COSINE` は類似度ベースの metric であるため、結果の範囲は `radius` より大きく、`range_filter` 以下です。返される場合、`offset` の値は `chunks` 配列内で一致した Struct 要素を識別します。

## scalar フィルターを追加する\{#add-scalar-filters}

要素レベルの範囲検索は StructArray の scalar フィルタリングと組み合わせることができます。親 entity フィールドにはトップレベルの述語を使用し、どの Struct 要素をベクトル範囲検索に参加させるかを制約するには `element_filter` を使用します。

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

トップレベルの述語は候補 entity を選択します。`element_filter` 述語は、一致する Struct 要素に対してのみベクトル範囲検索を行うよう制限します。フィルタリングの詳細な例については、[StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays) を参照してください。

## ハイブリッド検索で範囲検索を使用する\{#use-range-search-in-hybrid-search}

StructArray の要素レベルベクトルフィールドは、ハイブリッド検索で範囲検索をサポートします。StructArray の要素レベルベクトルフィールドを対象とする `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加します。

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

この例では、`chunks[emb]` サブリクエストのみが範囲検索パラメーターを使用します。StructArray リクエストは依然として要素レベルのセマンティクスに従います。つまり、ハイブリッド検索が結果を結合して再ランキングする前に、範囲境界が Struct 要素ヒットに適用されます。

## 範囲検索の結果を解釈する\{#interpret-range-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | 一致した Struct 要素を含む entity の主キー。 |
| `distance` または score | クエリベクトルと一致した Struct 要素ベクトルの間のスコアまたは距離。 |
| `offset` | 返される場合、StructArray フィールド内で一致した Struct 要素の 0 ベース位置。 |
| 重複する主キー | 発生する可能性があります。同じ entity 内の複数の Struct 要素が指定した範囲内に入る場合があります。 |
| `limit` | 一意の親 entity ではなく、要素ヒットに適用されます。 |

## 制限事項\{#limitations}

- StructArray ベクトルサブフィールドに対する範囲検索では、`EmbeddingList` クエリや `MAX_SIM*` metric を使用しないでください。EmbeddingList レベルの検索は範囲検索をサポートしていません。

- 範囲検索を grouping search と組み合わせないでください。親 entity ごとに 1 件の結果が必要な場合は、範囲パラメーターなしで要素レベル検索を実行し、サポートされている場合は grouping を使用してください。

- ハイブリッド範囲検索は StructArray の要素レベルベクトルフィールドでサポートされます。EmbeddingList レベルの StructArray リクエストではサポートされません。

## よくある間違い\{#common-mistakes}

- `chunks[emb_list_vector]` に対して範囲検索を実行すること。これは EmbeddingList 検索向けです。

- 要素レベルの範囲検索で、`COSINE` などの通常の metric ではなく `MAX_SIM_COSINE` を使用すること。

- 通常のベクトルクエリではなく `EmbeddingList` クエリを使用すること。

- 範囲検索の結果が親 entity ごとに一意であると期待すること。範囲検索は一致した Struct 要素ヒットを返します。

- 必要なサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使用すること。

## 次のステップ\{#next-steps}

1. StructArray ベクトル検索の 2 つの基本モードについて学ぶには、[StructArray を使用した基本ベクトル検索](./search-with-struct-array) を参照してください。

1. 範囲検索に scalar フィルターを追加するには、[StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. サポートされている場合に親 entity ごとに最大 1 件の結果を返すには、[StructArray を使用した grouping search](./grouping-search-with-struct-array) を参照してください。

1. バージョン固有の検索制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


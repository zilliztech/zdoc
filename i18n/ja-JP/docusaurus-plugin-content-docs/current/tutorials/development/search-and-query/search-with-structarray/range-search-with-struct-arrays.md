---
title: "StructArray を使用した範囲検索 | Cloud"
slug: /range-search-with-struct-arrays
sidebar_label: "範囲検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクトルサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まるベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索で範囲検索を使用します。 | Cloud"
type: origin
token: ZR1bwJFFSio2jkkabd7c1YAYncf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用した範囲検索

このページでは、StructArray ベクトルサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まるベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索で範囲検索を使用します。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には、`chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクトルサブフィールドは、`COSINE`、`IP`、`L2` などの通常のベクトル metric を使った要素レベル検索用に index 化されています。

## StructArray への範囲検索の適用方法\{#how-range-search-applies-to-structarray}

| 検索モード | 範囲検索の動作 | 結果の粒度 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当なし。 |
| 要素レベル検索 | `radius` と、必要に応じて `range_filter` を指定した通常のベクトルクエリを使用します。 | Struct 要素レベル。 |
| ハイブリッド検索 | StructArray リクエストが要素レベルのベクトルフィールドを対象とする場合にサポートされます。EmbeddingList レベルのリクエストでは範囲検索はサポートされません。 | 要素レベルのサブ検索、その後ハイブリッド再ランキング。 |

<Admonition type="info" icon="📘" title="注意">

最も近い Struct 要素のみが必要な場合は、まず [StructArray を使用した基本ベクトル検索](./search-with-struct-array) を参照してください。範囲検索は、結果が単なる top-K ランキングではなく、スコアまたは距離の境界条件を満たす必要がある場合に使用します。

</Admonition>

## 始める前に\{#before-you-begin}

範囲検索を実行する前に、collection、データ、および index を準備します。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection には `chunks` などの StructArray フィールドが含まれています。 |
| 要素レベルのベクトルサブフィールド | 対象のベクトルサブフィールドは `chunks[emb]` であり、`chunks[emb_list_vector]` ではありません。 |
| Index metric | ベクトルサブフィールドは、`COSINE`、`IP`、`L2` などの通常のベクトル metric で index 化されています。 |
| クエリデータ | クエリは `EmbeddingList` ではなく、通常のベクトルです。 |

index の設定については、[StructArray フィールドの index 化](./index-struct-array) を参照してください。

## radius と range_filter の使用\{#use-radius-and-rangefilter}

検索境界を定義するには `radius` を設定します。内側の境界も必要な場合は `range_filter` を設定します。方向は、距離が小さいほど良いのか、類似度スコアが大きいほど良いのかによって異なります。

| Metric タイプ | 高いスコアほど良いですか? | `range_filter` を使用する場合の範囲条件 |
| --- | --- | --- |
| `L2` | いいえ。距離が小さいほど良いです。 | `range_filter <= distance < radius` |
| `IP`, `COSINE` | はい。スコアが大きいほど良いです。 | `radius < distance <= range_filter` |

`radius` のみを設定した場合、範囲検索はその metric の外側の境界条件を満たすヒットを返します。埋め込みのスコアまたは距離のスケールに応じて値を選択してください。

## 要素レベルの範囲検索を実行する\{#run-element-level-range-search}

次の例では、`chunks[emb]` ベクトルがクエリベクトルと十分に類似している個々の chunk を検索します。各結果ヒットは、一致した Struct 要素を表します。

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

この例では、`COSINE` は類似度型の metric であるため、結果の範囲は `radius` より大きく、`range_filter` 以下になります。`offset` 値は、返された場合に `chunks` 配列内で一致した Struct 要素を識別します。

## scalar フィルターを追加する\{#add-scalar-filters}

要素レベルの範囲検索を StructArray scalar フィルタリングと組み合わせることができます。親エンティティフィールドにはトップレベル述語を使用し、ベクトル範囲検索に参加する Struct 要素を制約するには `element_filter` を使用します。

```plaintext
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

トップレベル述語は候補エンティティを選択します。`element_filter` 述語は、一致する Struct 要素に対してのみベクトル範囲検索を行うよう制限します。その他のフィルタリング例については、[StructArray を使用したフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

## ハイブリッド検索で範囲検索を使用する\{#use-range-search-in-hybrid-search}

StructArray の要素レベルベクトルフィールドは、ハイブリッド検索で範囲検索をサポートします。StructArray 要素レベルベクトルフィールドを対象とする `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加します。

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

この例では、`chunks[emb]` サブリクエストのみが範囲検索パラメータを使用します。StructArray リクエストは引き続き要素レベルのセマンティクスに従います。ハイブリッド検索が結果を結合して再ランキングする前に、範囲境界は Struct 要素ヒットに適用されます。

## 範囲検索結果の解釈\{#interpret-range-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | 一致した Struct 要素を含むエンティティの主キー。 |
| `distance` または score | クエリベクトルと一致した Struct 要素ベクトルとの間のスコアまたは距離。 |
| `offset` | 返された場合、StructArray フィールド内で一致した Struct 要素の 0 ベースの位置。 |
| 重複した主キー | 発生する可能性があります。同じエンティティ内の複数の Struct 要素が指定された範囲内に入ることがあります。 |
| `limit` | 一意の親エンティティではなく、要素ヒットに適用されます。 |

## 制限事項\{#limitations}

- StructArray ベクトルサブフィールドでの範囲検索には、`EmbeddingList` クエリや `MAX_SIM*` metric を使用しないでください。EmbeddingList レベルの検索は範囲検索をサポートしていません。

- 範囲検索と grouping search を組み合わせないでください。親エンティティごとに 1 件の結果が必要な場合は、範囲パラメータなしで要素レベル検索を実行し、サポートされている場合は grouping を使用してください。

- ハイブリッド範囲検索は StructArray の要素レベルベクトルフィールドでサポートされています。EmbeddingList レベルの StructArray リクエストではサポートされていません。

## よくある間違い\{#common-mistakes}

- EmbeddingList 検索向けである `chunks[emb_list_vector]` に対して範囲検索を実行すること。

- 要素レベルの範囲検索で、`COSINE` のような通常の metric ではなく `MAX_SIM_COSINE` を使用すること。

- 通常のベクトルクエリではなく `EmbeddingList` クエリを使用すること。

- 範囲検索結果が親エンティティごとに一意であると期待すること。範囲検索は一致した Struct 要素ヒットを返します。

- 必須のサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使用すること。

## 次のステップ\{#next-steps}

1. StructArray ベクトル検索の 2 つの基本モードについて学ぶには、[StructArray を使用した基本ベクトル検索](./search-with-struct-array) を参照してください。

1. 範囲検索に scalar フィルターを追加するには、[StructArray を使用したフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. サポートされている場合に親エンティティごとに最大 1 件の結果を返すには、[StructArray を使用した Grouping Search](./grouping-search-with-struct-array) を参照してください。

1. バージョン固有の検索制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


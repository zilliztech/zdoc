---
title: "StructArray を使った範囲検索 | BYOC"
slug: /range-search-with-struct-arrays
sidebar_label: "範囲検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクトルサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に入るベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索とともに範囲検索を使用します。 | BYOC"
type: origin
token: ZR1bwJFFSio2jkkabd7c1YAYncf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った範囲検索

このページでは、StructArray ベクトルサブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に入るベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索とともに範囲検索を使用します。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクトルサブフィールドは、`COSINE`、`IP`、`L2` などの通常のベクトルメトリックを使った要素レベル検索用にインデックス化されています。

## StructArray に範囲検索を適用する方法\{#how-range-search-applies-to-structarray}

| 検索モード | 範囲検索の動作 | 結果の粒度 |
| --- | --- | --- |
| EmbeddingList search | サポートされていません。 | 該当なし。 |
| 要素レベル検索 | `radius` と、必要に応じて `range_filter` を指定した通常のベクトルクエリを使用します。 | Struct 要素レベル。 |
| Hybrid search | StructArray リクエストが要素レベルのベクトルフィールドを対象とする場合にサポートされます。EmbeddingList レベルのリクエストでは範囲検索はサポートされません。 | 要素レベルのサブ検索の後、ハイブリッド再ランキング。 |

<Admonition type="info" icon="📘" title="注意">

最も近い Struct 要素だけが必要な場合は、まず [StructArray を使った基本ベクトル検索](./search-with-struct-array) を参照してください。上位 K 件のランキングだけでなく、結果がスコアまたは距離の境界を満たす必要がある場合は範囲検索を使用します。

</Admonition>

## 始める前に\{#before-you-begin}

範囲検索を実行する前に、collection、データ、インデックスを準備します。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection に `chunks` などの StructArray フィールドが含まれていること。 |
| 要素レベルのベクトルサブフィールド | 対象のベクトルサブフィールドは `chunks[emb]` であり、`chunks[emb_list_vector]` ではありません。 |
| インデックスメトリック | ベクトルサブフィールドが `COSINE`、`IP`、`L2` などの通常のベクトルメトリックでインデックス化されていること。 |
| クエリデータ | クエリが通常のベクトルであり、`EmbeddingList` ではないこと。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## radius と range_filter を使う\{#use-radius-and-rangefilter}

検索境界を定義するには `radius` を設定します。内側の境界も必要な場合は `range_filter` を設定します。方向は、より小さい距離が良いのか、より大きい類似度スコアが良いのかによって異なります。

| Metric type | より高いスコアの方が良いですか？ | `range_filter` を使用する場合の範囲条件 |
| --- | --- | --- |
| `L2` | いいえ。より小さい距離の方が良いです。 | `range_filter <= distance < radius` |
| `IP`, `COSINE` | はい。より大きいスコアの方が良いです。 | `radius < distance <= range_filter` |

`radius` のみを設定した場合、範囲検索はそのメトリックの外側境界を満たすヒットを返します。埋め込みのスコアまたは距離のスケールに応じて値を選択してください。

## 要素レベルの範囲検索を実行する\{#run-element-level-range-search}

次の例では、`chunks[emb]` ベクトルがクエリベクトルに十分似ている個々の chunk を検索します。各結果ヒットは一致した Struct 要素を表します。

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

この例では、`COSINE` は類似度型のメトリックであるため、結果の範囲は `radius` より大きく、`range_filter` 以下になります。返される場合、`offset` の値は `chunks` 配列内で一致した Struct 要素を識別します。

## scalar フィルターを追加する\{#add-scalar-filters}

要素レベルの範囲検索を StructArray scalar フィルタリングと組み合わせることができます。親エンティティのフィールドにはトップレベル述語を使用し、ベクトル範囲検索に参加する Struct 要素を制限するには `element_filter` を使用します。

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

トップレベル述語は候補エンティティを選択します。`element_filter` 述語は、一致する Struct 要素に対してのみベクトル範囲検索を行うよう制限します。フィルタリングのその他の例については、[StructArray を使ったフィルター付き検索](./filtered-search-with-struct-arrays) を参照してください。

## Hybrid search で範囲検索を使う\{#use-range-search-in-hybrid-search}

StructArray の要素レベルベクトルフィールドは、hybrid search での範囲検索をサポートします。StructArray の要素レベルベクトルフィールドを対象とする `AnnSearchRequest` に、`radius` と必要に応じて `range_filter` を追加します。

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

この例では、`chunks[emb]` サブリクエストのみが範囲検索パラメーターを使用しています。StructArray リクエストは引き続き要素レベルのセマンティクスに従います。ハイブリッド検索が結果を結合して再ランキングする前に、範囲境界は Struct 要素ヒットに適用されます。

## 範囲検索結果を解釈する\{#interpret-range-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | 一致した Struct 要素を含むエンティティの主キー。 |
| `distance` または score | クエリベクトルと一致した Struct 要素ベクトルの間のスコアまたは距離。 |
| `offset` | 返される場合、StructArray フィールド内における一致した Struct 要素の 0 ベース位置。 |
| 重複する主キー | 起こり得ます。同じエンティティ内の複数の Struct 要素が指定された範囲内に入ることがあります。 |
| `limit` | 一意な親エンティティではなく、要素ヒットに適用されます。 |

## 制限事項\{#limitations}

- StructArray ベクトルサブフィールドに対する範囲検索では、`EmbeddingList` クエリや `MAX_SIM*` メトリックを使用しないでください。EmbeddingList レベルの検索は範囲検索をサポートしていません。

- 範囲検索を grouping search と組み合わせないでください。親エンティティごとに 1 件の結果が必要な場合は、範囲パラメーターなしで要素レベル検索を実行し、サポートされている場合は grouping を使用してください。

- ハイブリッド範囲検索は StructArray の要素レベルベクトルフィールドでサポートされています。EmbeddingList レベルの StructArray リクエストではサポートされていません。

## よくある間違い\{#common-mistakes}

- `chunks[emb_list_vector]` に対して範囲検索を実行すること。これは EmbeddingList search 用です。

- 要素レベルの範囲検索で `COSINE` のような通常のメトリックではなく `MAX_SIM_COSINE` を使用すること。

- 通常のベクトルクエリの代わりに `EmbeddingList` クエリを使用すること。

- 範囲検索結果が親エンティティごとに一意であると期待すること。範囲検索は一致した Struct 要素ヒットを返します。

- 必要なサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使うこと。

## 次のステップ\{#next-steps}

1. StructArray ベクトル検索の 2 つの基本モードについて学ぶには、[StructArray を使った基本ベクトル検索](./search-with-struct-array) を読んでください。

1. 範囲検索に scalar フィルターを追加するには、[StructArray を使ったフィルター付き検索](./filtered-search-with-struct-arrays) を読んでください。

1. サポートされている場合に親エンティティごとに最大 1 件の結果を返すには、[StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) を読んでください。

1. バージョン固有の検索制限を確認するには、[StructArray の制限](./struct-array-limits) を読んでください。


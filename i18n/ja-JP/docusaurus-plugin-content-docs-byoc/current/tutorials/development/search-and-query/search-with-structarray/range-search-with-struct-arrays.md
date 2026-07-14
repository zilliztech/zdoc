---
title: "StructArray を使った範囲検索 | BYOC"
slug: /range-search-with-struct-arrays
sidebar_label: "範囲検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の vector サブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まる vector ヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルの vector 検索で範囲検索を使用します。 | BYOC"
type: origin
token: ZR1bwJFFSio2jkkabd7c1YAYncf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った範囲検索

このページでは、StructArray の vector サブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まる vector ヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルの vector 検索で範囲検索を使用します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` vector サブフィールドは、`COSINE`、`IP`、`L2` などの通常の vector metric を使用した要素レベル検索向けに index 化されています。

## StructArray への範囲検索の適用方法\{#how-range-search-applies-to-structarray}

| 検索モード | 範囲検索の動作 | 結果の粒度 |
| --- | --- | --- |
| EmbeddingList search | サポートされていません。 | 該当なし。 |
| 要素レベル検索 | `radius` と、必要に応じて `range_filter` を指定した通常の vector クエリを使用します。 | Struct 要素レベル。 |
| ハイブリッド検索 | StructArray リクエストが要素レベルの vector フィールドを対象とする場合にサポートされます。EmbeddingList レベルのリクエストでは範囲検索はサポートされません。 | 要素レベルのサブ検索、その後ハイブリッド reranking。 |

<Admonition type="info" icon="📘" title="メモ">

最も近い Struct 要素だけが必要な場合は、まず [StructArray を使った基本的な Vector Search](./search-with-struct-array) から始めてください。top-K ランキングだけではなく、スコアまたは距離の境界を満たす結果が必要な場合に範囲検索を使用します。

</Admonition>

## 始める前に\{#before-you-begin}

範囲検索を実行する前に、collection、データ、index を準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection に `chunks` などの StructArray フィールドが含まれていること。 |
| 要素レベルの vector サブフィールド | 対象の vector サブフィールドが `chunks[emb]` であり、`chunks[emb_list_vector]` ではないこと。 |
| Index metric | vector サブフィールドが `COSINE`、`IP`、`L2` などの通常の vector metric で index 化されていること。 |
| クエリデータ | クエリが `EmbeddingList` ではなく通常の vector であること。 |

index の設定については、[StructArray フィールドの index 化](./index-struct-array) を参照してください。

## radius と range_filter を使う\{#use-radius-and-rangefilter}

検索境界を定義するには `radius` を設定します。内側の境界も必要な場合は `range_filter` を設定します。方向は、距離が小さいほど良いのか、類似度スコアが大きいほど良いのかによって異なります。

| Metric type | 高いスコアのほうが良いですか？ | `range_filter` を使用する場合の範囲条件 |
| --- | --- | --- |
| `L2` | いいえ。距離が小さいほど良いです。 | `range_filter <= distance < radius` |
| `IP`, `COSINE` | はい。スコアが大きいほど良いです。 | `radius < distance <= range_filter` |

`radius` のみを設定した場合、範囲検索は metric の外側境界を満たすヒットを返します。埋め込みのスコアまたは距離スケールに応じて値を選択してください。

## 要素レベルの範囲検索を実行する\{#run-element-level-range-search}

次の例では、`chunks[emb]` vector がクエリ vector に対して十分に類似している個々の chunks を検索します。各結果ヒットは、マッチした Struct 要素を表します。

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

この例では、`COSINE` は類似度スタイルの metric であるため、結果の範囲は `radius` より大きく、`range_filter` 以下になります。返された場合、`offset` の値は `chunks` 配列内でマッチした Struct 要素を識別します。

## scalar フィルターを追加する\{#add-scalar-filters}

要素レベルの範囲検索を StructArray scalar フィルタリングと組み合わせることができます。親 entity フィールドにはトップレベル述語を使用し、vector 範囲検索に参加する Struct 要素を制限するには `element_filter` を使用します。

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

トップレベル述語は候補 entity を選択します。`element_filter` 述語は、マッチする Struct 要素のみに vector 範囲検索を制限します。フィルタリングの例については、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

## ハイブリッド検索で範囲検索を使う\{#use-range-search-in-hybrid-search}

StructArray の要素レベル vector フィールドは、ハイブリッド検索で範囲検索をサポートします。StructArray の要素レベル vector フィールドを対象とする `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加します。

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

この例では、`chunks[emb]` サブリクエストのみが範囲検索パラメータを使用します。StructArray リクエストは引き続き要素レベルのセマンティクスに従います。ハイブリッド検索が結果を結合して rerank する前に、範囲境界は Struct 要素ヒットに適用されます。

## 範囲検索結果を解釈する\{#interpret-range-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | マッチした Struct 要素を含む entity の主キー。 |
| `distance` または score | クエリ vector とマッチした Struct 要素 vector の間のスコアまたは距離。 |
| `offset` | 返された場合、StructArray フィールド内でのマッチした Struct 要素の 0 ベース位置。 |
| 繰り返される主キー | あり得ます。同じ entity 内の複数の Struct 要素が指定範囲内に入ることがあります。 |
| `limit` | 一意な親 entity ではなく、要素ヒットに適用されます。 |

## 制限事項\{#limitations}

- StructArray vector サブフィールドの範囲検索では、`EmbeddingList` クエリや `MAX_SIM*` metric を使用しないでください。EmbeddingList レベルの検索では範囲検索はサポートされません。

- 範囲検索を grouping search と組み合わせないでください。親 entity ごとに 1 件の結果が必要な場合は、範囲パラメータなしで要素レベル検索を実行し、サポートされている場合は grouping を使用してください。

- ハイブリッド範囲検索は StructArray の要素レベル vector フィールドでサポートされます。EmbeddingList レベルの StructArray リクエストではサポートされません。

## よくある間違い\{#common-mistakes}

- EmbeddingList search 用の `chunks[emb_list_vector]` に対して範囲検索を実行すること。

- 要素レベルの範囲検索で `COSINE` などの通常の metric ではなく `MAX_SIM_COSINE` を使用すること。

- 通常の vector クエリではなく `EmbeddingList` クエリを使用すること。

- 範囲検索の結果が親 entity ごとに一意になると期待すること。範囲検索はマッチした Struct 要素ヒットを返します。

- 必須のサブフィールドパス構文 `chunks[emb]` の代わりに `chunks.emb` を使うこと。

## 次のステップ\{#next-steps}

1. StructArray vector search の 2 つの基本モードについて学ぶには、[StructArray を使った基本的な Vector Search](./search-with-struct-array) を参照してください。

1. 範囲検索に scalar フィルターを追加するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. サポートされている場合に親 entity ごとに最大 1 件の結果を返すには、[StructArray を使った Grouping Search](./grouping-search-with-struct-array) を参照してください。

1. バージョンごとの検索制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


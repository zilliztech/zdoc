---
title: "StructArray を使用した範囲検索 | BYOC"
slug: /range-search-with-struct-arrays
sidebar_label: "範囲検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の vector サブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まる vector ヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルの vector 検索とともに範囲検索を使用します。 | BYOC"
type: origin
token: ZR1bwJFFSio2jkkabd7c1YAYncf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用した範囲検索

このページでは、StructArray の vector サブフィールドに対して範囲検索を実行する方法を説明します。範囲検索は、スコアまたは距離が指定された境界内に収まる vector ヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルの vector 検索とともに範囲検索を使用します。

このページでは、[StructArray フィールドの作成](./create-struct-array) にある `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` vector サブフィールドは、`COSINE`、`IP`、または `L2` などの通常の vector metric を使用した要素レベル検索用にインデックス化されています。

## 範囲検索が StructArray にどのように適用されるか\{#how-range-search-applies-to-structarray}

| Search mode | 範囲検索の動作 | 結果の粒度 |
| --- | --- | --- |
| EmbeddingList search | サポートされていません。 | 該当なし。 |
| Element-level search | `radius` と、必要に応じて `range_filter` を使用した通常の vector クエリを使います。 | Struct 要素レベル。 |
| Hybrid search | StructArray リクエストが要素レベルの vector フィールドを対象とする場合にサポートされます。EmbeddingList レベルのリクエストでは範囲検索はサポートされません。 | 要素レベルのサブ検索、その後 hybrid reranking。 |

<Admonition type="info" icon="📘" title="注">

最も近い Struct 要素のみが必要な場合は、まず [StructArray を使用した基本 vector 検索](./search-with-struct-array) から始めてください。範囲検索は、結果が top-K ランキングだけでなく、スコアまたは距離の境界も満たす必要がある場合に使用します。

</Admonition>

## 始める前に\{#before-you-begin}

範囲検索を実行する前に、collection、データ、およびインデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection に `chunks` などの StructArray フィールドが含まれていること。 |
| 要素レベルの vector サブフィールド | 対象の vector サブフィールドは `chunks[emb]` であり、`chunks[emb_list_vector]` ではありません。 |
| インデックス metric | vector サブフィールドが、`COSINE`、`IP`、または `L2` などの通常の vector metric でインデックス化されていること。 |
| クエリデータ | クエリは `EmbeddingList` ではなく通常の vector です。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## radius と range_filter を使用する\{#use-radius-and-rangefilter}

検索境界を定義するには `radius` を設定します。内側の境界も必要な場合は `range_filter` を設定します。方向は、より小さい距離の方が良いのか、より大きい類似度スコアの方が良いのかによって異なります。

| Metric type | 高いスコアの方が良いですか？ | `range_filter` を使用する場合の範囲条件 |
| --- | --- | --- |
| `L2` | いいえ。より小さい距離の方が良いです。 | `range_filter <= distance < radius` |
| `IP`, `COSINE` | はい。より大きいスコアの方が良いです。 | `radius < distance <= range_filter` |

`radius` のみを設定した場合、範囲検索はその metric の外側の境界を満たすヒットを返します。embedding のスコアまたは距離のスケールに応じて値を選択してください。

## 要素レベルの範囲検索を実行する\{#run-element-level-range-search}

次の例では、`chunks[emb]` vector がクエリ vector と十分に類似している個々の chunk を検索します。各結果ヒットは、一致した Struct 要素を表します。

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

この例では、`COSINE` は類似度スタイルの metric であるため、結果の範囲は `radius` より大きく、`range_filter` 以下になります。`offset` 値が返された場合は、`chunks` 配列内で一致した Struct 要素を識別します。

## scalar フィルターを追加する\{#add-scalar-filters}

要素レベルの範囲検索を StructArray scalar フィルタリングと組み合わせることができます。親エンティティのフィールドにはトップレベルの述語を使用し、どの Struct 要素が vector 範囲検索に参加するかを制限するには `element_filter` を使用します。

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

トップレベルの述語は候補エンティティを選択します。`element_filter` 述語は、一致する Struct 要素に対してのみ vector 範囲検索を行うよう制限します。フィルタリングのその他の例については、[StructArray を使用したフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

## hybrid search で範囲検索を使用する\{#use-range-search-in-hybrid-search}

StructArray の要素レベル vector フィールドは、hybrid search での範囲検索をサポートしています。StructArray の要素レベル vector フィールドを対象とする `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加します。

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

この例では、`chunks[emb]` サブリクエストのみが範囲検索パラメータを使用しています。StructArray リクエストは引き続き要素レベルのセマンティクスに従います。hybrid search が結果を結合して rerank する前に、範囲境界は Struct 要素ヒットに適用されます。

## 範囲検索結果を解釈する\{#interpret-range-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | 一致した Struct 要素を含むエンティティの主キー。 |
| `distance` または score | クエリ vector と一致した Struct 要素 vector の間のスコアまたは距離。 |
| `offset` | 返された場合、一致した Struct 要素の StructArray フィールド内でのゼロベース位置。 |
| 繰り返される主キー | 発生する可能性があります。同じエンティティ内の複数の Struct 要素が指定範囲内に入ることがあります。 |
| `limit` | 一意の親エンティティではなく、要素ヒットに適用されます。 |

## 制限事項\{#limitations}

- StructArray vector サブフィールドに対する範囲検索では、`EmbeddingList` クエリまたは `MAX_SIM*` metric を使用しないでください。EmbeddingList レベルの検索は範囲検索をサポートしていません。

- 範囲検索を grouping search と組み合わせないでください。親エンティティごとに 1 件の結果が必要な場合は、範囲パラメータなしで要素レベル検索を実行し、サポートされている場合は grouping を使用してください。

- hybrid 範囲検索は StructArray の要素レベル vector フィールドでサポートされています。EmbeddingList レベルの StructArray リクエストではサポートされていません。

## よくある間違い\{#common-mistakes}

- EmbeddingList search 用の `chunks[emb_list_vector]` に対して範囲検索を実行すること。

- 要素レベル範囲検索で `COSINE` のような通常の metric ではなく `MAX_SIM_COSINE` を使用すること。

- 通常の vector クエリではなく `EmbeddingList` クエリを使用すること。

- 範囲検索の結果が親エンティティ単位で一意になると期待すること。範囲検索は一致した Struct 要素ヒットを返します。

- 必須のサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使用すること。

## 次のステップ\{#next-steps}

1. StructArray の 2 つの基本的な vector 検索モードについて学ぶには、[StructArray を使用した基本 vector 検索](./search-with-struct-array) を参照してください。

1. 範囲検索に scalar フィルターを追加するには、[StructArray を使用したフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

1. サポートされている環境で親エンティティごとに最大 1 件の結果を返すには、[StructArray を使用した Grouping Search](./grouping-search-with-struct-array) を参照してください。

1. バージョン固有の検索制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


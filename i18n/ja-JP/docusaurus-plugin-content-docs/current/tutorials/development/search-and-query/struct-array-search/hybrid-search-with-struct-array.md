---
title: "StructArray を使ったハイブリッド検索 | Cloud"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の vector 検索を他の vector 検索と 1 つのハイブリッド検索リクエストに組み合わせる方法を説明します。StructArray のハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果を返すことができます。 | Cloud"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったハイブリッド検索

このページでは、StructArray の vector 検索を他の vector 検索と 1 つのハイブリッド検索リクエストに組み合わせる方法を説明します。StructArray のハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果を返すことができます。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には、`title_vector` という名前のトップレベル vector フィールドと、`chunks` という StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドには EmbeddingList 検索用のインデックスが作成されており、`chunks[emb]` には element レベル検索用のインデックスが作成されています。

## StructArray に対するハイブリッド検索の適用方法\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補のスコープ | 結果の挙動 | `element_scope` |
| --- | --- | --- | --- |
| Collection レベルの vector フィールド + StructArray の EmbeddingList サブフィールド | Entity レベル | 最終候補は primary key をキーにします。 | 使用しないでください。 |
| Collection レベルの vector フィールド + StructArray の element レベル サブフィールド | Entity レベル | Element レベルのヒットは、ハイブリッド再ランキングの前に entity レベルの候補へ集約されます。 | StructArray の element レベル `AnnSearchRequest` で任意の collapse 設定が可能です。 |
| 同じ StructArray フィールド配下の複数の element レベル サブフィールド | Element レベル | 最終候補は primary key と Struct element offset を組み合わせてキー化されます。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の element レベル サブフィールド | Entity レベル | Element offset は同一性を共有しないため、それぞれの StructArray element レベル `AnnSearchRequest` は再ランキング前に collapse されます。 | 各 StructArray element レベル `AnnSearchRequest` で任意の collapse 設定が可能です。 |

<Admonition type="warning" icon="🚧" title="警告">

`element_scope` は、同一 Struct ではない element レベルのハイブリッド検索において、StructArray element レベル `AnnSearchRequest` オブジェクトの collapse を設定する場合にのみ使用してください。EmbeddingList リクエスト、collection レベルの vector リクエスト、または同一 StructArray の element レベル ハイブリッド検索には使用しないでください。

</Admonition>

## 始める前に\{#before-you-begin}

ハイブリッド検索を実行する前に、collection、データ、インデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | Collection に `chunks` のような StructArray フィールドが含まれていること。 |
| Vector サブフィールド | EmbeddingList 検索用と element レベル検索用に別々の vector サブフィールドを使用すること。 |
| インデックス | `chunks[emb_list_vector]` は `MAX_SIM*` メトリックを使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector メトリックを使用します。 |
| Reranker | `RRFRanker` またはアプリケーションでサポートされている別の reranker など、ハイブリッド reranker を選択してください。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray の vector サブフィールドに対する EmbeddingList 検索は、ハイブリッド検索では entity レベルです。これは entity レベルの vector 検索リクエストのように動作し、一致した 1 つの Struct element offset は返しません。

```python
from pymilvus import AnnSearchRequest, MilvusClient, RRFRanker
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query_vector = [0.19, 0.24, 0.30, 0.37]

query_list = EmbeddingList()
query_list.add([0.12, 0.21, 0.32, 0.44])
query_list.add([0.18, 0.23, 0.29, 0.36])

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    limit=10,
)

chunk_list_req = AnnSearchRequest(
    data=[query_list],
    anns_field="chunks[emb_list_vector]",
    limit=10,
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_list_req],
    ranker=RRFRanker(),
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)
```

この例では、両方の `AnnSearchRequest` オブジェクトが entity レベルの候補を生成します。最終結果は親 entity の primary key をキーにします。EmbeddingList リクエストに `element_scope` を追加しないでください。

## 同一 StructArray の element レベル ハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の element レベル vector サブフィールドを対象とする場合、ハイブリッド検索は再ランキングの間も element レベル候補を維持できます。これは、最終結果が element レベルのままになる唯一の StructArray ハイブリッドモードです。

次の例では、`chunks` StructArray フィールドに 2 つの element レベル vector サブフィールド `chunks[emb]` と `chunks[code_emb]` があり、両方とも通常の vector メトリックを使用していることを前提としています。

```python
index_chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    limit=10,
    expr='element_filter(chunks, $[section] == "index")',
)

code_chunk_req = AnnSearchRequest(
    data=[code_query_vector],
    anns_field="chunks[code_emb]",
    limit=10,
    expr='element_filter(chunks, $[has_code] == true)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[index_chunk_req, code_chunk_req],
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

for hits in results:
    for hit in hits:
        print(
            "doc_id:", hit["id"],
            "distance:", hit["distance"],
            "offset:", hit.get("offset"),
            "entity:", hit["entity"],
        )
```

両方の `AnnSearchRequest` オブジェクトは `chunks` 配下の vector サブフィールドを検索します。同じ 0 ベースの offset は同じ Struct element を指すため、ハイブリッド reranker は element 候補を直接ランキングできます。このモードでは entity レベル collapse は実行されないため、`element_scope` を設定しないでください。

## Entity レベルのハイブリッド検索のために element レベルのヒットを collapse する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索で、StructArray の element レベル `AnnSearchRequest` を collection レベルの vector リクエスト、EmbeddingList リクエスト、または別の StructArray フィールド配下の element レベル リクエストと組み合わせる場合、最終候補のスコープは entity レベルになります。この場合、各 StructArray element レベル `AnnSearchRequest` は、ハイブリッド再ランキングの前に entity レベル候補へ collapse されます。

同じ entity 内で複数一致した element をどのように collapse するかを制御したい場合は、StructArray element レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用してください。

```python
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
            "element_scope": {
                "collapse": {
                    "strategy": "topk_sum",
                    "topk": 3,
                },
            },
        },
    },
    limit=30,
    expr='element_filter(chunks, $[quality_score] > 0.8)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
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

この例では、`title_req` は entity レベルであるため、最終的なハイブリッド結果も entity レベルになります。`chunk_req` リクエストはまず `chunks[emb]` から element ヒットを返し、その後、同じ entity から返された element を、最良の 3 つの element スコアの合計によって collapse します。Entity レベル collapse が必要な場面で `element_scope` を省略した場合、collapse 戦略のデフォルトは `max` になります。

## Collapse 戦略を選ぶ\{#choose-a-collapse-strategy}

| Strategy | 挙動 | `topk` | メトリック要件 |
| --- | --- | --- | --- |
| `max` | Entity に対して最良の返却 element スコアを保持します。 | 使用不可。 | サポートされている任意の通常の vector メトリック。 |
| `sum` | Entity に対して返却されたすべての element スコアを合計します。 | 使用不可。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `avg` | Entity に対して返却されたすべての element スコアを平均します。 | 使用不可。 | サポートされている任意の通常の vector メトリック。 |
| `topk_sum` | Entity に対して最良の `K` 件の返却 element スコアを合計します。 | 必須であり、正の値でなければなりません。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `topk_avg` | Entity に対して最良の `K` 件の返却 element スコアを平均します。 | 必須であり、正の値でなければなりません。 | サポートされている任意の通常の vector メトリック。 |

Collapse で使用されるのは、その StructArray element レベル `AnnSearchRequest` が返した element ヒットのみです。ANN 検索後に entity 内のすべての Struct element を走査するわけではありません。Collapse に利用したい element を十分に確保できるよう、リクエストの `limit` を十分高く設定してください。

## フィルター、範囲検索、グルーピングを追加する\{#add-filters-range-search-and-grouping}

スカラー条件を vector 検索に参加する同じ Struct element に適用したい場合は、StructArray element レベル `AnnSearchRequest` に `element_filter` を追加できます。親 entity に対する条件には、`hybrid_search()` のトップレベル `filter` も使用できます。

StructArray の element レベル vector フィールドは、ハイブリッド検索で範囲検索をサポートしています。`radius` と、必要に応じて `range_filter` を element レベル `AnnSearchRequest` に追加してください。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしていません。

Element レベルのハイブリッド grouping は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の element レベル vector フィールドを対象としている場合にのみサポートされ、`group_by_field` は primary key でなければなりません。Collection レベルの vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させた場合、ハイブリッド grouping はサポートされません。範囲検索と grouping を組み合わせないでください。

## ハイブリッド検索結果を解釈する\{#interpret-hybrid-results}

| 最終候補のスコープ | 結果キー | Offset の挙動 | 発生する条件 |
| --- | --- | --- | --- |
| Entity レベル | Primary key。 | 最終結果に element offset は含まれません。 | ハイブリッドリクエストに collection レベルの vector フィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の element レベル リクエストが含まれる場合。 |
| Element レベル | Primary key + 親 StructArray フィールド + element offset。 | API または SDK によって公開されていれば、選択された element offset が返されることがあります。 | すべての `AnnSearchRequest` オブジェクトが element レベルで、かつ同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索で entity レベル候補へ collapse する必要がある StructArray element レベル `AnnSearchRequest` オブジェクトにのみ使用してください。

- `element_scope` を EmbeddingList リクエスト、collection レベルの vector リクエスト、または同一 StructArray の element レベル ハイブリッド検索に使用しないでください。

- `sum` および `topk_sum` の collapse 戦略には、`IP` や `COSINE` などの正の相関を持つメトリックが必要です。これらを `L2` で使用しないでください。

- `topk_sum` および `topk_avg` には正の `topk` 値が必要です。その他の collapse 戦略には `topk` を含めてはいけません。

- EmbeddingList レベルの StructArray リクエストは、範囲検索または group-by をサポートしていません。

- ハイブリッド group-by は、同一 StructArray の element レベル ハイブリッド検索で primary key に対してのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- 同一 StructArray の element レベル ハイブリッドリクエストに `element_scope` を追加すること。このリクエストは element レベルのままであり、entity レベル collapse は行いません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでに entity レベルです。

- 2 つの StructArray フィールドが element offset を共有すると考えること。`chunks` の offset `3` と別の StructArray フィールドの offset `3` は異なる element なので、ハイブリッドリクエストは entity レベルになります。

- `L2` で `topk_sum` を使用すること。負の distance メトリックには `max`、`avg`、または `topk_avg` を使用してください。

- Collapse 後の entity レベルのハイブリッド結果に、選択された Struct element offset が含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray の 2 つの基本的な vector 検索モードについては、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索に scalar フィルターを追加するには、[StructArray を使ったフィルタリング検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは distance の境界を使用するには、[StructArray を使った範囲検索](./range-search-with-struct-arrays) を参照してください。

1. Element レベルのハイブリッド結果を親 entity ごとにグループ化するには、[StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


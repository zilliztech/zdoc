---
title: "StructArray を使用したハイブリッド検索 | BYOC"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクトル検索を他のベクトル検索と 1 つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray ハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果を生成できます。 | BYOC"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用したハイブリッド検索

このページでは、StructArray ベクトル検索を他のベクトル検索と 1 つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray ハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果を生成できます。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には、`title_vector` という名前のトップレベル vector フィールドと、`chunks` という StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドには EmbeddingList 検索用の index が作成されており、`chunks[emb]` サブフィールドには element レベル検索用の index が作成されています。

## StructArray にハイブリッド検索を適用する方法\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補のスコープ | 結果の動作 | `element_scope` |
| --- | --- | --- | --- |
| collection レベル vector フィールド + StructArray EmbeddingList サブフィールド | entity レベル | 最終候補は主キーで識別されます。 | 使用しないでください。 |
| collection レベル vector フィールド + StructArray element レベル サブフィールド | entity レベル | element レベルのヒットは、ハイブリッド reranking の前に entity レベル候補へ集約されます。 | StructArray element レベル `AnnSearchRequest` で任意の collapse 設定が可能です。 |
| 同じ StructArray フィールド配下の複数の element レベル サブフィールド | element レベル | 最終候補は主キーと Struct element オフセットで識別されます。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の element レベル サブフィールド | entity レベル | element オフセットは同一性を共有しないため、各 StructArray element レベル `AnnSearchRequest` は reranking 前に集約されます。 | 各 StructArray element レベル `AnnSearchRequest` で任意の collapse 設定が可能です。 |

<Admonition type="warning" icon="🚧" title="警告">

`element_scope` は、同一 Struct ではない element レベルのハイブリッド検索において、StructArray element レベル `AnnSearchRequest` オブジェクトの collapse を設定する場合にのみ使用してください。EmbeddingList リクエスト、collection レベル vector リクエスト、または同一 StructArray の element レベル ハイブリッド検索には使用しないでください。

</Admonition>

## 開始する前に\{#before-you-begin}

ハイブリッド検索を実行する前に、collection、データ、および index を準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection には、`chunks` のような StructArray フィールドが含まれている必要があります。 |
| vector サブフィールド | EmbeddingList 検索用と element レベル検索用に別々の vector サブフィールドを使用します。 |
| index | `chunks[emb_list_vector]` は `MAX_SIM*` metric を使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metric を使用します。 |
| Reranker | `RRFRanker` またはアプリケーションでサポートされる別の reranker など、ハイブリッド reranker を選択します。 |

index の設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray vector サブフィールドに対する EmbeddingList 検索は、ハイブリッド検索では entity レベルです。これは entity レベル vector 検索リクエストのように動作し、一致した Struct element オフセットを 1 つ返すことはありません。

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

この例では、両方の `AnnSearchRequest` オブジェクトが entity レベルの候補を生成します。最終結果は親 entity の主キーで識別されます。EmbeddingList リクエストに `element_scope` を追加しないでください。

## 同一 StructArray の element レベル ハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが、同じ StructArray フィールド配下の element レベル vector サブフィールドを対象とする場合、ハイブリッド検索は reranking を通して element レベル候補を保持できます。これは、最終結果が element レベルのまま維持される唯一の StructArray ハイブリッドモードです。

次の例では、`chunks` StructArray フィールドに 2 つの element レベル vector サブフィールド `chunks[emb]` と `chunks[code_emb]` があり、両方とも通常の vector metric を使用していることを前提としています。

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

両方の `AnnSearchRequest` オブジェクトは `chunks` 配下の vector サブフィールドを検索します。同じゼロベースのオフセットは同じ Struct element を指すため、ハイブリッド reranker は element 候補を直接ランク付けできます。このモードでは entity レベルの collapse は実行されないため、`element_scope` を設定しないでください。

## entity レベル ハイブリッド検索のために element レベルのヒットを集約する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索で StructArray element レベル `AnnSearchRequest` を、collection レベル vector リクエスト、EmbeddingList リクエスト、または別の StructArray フィールド配下の element レベル リクエストと混在させる場合、最終候補のスコープは entity レベルになります。この場合、各 StructArray element レベル `AnnSearchRequest` は、ハイブリッド reranking の前に entity レベル候補へ集約されます。

同じ entity に属する複数の一致 element をどのように集約するかを制御したい場合は、StructArray element レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用します。

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

この例では、`title_req` は entity レベルであるため、最終的なハイブリッド結果も entity レベルになります。`chunk_req` リクエストは最初に `chunks[emb]` から element ヒットを返し、その後、同じ entity から返された element を、最良の 3 つの element スコアを合計することで集約します。entity レベルの collapse が必要な場面で `element_scope` を省略した場合、collapse 戦略のデフォルトは `max` です。

## collapse 戦略を選択する\{#choose-a-collapse-strategy}

| 戦略 | 動作 | `topk` | metric 要件 |
| --- | --- | --- | --- |
| `max` | entity に対して返された最良の element スコアを保持します。 | 使用不可。 | サポートされている任意の通常の vector metric。 |
| `sum` | entity に対して返されたすべての element スコアを合計します。 | 使用不可。 | `IP` や `COSINE` など、正の相関を持つ metric のみ。 |
| `avg` | entity に対して返されたすべての element スコアを平均します。 | 使用不可。 | サポートされている任意の通常の vector metric。 |
| `topk_sum` | entity に対して返された最良の `K` 件の element スコアを合計します。 | 必須であり、正の値である必要があります。 | `IP` や `COSINE` など、正の相関を持つ metric のみ。 |
| `topk_avg` | entity に対して返された最良の `K` 件の element スコアを平均します。 | 必須であり、正の値である必要があります。 | サポートされている任意の通常の vector metric。 |

collapse は、その StructArray element レベル `AnnSearchRequest` が返した element ヒットのみを使用します。ANN 検索後に entity 内のすべての Struct element を走査することはありません。collapse に使用したい element が十分に得られるよう、リクエストの `limit` を十分高く設定してください。

## フィルタ、範囲検索、およびグループ化を追加する\{#add-filters-range-search-and-grouping}

スカラー条件を、vector 検索に参加する同じ Struct element に適用したい場合は、StructArray element レベル `AnnSearchRequest` に `element_filter` を付加できます。親 entity に対する条件には、`hybrid_search()` にトップレベルの `filter` を使用することもできます。

StructArray element レベル vector フィールドは、ハイブリッド検索で範囲検索をサポートしています。`radius` と、必要に応じて `range_filter` を element レベル `AnnSearchRequest` に追加してください。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしていません。

element レベルのハイブリッド group-by は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の element レベル vector フィールドを対象とする場合にのみサポートされ、`group_by_field` は主キーでなければなりません。collection レベル vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストが混在する場合、ハイブリッド group-by はサポートされません。範囲検索と group-by を組み合わせないでください。

## ハイブリッド結果を解釈する\{#interpret-hybrid-results}

| 最終候補のスコープ | 結果キー | オフセットの動作 | 発生する条件 |
| --- | --- | --- | --- |
| entity レベル | 主キー。 | 最終結果に element オフセットは含まれません。 | ハイブリッドリクエストに、collection レベル vector フィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の element レベル リクエストが含まれる場合。 |
| element レベル | 主キー + 親 StructArray フィールド + element オフセット。 | API または SDK で公開されている場合、選択された element オフセットが返されることがあります。 | すべての `AnnSearchRequest` オブジェクトが element レベルであり、同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索で entity レベル候補へ集約する必要がある StructArray element レベル `AnnSearchRequest` オブジェクトにのみ使用してください。

- `element_scope` を EmbeddingList リクエスト、collection レベル vector リクエスト、または同一 StructArray の element レベル ハイブリッド検索に使用しないでください。

- `sum` および `topk_sum` の collapse 戦略には、`IP` や `COSINE` などの正の相関を持つ metric が必要です。`L2` と一緒に使用しないでください。

- `topk_sum` と `topk_avg` には正の `topk` 値が必要です。その他の collapse 戦略には `topk` を含めてはいけません。

- EmbeddingList レベルの StructArray リクエストは範囲検索や group-by をサポートしていません。

- ハイブリッド group-by は、同一 StructArray の element レベル ハイブリッド検索で、かつ主キーによる場合にのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- 同一 StructArray の element レベル ハイブリッドリクエストに `element_scope` を追加すること。このリクエストは element レベルのままであり、entity レベルの collapse は実行されません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでに entity レベルです。

- 2 つの StructArray フィールドが element オフセットを共有すると考えること。`chunks` のオフセット `3` と、別の StructArray フィールドのオフセット `3` は異なる element であるため、ハイブリッドリクエストは entity レベルになります。

- `L2` で `topk_sum` を使用すること。負の distance metric には `max`、`avg`、または `topk_avg` を使用してください。

- 集約後の entity レベル ハイブリッド結果に、選択された Struct element オフセットが含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray ベクトル検索の 2 つの基本モードを学ぶには、[StructArray を使用した基本ベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索にスカラー フィルタを追加するには、[StructArray を使用したフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは distance の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 親 entity ごとに element レベルのハイブリッド結果をグループ化するには、[StructArray を使用したグループ検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


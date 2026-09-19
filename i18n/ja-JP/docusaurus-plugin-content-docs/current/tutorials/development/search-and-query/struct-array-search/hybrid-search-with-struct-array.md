---
title: "StructArray を使ったハイブリッド検索 | Cloud"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray のベクトル検索と他のベクトル検索を 1 つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray のハイブリッド検索では、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果が得られます。 | Cloud"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったハイブリッド検索

このページでは、StructArray のベクトル検索と他のベクトル検索を 1 つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray のハイブリッド検索では、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果が得られます。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`title_vector` という名前のトップレベルベクトルフィールドと、`chunks` という名前の StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドは EmbeddingList 検索用にインデックスが作成されており、`chunks[emb]` は element レベル検索用にインデックスが作成されています。

## StructArray に対するハイブリッド検索の適用方法\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補のスコープ | 結果の挙動 | `element_scope` |
| --- | --- | --- | --- |
| コレクションレベルのベクトルフィールド + StructArray の EmbeddingList サブフィールド | Entity レベル | 最終候補は primary key をキーとします。 | 使用しないでください。 |
| コレクションレベルのベクトルフィールド + StructArray の element レベルサブフィールド | Entity レベル | Element レベルのヒットは、ハイブリッド再ランキングの前に entity レベルの候補へ collapse されます。 | StructArray の element レベル `AnnSearchRequest` で collapse 設定を任意に指定できます。 |
| 同じ StructArray フィールド配下の複数の element レベルサブフィールド | Element レベル | 最終候補は primary key と Struct element offset の組み合わせをキーとします。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の element レベルサブフィールド | Entity レベル | Element offset は同一性を共有しないため、各 StructArray element レベル `AnnSearchRequest` は再ランキングの前に collapse されます。 | 各 StructArray element レベル `AnnSearchRequest` で collapse 設定を任意に指定できます。 |

<Admonition type="warning" title="Warning">

`element_scope` は、同一 Struct ではない element レベルのハイブリッド検索において、StructArray の element レベル `AnnSearchRequest` オブジェクトの collapse を設定する場合にのみ使用してください。EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の element レベルハイブリッド検索には使用しないでください。

</Admonition>

## 始める前に\{#before-you-begin}

ハイブリッド検索を実行する前に、コレクション、データ、インデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | コレクションに `chunks` のような StructArray フィールドが含まれていること。 |
| ベクトルサブフィールド | EmbeddingList 検索用と element レベル検索用に別々のベクトルサブフィールドを使用すること。 |
| インデックス | `chunks[emb_list_vector]` は `MAX_SIM*` メトリックを使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常のベクトルメトリックを使用します。 |
| Reranker | `RRFRanker` など、アプリケーションでサポートされているハイブリッド reranker を選択すること。 |

インデックスの設定については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray のベクトルサブフィールドに対する EmbeddingList 検索は、ハイブリッド検索では entity レベルになります。entity レベルのベクトル検索リクエストと同じように動作し、一致した 1 つの Struct element offset は返しません。

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

この例では、両方の `AnnSearchRequest` オブジェクトが entity レベルの候補を生成します。最終結果は親 entity の primary key をキーとします。EmbeddingList リクエストに `element_scope` を追加しないでください。

## 同一 StructArray の element レベルハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の element レベルベクトルサブフィールドを対象とする場合、ハイブリッド検索は再ランキングを通じて element レベルの候補を維持できます。最終結果が element レベルのままとなる唯一の StructArray ハイブリッドモードです。

次の例では、`chunks` StructArray フィールドに element レベルベクトルサブフィールド `chunks[emb]` と `chunks[code_emb]` の 2 つがあり、どちらも通常のベクトルメトリックを使用することを前提としています。

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

両方の `AnnSearchRequest` オブジェクトは `chunks` 配下のベクトルサブフィールドを検索します。同じ 0 始まりの offset は同じ Struct element を指すため、ハイブリッド reranker は element の候補を直接ランキングできます。このモードでは entity レベルの collapse が行われないため、`element_scope` を設定しないでください。

## Entity レベルのハイブリッド検索のために element レベルのヒットを collapse する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索で StructArray の element レベル `AnnSearchRequest` を、コレクションレベルのベクトルリクエスト、EmbeddingList リクエスト、または異なる StructArray フィールド配下の element レベルリクエストと組み合わせる場合、最終候補のスコープは entity レベルになります。この場合、各 StructArray element レベル `AnnSearchRequest` は、ハイブリッド再ランキングの前に entity レベルの候補へ collapse されます。

同じ entity から一致した複数の element をどのように collapse するかを制御する必要がある場合は、StructArray element レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用します。

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

この例では、`title_req` は entity レベルであるため、最終的なハイブリッド結果も entity レベルになります。`chunk_req` リクエストは、まず `chunks[emb]` から element のヒットを返し、その後、同じ entity から返された element を、上位 3 つの element スコアを合計して collapse します。Entity レベルの collapse が必要なときに `element_scope` を省略した場合、collapse 戦略はデフォルトで `max` になります。

## Collapse 戦略を選択する\{#choose-a-collapse-strategy}

| 戦略 | 挙動 | `topk` | メトリックの要件 |
| --- | --- | --- | --- |
| `max` | entity について返された最良の element スコアを保持します。 | 指定できません。 | サポートされている任意の通常のベクトルメトリック。 |
| `sum` | entity について返されたすべての element スコアを合計します。 | 指定できません。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `avg` | entity について返されたすべての element スコアを平均します。 | 指定できません。 | サポートされている任意の通常のベクトルメトリック。 |
| `topk_sum` | entity について返された上位 `K` 個の element スコアを合計します。 | 必須であり、正の値でなければなりません。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `topk_avg` | entity について返された上位 `K` 個の element スコアを平均します。 | 必須であり、正の値でなければなりません。 | サポートされている任意の通常のベクトルメトリック。 |

Collapse は、その StructArray element レベル `AnnSearchRequest` が返した element ヒットのみを使用します。ANN 検索後に entity 内のすべての Struct element を走査するわけではありません。collapse に利用したい element が得られるように、リクエストの `limit` を十分に大きく設定してください。

## フィルター、範囲検索、grouping を追加する\{#add-filters-range-search-and-grouping}

ベクトル検索に参加する同じ Struct element にスカラー条件を適用する場合は、StructArray element レベル `AnnSearchRequest` に `element_filter` を付加できます。親 entity の条件には、`hybrid_search()` のトップレベル `filter` も使用できます。

StructArray の element レベルベクトルフィールドは、ハイブリッド検索で範囲検索をサポートしています。element レベル `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加します。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしていません。

Element レベルのハイブリッド grouping は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の element レベルベクトルフィールドを対象とする場合にのみサポートされ、`group_by_field` は primary key でなければなりません。リクエストがコレクションレベルのベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる場合、ハイブリッド grouping はサポートされません。範囲検索と grouping を組み合わせないでください。

## ハイブリッド検索結果を解釈する\{#interpret-hybrid-results}

| 最終候補のスコープ | 結果キー | Offset の挙動 | 発生する条件 |
| --- | --- | --- | --- |
| Entity レベル | Primary key。 | 最終結果に element offset は含まれません。 | ハイブリッドリクエストにコレクションレベルのベクトルフィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の element レベルリクエストが含まれる場合。 |
| Element レベル | Primary key + 親 StructArray フィールド + element offset。 | API または SDK によって公開されている場合、選択された element offset が返されることがあります。 | すべての `AnnSearchRequest` オブジェクトが element レベルで、かつ同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索で entity レベルの候補へ collapse する必要がある StructArray element レベル `AnnSearchRequest` オブジェクトにのみ使用してください。

- `element_scope` を EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の element レベルハイブリッド検索に使用しないでください。

- `sum` および `topk_sum` の collapse 戦略には、`IP` や `COSINE` などの正の相関を持つメトリックが必要です。これらを `L2` で使用しないでください。

- `topk_sum` および `topk_avg` には正の `topk` 値が必要です。その他の collapse 戦略に `topk` を含めてはいけません。

- EmbeddingList レベルの StructArray リクエストは、範囲検索または group-by をサポートしていません。

- ハイブリッド group-by は、同一 StructArray の element レベルハイブリッド検索で primary key に対してのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- 同一 StructArray の element レベルハイブリッドリクエストに `element_scope` を追加すること。このリクエストは element レベルのままであり、entity レベルの collapse は行われません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでに entity レベルです。

- 2 つの StructArray フィールドが element offset を共有すると仮定すること。`chunks` の offset `3` と別の StructArray フィールドの offset `3` は異なる element であるため、ハイブリッドリクエストは entity レベルになります。

- `L2` で `topk_sum` を使用すること。負の distance メトリックには `max`、`avg`、または `topk_avg` を使用してください。

- collapse 後の entity レベルのハイブリッド結果に、選択された Struct element offset が含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray の 2 つの基本的なベクトル検索モードについては、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索にスカラーフィルターを追加するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは distance の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. Element レベルのハイブリッド結果を親 entity ごとにグループ化するには、[StructArray を使用したグループ化検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

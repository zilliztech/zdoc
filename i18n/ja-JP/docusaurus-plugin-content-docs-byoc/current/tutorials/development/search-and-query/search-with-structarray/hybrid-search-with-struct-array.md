---
title: "StructArray を使ったハイブリッド検索 | BYOC"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクトル検索を他のベクトル検索と組み合わせて、1 つのハイブリッド検索リクエストで実行する方法を説明します。StructArray のハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を生成できます。 | BYOC"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったハイブリッド検索

このページでは、StructArray ベクトル検索を他のベクトル検索と組み合わせて、1 つのハイブリッド検索リクエストで実行する方法を説明します。StructArray のハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を生成できます。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。この collection には、`title_vector` という名前のトップレベル vector フィールドと、`chunks` という StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドには EmbeddingList 検索用の index が作成されており、`chunks[emb]` には要素レベル検索用の index が作成されています。

## StructArray に対するハイブリッド検索の適用方法\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補のスコープ | 結果の挙動 | `element_scope` |
| --- | --- | --- | --- |
| collection レベル vector フィールド + StructArray EmbeddingList サブフィールド | エンティティレベル | 最終候補は主キーで識別されます。 | 使用しないでください。 |
| collection レベル vector フィールド + StructArray 要素レベル サブフィールド | エンティティレベル | 要素レベルのヒットは、ハイブリッド再ランキングの前にエンティティレベル候補へ集約されます。 | StructArray 要素レベル `AnnSearchRequest` に対する任意の集約設定。 |
| 同じ StructArray フィールド配下の複数の要素レベル サブフィールド | 要素レベル | 最終候補は主キーに Struct 要素オフセットを加えた形で識別されます。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の要素レベル サブフィールド | エンティティレベル | 要素オフセットは同一性を共有しないため、各 StructArray 要素レベル `AnnSearchRequest` は再ランキング前に集約されます。 | 各 StructArray 要素レベル `AnnSearchRequest` に対する任意の集約設定。 |

<Admonition type="warning" icon="🚧" title="警告">

`element_scope` は、同一 Struct ではない要素レベルのハイブリッド検索において、StructArray 要素レベル `AnnSearchRequest` オブジェクトの集約を設定する場合にのみ使用してください。EmbeddingList リクエスト、collection レベル vector リクエスト、または同一 StructArray の要素レベル ハイブリッド検索には使用しないでください。

</Admonition>

## 開始前に\{#before-you-begin}

ハイブリッド検索を実行する前に、collection、データ、および index を準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection に `chunks` のような StructArray フィールドが含まれていること。 |
| vector サブフィールド | EmbeddingList 検索用と要素レベル検索用に別々の vector サブフィールドを使用すること。 |
| index | `chunks[emb_list_vector]` は `MAX_SIM*` metric を使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metric を使用します。 |
| 再ランキング器 | `RRFRanker` またはアプリケーションでサポートされている別の再ランキング器など、ハイブリッド再ランキング器を選択すること。 |

index の設定については、[StructArray フィールドに index を作成する](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray vector サブフィールドに対する EmbeddingList 検索は、ハイブリッド検索ではエンティティレベルです。これはエンティティレベル vector 検索リクエストのように動作し、一致した Struct 要素オフセットを 1 つ返すことはありません。

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

この例では、両方の `AnnSearchRequest` オブジェクトがエンティティレベルの候補を生成します。最終結果は親エンティティの主キーで識別されます。EmbeddingList リクエストに `element_scope` を追加しないでください。

## 同一 StructArray の要素レベル ハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の要素レベル vector サブフィールドを対象としている場合、ハイブリッド検索は再ランキングの間も要素レベル候補を維持できます。これは、最終結果が要素レベルのままになる唯一の StructArray ハイブリッドモードです。

次の例では、`chunks` StructArray フィールドに 2 つの要素レベル vector サブフィールド `chunks[emb]` と `chunks[code_emb]` があり、どちらも通常の vector metric を使用していると仮定しています。

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

両方の `AnnSearchRequest` オブジェクトは `chunks` 配下の vector サブフィールドを検索します。同じ 0 始まりのオフセットは同じ Struct 要素を指すため、ハイブリッド再ランキング器は要素候補を直接ランク付けできます。このモードではエンティティレベルの集約は行われないため、`element_scope` を設定しないでください。

## エンティティレベルのハイブリッド検索のために要素レベルのヒットを集約する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索が StructArray 要素レベル `AnnSearchRequest` と collection レベル vector リクエスト、EmbeddingList リクエスト、または別の StructArray フィールド配下の要素レベル リクエストを混在させる場合、最終候補のスコープはエンティティレベルになります。この場合、各 StructArray 要素レベル `AnnSearchRequest` は、ハイブリッド再ランキングの前にエンティティレベル候補へ集約されます。

同じエンティティ内で複数の一致要素をどのように集約するかを制御したい場合は、StructArray 要素レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用します。

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

この例では、`title_req` はエンティティレベルであるため、最終的なハイブリッド結果もエンティティレベルになります。`chunk_req` リクエストはまず `chunks[emb]` から要素ヒットを返し、その後、同じエンティティから返された要素を、最も良い 3 つの要素スコアの合計によって集約します。エンティティレベルの集約が必要な場合に `element_scope` を省略すると、集約戦略のデフォルトは `max` になります。

## 集約戦略を選ぶ\{#choose-a-collapse-strategy}

| 戦略 | 挙動 | `topk` | metric 要件 |
| --- | --- | --- | --- |
| `max` | エンティティについて最も良い返却要素スコアを保持します。 | 使用できません。 | サポートされる任意の通常の vector metric。 |
| `sum` | エンティティについて返却されたすべての要素スコアを合計します。 | 使用できません。 | `IP` や `COSINE` など、正の相関を持つ metric のみ。 |
| `avg` | エンティティについて返却されたすべての要素スコアを平均します。 | 使用できません。 | サポートされる任意の通常の vector metric。 |
| `topk_sum` | エンティティについて最も良い `K` 個の返却要素スコアを合計します。 | 必須であり、正の値でなければなりません。 | `IP` や `COSINE` など、正の相関を持つ metric のみ。 |
| `topk_avg` | エンティティについて最も良い `K` 個の返却要素スコアを平均します。 | 必須であり、正の値でなければなりません。 | サポートされる任意の通常の vector metric。 |

集約で使用されるのは、その StructArray 要素レベル `AnnSearchRequest` によって返された要素ヒットだけです。ANN 検索後にエンティティ内のすべての Struct 要素を走査することはありません。集約で使用したい要素が返されるように、リクエストの `limit` を十分高く設定してください。

## フィルター、範囲検索、グループ化を追加する\{#add-filters-range-search-and-grouping}

スカラー条件を vector 検索に参加する同じ Struct 要素に適用したい場合、StructArray 要素レベル `AnnSearchRequest` に `element_filter` を付加できます。親エンティティ条件には、`hybrid_search()` に対するトップレベルの `filter` も使用できます。

StructArray 要素レベル vector フィールドは、ハイブリッド検索で範囲検索をサポートします。要素レベル `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加してください。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしません。

要素レベルのハイブリッド グループ化は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされ、`group_by_field` は主キーでなければなりません。リクエストが collection レベル vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる場合、ハイブリッド グループ化はサポートされません。範囲検索とグループ化を組み合わせないでください。

## ハイブリッド結果を解釈する\{#interpret-hybrid-results}

| 最終候補のスコープ | 結果キー | オフセットの挙動 | 発生する条件 |
| --- | --- | --- | --- |
| エンティティレベル | 主キー。 | 最終結果に要素オフセットは含まれません。 | ハイブリッド リクエストに、collection レベル vector フィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の要素レベル リクエストが含まれる場合。 |
| 要素レベル | 主キー + 親 StructArray フィールド + 要素オフセット。 | API または SDK が公開している場合、選択された要素オフセットが返されることがあります。 | すべての `AnnSearchRequest` オブジェクトが要素レベルであり、同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索でエンティティレベル候補へ集約する必要がある StructArray 要素レベル `AnnSearchRequest` オブジェクトに対してのみ使用してください。

- `element_scope` を EmbeddingList リクエスト、collection レベル vector リクエスト、または同一 StructArray の要素レベル ハイブリッド検索に使用しないでください。

- `sum` および `topk_sum` の集約戦略には、`IP` や `COSINE` などの正の相関を持つ metric が必要です。`L2` には使用しないでください。

- `topk_sum` および `topk_avg` には正の `topk` 値が必要です。その他の集約戦略には `topk` を含めてはいけません。

- EmbeddingList レベルの StructArray リクエストは、範囲検索または group-by をサポートしません。

- ハイブリッド group-by は、同一 StructArray の要素レベル ハイブリッド検索でのみ、かつ主キーに対してのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- `element_scope` を同一 StructArray の要素レベル ハイブリッド リクエストに追加すること。そのリクエストは要素レベルのままであり、エンティティレベルの集約は行いません。

- `element_scope` を `chunks[emb_list_vector]` に追加すること。EmbeddingList 検索はすでにエンティティレベルです。

- 2 つの StructArray フィールドが要素オフセットを共有していると考えること。`chunks` のオフセット `3` と別の StructArray フィールドのオフセット `3` は異なる要素であるため、ハイブリッド リクエストはエンティティレベルになります。

- `topk_sum` を `L2` で使用すること。負の距離 metric には `max`、`avg`、または `topk_avg` を使用してください。

- 集約後のエンティティレベル ハイブリッド結果に、選択された Struct 要素オフセットが含まれると期待すること。

## 次のステップ\{#next-steps}

1. 2 つの基本的な StructArray vector 検索モードを学ぶには、[StructArray を使った基本ベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索にスカラー フィルターを追加するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは距離の境界を使用するには、[StructArray を使った範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 要素レベルのハイブリッド結果を親エンティティごとにグループ化するには、[StructArray を使ったグループ化検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


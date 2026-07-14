---
title: "StructArray を使った Hybrid Search | BYOC"
slug: /hybrid-search-with-struct-array
sidebar_label: "Hybrid Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクトル検索を他のベクトル検索と組み合わせて、1 つの hybrid search リクエストで実行する方法を説明します。StructArray hybrid search は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果を生成できます。 | BYOC"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った Hybrid Search

このページでは、StructArray ベクトル検索を他のベクトル検索と組み合わせて、1 つの hybrid search リクエストで実行する方法を説明します。StructArray hybrid search は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果を生成できます。

このページでは、[Create a StructArray Field](./create-struct-array) の `tech_articles` collection を使用します。この collection には、`title_vector` という名前のトップレベル vector field と、`chunks` という StructArray field があります。`chunks[emb_list_vector]` subfield には EmbeddingList 検索用の index が作成され、`chunks[emb]` には element レベル検索用の index が作成されています。

## StructArray に hybrid search がどのように適用されるか\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補スコープ | 結果の動作 | `element_scope` |
| --- | --- | --- | --- |
| collection レベル vector field + StructArray EmbeddingList subfield | entity レベル | 最終候補は primary key によって識別されます。 | 使用しないでください。 |
| collection レベル vector field + StructArray element レベル subfield | entity レベル | element レベルのヒットは、hybrid reranking の前に entity レベル候補へと collapse されます。 | StructArray element レベル `AnnSearchRequest` での任意の collapse 設定。 |
| 同じ StructArray field 配下の複数の element レベル subfield | element レベル | 最終候補は primary key と Struct element offset の組み合わせによって識別されます。 | 使用しないでください。 |
| 異なる StructArray field 配下の element レベル subfield | entity レベル | element offset は同一性を共有しないため、それぞれの StructArray element レベル `AnnSearchRequest` は reranking の前に collapse されます。 | 各 StructArray element レベル `AnnSearchRequest` での任意の collapse 設定。 |

<Admonition type="warning" icon="🚧" title="警告">

`element_scope` は、same-struct ではない element レベル hybrid search において、StructArray element レベル `AnnSearchRequest` オブジェクトの collapse を設定する場合にのみ使用してください。EmbeddingList リクエスト、collection レベル vector リクエスト、または same-StructArray element レベル hybrid search では使用しないでください。

</Admonition>

## 始める前に\{#before-you-begin}

hybrid search を実行する前に、collection、データ、index を準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray field | collection に `chunks` のような StructArray field が含まれていること。 |
| vector subfield | EmbeddingList 検索用と element レベル検索用に、別々の vector subfield を使用すること。 |
| index | `chunks[emb_list_vector]` は `MAX_SIM*` metric を使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常の vector metric を使用します。 |
| reranker | `RRFRanker` や、アプリケーションでサポートされる他の reranker などの hybrid reranker を選択してください。 |

index の設定については、[Index StructArray Fields](./index-struct-array) を参照してください。

## EmbeddingList リクエストで hybrid search を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray vector subfield に対する EmbeddingList 検索は、hybrid search では entity レベルです。これは entity レベル vector search リクエストのように動作し、一致した Struct element offset を 1 つ返すことはありません。

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

この例では、両方の `AnnSearchRequest` オブジェクトが entity レベル候補を生成します。最終結果は親 entity の primary key によって識別されます。EmbeddingList リクエストに `element_scope` を追加しないでください。

## same-StructArray element レベル hybrid search を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが同じ StructArray field 配下の element レベル vector subfield を対象とする場合、hybrid search は reranking を通して element レベル候補を保持できます。これは、最終結果が element レベルのまま維持される唯一の StructArray hybrid モードです。

次の例では、`chunks` StructArray field に 2 つの element レベル vector subfield、`chunks[emb]` と `chunks[code_emb]` があり、どちらも通常の vector metric を使用していることを前提としています。

```plaintext
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

どちらの `AnnSearchRequest` オブジェクトも、`chunks` 配下の vector subfield を検索します。同じ 0 ベースの offset は同じ Struct element を指すため、hybrid reranker は element 候補を直接ランク付けできます。entity レベルの collapse は実行されないため、このモードでは `element_scope` を設定しないでください。

## entity レベル hybrid search のために element レベルヒットを collapse する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

hybrid search が StructArray element レベル `AnnSearchRequest` を、collection レベル vector リクエスト、EmbeddingList リクエスト、または別の StructArray field 配下の element レベルリクエストと混在させる場合、最終候補スコープは entity レベルになります。この場合、各 StructArray element レベル `AnnSearchRequest` は、hybrid reranking の前に entity レベル候補へ collapse されます。

同じ entity 内の複数の一致 element をどのように collapse するかを制御したい場合は、StructArray element レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用してください。

```plaintext
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

この例では、`title_req` は entity レベルであるため、最終的な hybrid 結果も entity レベルです。`chunk_req` リクエストはまず `chunks[emb]` から element ヒットを返し、その後、同じ entity に属する返却済み element を、最良の 3 つの element スコアを合計することで collapse します。entity レベルの collapse が必要な場合に `element_scope` を省略すると、collapse strategy のデフォルトは `max` になります。

## collapse strategy を選択する\{#choose-a-collapse-strategy}

| Strategy | 動作 | `topk` | metric 要件 |
| --- | --- | --- | --- |
| `max` | entity に対して返された最良の element スコアを保持します。 | 使用できません。 | サポートされている任意の通常の vector metric。 |
| `sum` | entity に対して返されたすべての element スコアを合計します。 | 使用できません。 | `IP` や `COSINE` など、正の相関を持つ metrics のみ。 |
| `avg` | entity に対して返されたすべての element スコアの平均を取ります。 | 使用できません。 | サポートされている任意の通常の vector metric。 |
| `topk_sum` | entity に対して返された最良の `K` 個の element スコアを合計します。 | 必須であり、正の値である必要があります。 | `IP` や `COSINE` など、正の相関を持つ metrics のみ。 |
| `topk_avg` | entity に対して返された最良の `K` 個の element スコアの平均を取ります。 | 必須であり、正の値である必要があります。 | サポートされている任意の通常の vector metric。 |

collapse では、その StructArray element レベル `AnnSearchRequest` によって返された element ヒットのみを使用します。ANN search の後に entity 内のすべての Struct element を走査することはありません。collapse に利用したい element を十分に確保できるよう、リクエストの `limit` を十分高く設定してください。

## フィルター、range search、grouping を追加する\{#add-filters-range-search-and-grouping}

vector search に参加する同じ Struct element に scalar 条件を適用したい場合は、StructArray element レベル `AnnSearchRequest` に `element_filter` を追加できます。親 entity の条件には、`hybrid_search()` にトップレベルの `filter` を使用することもできます。

StructArray element レベル vector fields は、hybrid search における range search をサポートします。element レベル `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加してください。EmbeddingList レベル StructArray リクエストは range search をサポートしません。

element レベル hybrid grouping は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray field 配下の element レベル vector fields を対象としている場合にのみサポートされ、`group_by_field` は primary key でなければなりません。collection レベル vector fields、異なる StructArray fields、または EmbeddingList レベルリクエストが混在する場合、hybrid grouping はサポートされません。range search と grouping を組み合わせないでください。

## hybrid 結果を解釈する\{#interpret-hybrid-results}

| 最終候補スコープ | 結果キー | offset の動作 | 発生するタイミング |
| --- | --- | --- | --- |
| Entity レベル | Primary key。 | 最終結果に element offset は含まれません。 | hybrid リクエストに、collection レベル vector field、EmbeddingList リクエスト、または異なる StructArray field 配下の element レベルリクエストが含まれる場合。 |
| Element レベル | Primary key に加え、親 StructArray field と element offset。 | API または SDK が公開している場合、選択された element offset が返されることがあります。 | すべての `AnnSearchRequest` オブジェクトが element レベルであり、かつ同じ StructArray field 配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、hybrid search において entity レベル候補へ collapse する必要がある StructArray element レベル `AnnSearchRequest` オブジェクトに対してのみ使用してください。

- EmbeddingList リクエスト、collection レベル vector リクエスト、または same-StructArray element レベル hybrid search では `element_scope` を使用しないでください。

- `sum` および `topk_sum` collapse strategy には、`IP` や `COSINE` などの正の相関を持つ metrics が必要です。`L2` では使用しないでください。

- `topk_sum` と `topk_avg` には正の `topk` 値が必要です。その他の collapse strategy には `topk` を含めてはいけません。

- EmbeddingList レベル StructArray リクエストは range search や group-by をサポートしません。

- Hybrid group-by は same-StructArray element レベル hybrid search に対してのみ、かつ primary key のみでサポートされます。

- range search と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- same-StructArray element レベル hybrid リクエストに `element_scope` を追加すること。そのリクエストは element レベルのままであり、entity レベルの collapse は実行しません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでに entity レベルです。

- 2 つの StructArray fields が element offset を共有していると想定すること。`chunks` の offset `3` と別の StructArray field の offset `3` は異なる element であるため、hybrid リクエストは entity レベルになります。

- `L2` で `topk_sum` を使用すること。負の distance metric には `max`、`avg`、または `topk_avg` を使用してください。

- collapse 後の entity レベル hybrid 結果に、選択された Struct element offset が含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray vector search の 2 つの基本モードについて学ぶには、[Basic Vector Search with StructArray](./search-with-struct-array) を参照してください。

1. hybrid search に scalar filter を追加するには、[Filtered Search with StructArray](./filtered-search-with-struct-arrays) を参照してください。

1. hybrid search で score または distance の境界を使用するには、[Range Search with StructArray](./range-search-with-struct-arrays) を参照してください。

1. 親 entity ごとに element レベル hybrid 結果をグループ化するには、[Grouping Search with StructArray](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。


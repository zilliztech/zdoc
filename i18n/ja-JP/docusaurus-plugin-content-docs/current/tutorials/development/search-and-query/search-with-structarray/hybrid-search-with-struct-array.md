---
title: "StructArray を使ったハイブリッド検索 | Cloud"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray ベクトル検索を他のベクトル検索と組み合わせて、1 つのハイブリッド検索リクエストで実行する方法を説明します。StructArray ハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を返すことができます。 | Cloud"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったハイブリッド検索

このページでは、StructArray ベクトル検索を他のベクトル検索と組み合わせて、1 つのハイブリッド検索リクエストで実行する方法を説明します。StructArray ハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を返すことができます。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には、`title_vector` という名前のトップレベルのベクトルフィールドと、`chunks` という StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドは EmbeddingList 検索用にインデックス化されており、`chunks[emb]` は要素レベル検索用にインデックス化されています。

## StructArray にハイブリッド検索がどのように適用されるか\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補スコープ | 結果の挙動 | `element_scope` |
| --- | --- | --- | --- |
| collection レベルのベクトルフィールド + StructArray EmbeddingList サブフィールド | エンティティレベル | 最終候補は主キーで識別されます。 | 使用しないでください。 |
| collection レベルのベクトルフィールド + StructArray 要素レベルサブフィールド | エンティティレベル | 要素レベルのヒットは、ハイブリッド再ランキングの前にエンティティレベル候補へ集約されます。 | StructArray 要素レベル `AnnSearchRequest` でのオプションの collapse 設定。 |
| 同じ StructArray フィールド配下の複数の要素レベルサブフィールド | 要素レベル | 最終候補は主キーと Struct 要素オフセットの組み合わせで識別されます。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の要素レベルサブフィールド | エンティティレベル | 要素オフセットは同一性を共有しないため、各 StructArray 要素レベル `AnnSearchRequest` は再ランキング前に集約されます。 | 各 StructArray 要素レベル `AnnSearchRequest` でのオプションの collapse 設定。 |

<Admonition type="warning" icon="🚧" title="警告">

`element_scope` は、同一 Struct ではない要素レベルのハイブリッド検索において、StructArray 要素レベル `AnnSearchRequest` オブジェクトの collapse を設定する場合にのみ使用してください。EmbeddingList リクエスト、collection レベルのベクトルリクエスト、または同じ StructArray の要素レベルハイブリッド検索では使用しないでください。

</Admonition>

## 始める前に\{#before-you-begin}

ハイブリッド検索を実行する前に、collection、データ、インデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | collection に `chunks` のような StructArray フィールドが含まれていること。 |
| ベクトルサブフィールド | EmbeddingList 検索用と要素レベル検索用で別々のベクトルサブフィールドを使用すること。 |
| インデックス | `chunks[emb_list_vector]` は `MAX_SIM*` メトリックを使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常のベクトルメトリックを使用します。 |
| Reranker | `RRFRanker` またはアプリケーションでサポートされる別の reranker など、ハイブリッド reranker を選択してください。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray ベクトルサブフィールドに対する EmbeddingList 検索は、ハイブリッド検索ではエンティティレベルです。これはエンティティレベルのベクトル検索リクエストのように動作し、1 つの一致した Struct 要素オフセットは返しません。

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

この例では、両方の `AnnSearchRequest` オブジェクトがエンティティレベル候補を生成します。最終結果は親エンティティの主キーで識別されます。EmbeddingList リクエストに `element_scope` を追加しないでください。

## 同じ StructArray の要素レベルハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の要素レベルベクトルサブフィールドを対象としている場合、ハイブリッド検索は再ランキング中も要素レベル候補を維持できます。これは、最終結果が要素レベルのままとなる唯一の StructArray ハイブリッドモードです。

次の例では、`chunks` StructArray フィールドに 2 つの要素レベルベクトルサブフィールド `chunks[emb]` と `chunks[code_emb]` があり、両方とも通常のベクトルメトリックを使用していることを前提としています。

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

両方の `AnnSearchRequest` オブジェクトは、`chunks` 配下のベクトルサブフィールドを検索します。同じ 0 ベースのオフセットは同じ Struct 要素を指すため、ハイブリッド reranker は要素候補を直接ランキングできます。このモードではエンティティレベルの collapse は実行されないため、`element_scope` を設定しないでください。

## エンティティレベルのハイブリッド検索のために要素レベルのヒットを集約する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索で、StructArray 要素レベル `AnnSearchRequest` を collection レベルのベクトルリクエスト、EmbeddingList リクエスト、または別の StructArray フィールド配下の要素レベルリクエストと組み合わせる場合、最終候補スコープはエンティティレベルになります。この場合、各 StructArray 要素レベル `AnnSearchRequest` は、ハイブリッド再ランキングの前にエンティティレベル候補へ集約されます。

同じエンティティから複数の一致要素をどのように集約するかを制御する必要がある場合は、StructArray 要素レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用してください。

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

この例では、`title_req` はエンティティレベルであるため、最終的なハイブリッド結果もエンティティレベルになります。`chunk_req` リクエストはまず `chunks[emb]` から要素ヒットを返し、その後、同じエンティティから返された要素を、最良の 3 つの要素スコアを合計することで集約します。エンティティレベルの collapse が必要なときに `element_scope` を省略すると、collapse 戦略のデフォルトは `max` になります。

## collapse 戦略を選択する\{#choose-a-collapse-strategy}

| 戦略 | 挙動 | `topk` | メトリック要件 |
| --- | --- | --- | --- |
| `max` | そのエンティティに対して返された最良の要素スコアを保持します。 | 使用できません。 | サポートされている任意の通常のベクトルメトリック。 |
| `sum` | そのエンティティに対して返されたすべての要素スコアを合計します。 | 使用できません。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `avg` | そのエンティティに対して返されたすべての要素スコアを平均します。 | 使用できません。 | サポートされている任意の通常のベクトルメトリック。 |
| `topk_sum` | そのエンティティに対して返された最良の `K` 個の要素スコアを合計します。 | 必須であり、正の値でなければなりません。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `topk_avg` | そのエンティティに対して返された最良の `K` 個の要素スコアを平均します。 | 必須であり、正の値でなければなりません。 | サポートされている任意の通常のベクトルメトリック。 |

collapse は、その StructArray 要素レベル `AnnSearchRequest` によって返された要素ヒットのみを使用します。ANN 検索後にエンティティ内のすべての Struct 要素を走査するわけではありません。collapse に利用したい要素が確保されるよう、リクエストの `limit` を十分に高く設定してください。

## フィルター、範囲検索、グループ化を追加する\{#add-filters-range-search-and-grouping}

ベクトル検索に参加する同じ Struct 要素に scalar 条件を適用したい場合は、StructArray 要素レベル `AnnSearchRequest` に `element_filter` を追加できます。親エンティティ条件には、`hybrid_search()` にトップレベルの `filter` を使用することもできます。

StructArray 要素レベルベクトルフィールドは、ハイブリッド検索で範囲検索をサポートしています。要素レベル `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加してください。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしていません。

要素レベルのハイブリッド grouping は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象としている場合にのみサポートされ、`group_by_field` は主キーでなければなりません。collection レベルのベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを組み合わせる場合、ハイブリッド grouping はサポートされません。範囲検索と grouping を組み合わせないでください。

## ハイブリッド結果を解釈する\{#interpret-hybrid-results}

| 最終候補スコープ | 結果キー | オフセットの挙動 | 発生する条件 |
| --- | --- | --- | --- |
| エンティティレベル | 主キー。 | 最終結果には要素オフセットは含まれません。 | ハイブリッドリクエストに collection レベルのベクトルフィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の要素レベルリクエストが含まれる場合。 |
| 要素レベル | 主キー + 親 StructArray フィールド + 要素オフセット。 | API または SDK によって公開されている場合、選択された要素オフセットが返されることがあります。 | すべての `AnnSearchRequest` オブジェクトが要素レベルであり、同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索でエンティティレベル候補へ集約する必要がある StructArray 要素レベル `AnnSearchRequest` オブジェクトにのみ使用してください。

- `element_scope` を EmbeddingList リクエスト、collection レベルのベクトルリクエスト、または同じ StructArray の要素レベルハイブリッド検索に使用しないでください。

- `sum` および `topk_sum` の collapse 戦略は、`IP` や `COSINE` などの正の相関を持つメトリックを必要とします。`L2` では使用しないでください。

- `topk_sum` と `topk_avg` には正の `topk` 値が必要です。その他の collapse 戦略には `topk` を含めてはいけません。

- EmbeddingList レベルの StructArray リクエストは、範囲検索や group-by をサポートしていません。

- ハイブリッド group-by は、同じ StructArray の要素レベルハイブリッド検索でのみ、かつ主キーに対してのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- 同じ StructArray の要素レベルハイブリッドリクエストに `element_scope` を追加すること。そのリクエストは要素レベルのままであり、エンティティレベルの collapse は実行しません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでにエンティティレベルです。

- 2 つの StructArray フィールドが要素オフセットを共有していると想定すること。`chunks` のオフセット `3` と別の StructArray フィールドのオフセット `3` は異なる要素なので、ハイブリッドリクエストはエンティティレベルになります。

- `L2` で `topk_sum` を使用すること。負の距離メトリックには `max`、`avg`、または `topk_avg` を使用してください。

- collapse 後のエンティティレベルのハイブリッド結果に、選択された Struct 要素オフセットが含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray ベクトル検索の 2 つの基本モードについて学ぶには、[StructArray を使った基本ベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索に scalar フィルターを追加するには、[StructArray を使ったフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは距離の境界を使用するには、[StructArray を使った範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 親エンティティごとに要素レベルのハイブリッド結果をグループ化するには、[StructArray を使ったグループ検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


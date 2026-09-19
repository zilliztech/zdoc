---
title: "StructArray を使用したハイブリッド検索 | BYOC"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray のベクトル検索と他のベクトル検索を 1つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray のハイブリッド検索では、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を生成できます。 | BYOC"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用したハイブリッド検索

このページでは、StructArray のベクトル検索と他のベクトル検索を 1つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray のハイブリッド検索では、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を生成できます。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`title_vector` という名前のトップレベルベクトルフィールドと、`chunks` という名前の StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドは EmbeddingList 検索用にインデックス化されており、`chunks[emb]` は要素レベル検索用にインデックス化されています。

## ハイブリッド検索が StructArray にどのように適用されるか\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補のスコープ | 結果の動作 | `element_scope` |
| --- | --- | --- | --- |
| コレクションレベルのベクトルフィールド + StructArray の EmbeddingList サブフィールド | エンティティレベル | 最終候補は主キーで識別されます。 | 使用しないでください。 |
| コレクションレベルのベクトルフィールド + StructArray の要素レベルサブフィールド | エンティティレベル | 要素レベルのヒットは、ハイブリッド reranking の前にエンティティレベルの候補へ集約されます。 | StructArray の要素レベル `AnnSearchRequest` で任意に collapse を設定できます。 |
| 同じ StructArray フィールド配下の複数の要素レベルサブフィールド | 要素レベル | 最終候補は主キーと Struct 要素のオフセットで識別されます。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の要素レベルサブフィールド | エンティティレベル | 要素オフセットは同一性を共有しないため、各 StructArray の要素レベル `AnnSearchRequest` は reranking の前に集約されます。 | 各 StructArray の要素レベル `AnnSearchRequest` で任意に collapse を設定できます。 |

<Admonition type="warning" title="Warning">

`element_scope` は、同一 Struct ではない要素レベルのハイブリッド検索において、StructArray の要素レベル `AnnSearchRequest` オブジェクトの collapse を構成する場合にのみ使用してください。EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の要素レベルハイブリッド検索には使用しないでください。

</Admonition>

## 事前準備\{#before-you-begin}

ハイブリッド検索を実行する前に、コレクション、データ、およびインデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | コレクションに `chunks` のような StructArray フィールドが含まれていること。 |
| ベクトルサブフィールド | EmbeddingList 検索と要素レベル検索には、それぞれ別のベクトルサブフィールドを使用します。 |
| インデックス | `chunks[emb_list_vector]` は `MAX_SIM*` メトリクスを使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスを使用します。 |
| Reranker | `RRFRanker` またはアプリケーションでサポートされている別の reranker など、ハイブリッド reranker を選択します。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray のベクトルサブフィールドに対する EmbeddingList 検索は、ハイブリッド検索ではエンティティレベルです。これはエンティティレベルのベクトル検索リクエストと同様に動作し、一致した Struct 要素のオフセットを 1つ返すことはありません。

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

この例では、両方の `AnnSearchRequest` オブジェクトがエンティティレベルの候補を生成します。最終結果は親エンティティの主キーで識別されます。EmbeddingList リクエストには `element_scope` を追加しないでください。

## 同一 StructArray の要素レベルハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の要素レベルベクトルサブフィールドを対象とする場合、ハイブリッド検索は reranking を通じて要素レベルの候補を維持できます。最終結果が要素レベルのまま維持される StructArray ハイブリッドモードはこれだけです。

次の例では、`chunks` StructArray フィールドに `chunks[emb]` と `chunks[code_emb]` という 2つの要素レベルベクトルサブフィールドがあり、どちらも通常のベクトルメトリクスを使用していることを前提としています。

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

両方の `AnnSearchRequest` オブジェクトは `chunks` 配下のベクトルサブフィールドを検索します。同じ 0 ベースのオフセットは同じ Struct 要素を指すため、ハイブリッド reranker は要素レベルの候補を直接ランク付けできます。このモードではエンティティレベルの collapse が実行されないため、`element_scope` を設定しないでください。

## エンティティレベルのハイブリッド検索のために要素レベルのヒットを集約する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索で StructArray の要素レベル `AnnSearchRequest` を、コレクションレベルのベクトルリクエスト、EmbeddingList リクエスト、または別の StructArray フィールド配下の要素レベルリクエストと混在させる場合、最終候補のスコープはエンティティレベルになります。この場合、各 StructArray の要素レベル `AnnSearchRequest` は、ハイブリッド reranking の前にエンティティレベルの候補へ集約されます。

同じエンティティから一致した複数の要素がどのように集約されるかを制御する必要がある場合は、StructArray の要素レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用します。

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

この例では、`title_req` はエンティティレベルであるため、最終的なハイブリッド結果もエンティティレベルになります。`chunk_req` リクエストはまず `chunks[emb]` から要素レベルのヒットを返し、その後、同じエンティティから返された要素を最良の 3つの要素スコアの合計によって集約します。エンティティレベルの collapse が必要な場面で `element_scope` を省略した場合、collapse 戦略のデフォルトは `max` です。

## collapse 戦略を選択する\{#choose-a-collapse-strategy}

| 戦略 | 動作 | `topk` | メトリクスの要件 |
| --- | --- | --- | --- |
| `max` | エンティティに対して返された最良の要素スコアを保持します。 | 指定できません。 | サポートされている通常のベクトルメトリクス。 |
| `sum` | エンティティに対して返されたすべての要素スコアを合計します。 | 指定できません。 | `IP` や `COSINE` などの正の相関を持つメトリクスに限られます。 |
| `avg` | エンティティに対して返されたすべての要素スコアを平均します。 | 指定できません。 | サポートされている通常のベクトルメトリクス。 |
| `topk_sum` | エンティティに対して返された最良の `K` 個の要素スコアを合計します。 | 必須であり、正の値である必要があります。 | `IP` や `COSINE` などの正の相関を持つメトリクスに限られます。 |
| `topk_avg` | エンティティに対して返された最良の `K` 個の要素スコアを平均します。 | 必須であり、正の値である必要があります。 | サポートされている通常のベクトルメトリクス。 |

collapse は、その StructArray の要素レベル `AnnSearchRequest` が返した要素レベルのヒットのみを使用します。ANN 検索後にエンティティ内のすべての Struct 要素を走査することはありません。collapse に使用できるようにしたい要素が十分に得られるよう、リクエストの `limit` を十分に大きく設定してください。

## フィルター、範囲検索、グルーピングを追加する\{#add-filters-range-search-and-grouping}

スカラー条件を、ベクトル検索に参加する同じ Struct 要素に適用する必要がある場合は、StructArray の要素レベル `AnnSearchRequest` に `element_filter` を付加できます。親エンティティの条件には、`hybrid_search()` のトップレベル `filter` を使用することもできます。

StructArray の要素レベルベクトルフィールドは、ハイブリッド検索で範囲検索をサポートしています。要素レベルの `AnnSearchRequest` に `radius` を追加し、必要に応じて `range_filter` も追加します。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしていません。

要素レベルのハイブリッドグルーピングは、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされ、`group_by_field` には主キーを指定する必要があります。コレクションレベルのベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストが混在する場合、ハイブリッドグルーピングはサポートされません。範囲検索とグルーピングを組み合わせないでください。

## ハイブリッド結果を解釈する\{#interpret-hybrid-results}

| 最終候補のスコープ | 結果のキー | オフセットの動作 | 発生する条件 |
| --- | --- | --- | --- |
| エンティティレベル | 主キー。 | 最終結果に要素オフセットは含まれません。 | ハイブリッドリクエストに、コレクションレベルのベクトルフィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の要素レベルリクエストが含まれる場合。 |
| 要素レベル | 主キー + 親 StructArray フィールド + 要素オフセット。 | 選択された要素オフセットは、API または SDK で公開されている場合に返すことができます。 | すべての `AnnSearchRequest` オブジェクトが要素レベルであり、同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索でエンティティレベルの候補へ集約する必要がある StructArray の要素レベル `AnnSearchRequest` オブジェクトにのみ使用してください。

- EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の要素レベルハイブリッド検索には、`element_scope` を使用しないでください。

- `sum` および `topk_sum` の collapse 戦略には、`IP` や `COSINE` などの正の相関を持つメトリクスが必要です。`L2` と組み合わせて使用しないでください。

- `topk_sum` と `topk_avg` には正の `topk` 値が必要です。その他の collapse 戦略に `topk` を含めないでください。

- EmbeddingList レベルの StructArray リクエストは、範囲検索および group-by をサポートしていません。

- ハイブリッド group-by は、同一 StructArray の要素レベルハイブリッド検索で、かつ主キーによる場合にのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- 同一 StructArray の要素レベルハイブリッドリクエストに `element_scope` を追加すること。そのリクエストは要素レベルのままであり、エンティティレベルの collapse は実行されません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでにエンティティレベルです。

- 2つの StructArray フィールドが要素オフセットを共有すると想定すること。`chunks` のオフセット `3` と別の StructArray フィールドのオフセット `3` は異なる要素であるため、ハイブリッドリクエストはエンティティレベルになります。

- `L2` で `topk_sum` を使用すること。負の距離メトリクスには `max`、`avg`、または `topk_avg` を使用してください。

- 集約後のエンティティレベルハイブリッド結果に、選択された Struct 要素のオフセットが含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray の 2つの基本的なベクトル検索モードを学ぶには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索にスカラーフィルターを追加するには、[StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは距離の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 要素レベルのハイブリッド結果を親エンティティごとにグループ化するには、[StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


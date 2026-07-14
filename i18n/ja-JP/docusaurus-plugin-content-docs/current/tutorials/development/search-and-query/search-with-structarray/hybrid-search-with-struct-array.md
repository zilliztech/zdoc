---
title: "StructArray を使用したハイブリッド検索 | Cloud"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、1 つのハイブリッド検索リクエスト内で StructArray ベクトル検索を他のベクトル検索と組み合わせる方法を説明します。StructArray のハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を返すことができます。 | Cloud"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用したハイブリッド検索

このページでは、1 つのハイブリッド検索リクエスト内で StructArray ベクトル検索を他のベクトル検索と組み合わせる方法を説明します。StructArray のハイブリッド検索は、組み合わせる `AnnSearchRequest` オブジェクトに応じて、エンティティレベルの結果または要素レベルの結果を返すことができます。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`title_vector` という名前のトップレベルベクトルフィールドと、`chunks` という StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドには EmbeddingList 検索用のインデックスが作成されており、`chunks[emb]` サブフィールドには要素レベル検索用のインデックスが作成されています。

## StructArray にハイブリッド検索がどのように適用されるか\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補のスコープ | 結果の挙動 | `element_scope` |
| --- | --- | --- | --- |
| コレクションレベルのベクトルフィールド + StructArray EmbeddingList サブフィールド | エンティティレベル | 最終候補は主キーによって識別されます。 | 使用しないでください。 |
| コレクションレベルのベクトルフィールド + StructArray 要素レベルサブフィールド | エンティティレベル | 要素レベルのヒットは、ハイブリッド再ランキングの前にエンティティレベル候補へと折りたたまれます。 | StructArray 要素レベル `AnnSearchRequest` に対する任意の折りたたみ設定。 |
| 同じ StructArray フィールド配下の複数の要素レベルサブフィールド | 要素レベル | 最終候補は主キーと Struct 要素オフセットの組み合わせで識別されます。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の要素レベルサブフィールド | エンティティレベル | 要素オフセットは同じ ID を共有しないため、各 StructArray 要素レベル `AnnSearchRequest` は再ランキング前に折りたたまれます。 | 各 StructArray 要素レベル `AnnSearchRequest` に対する任意の折りたたみ設定。 |

<Admonition type="warning" icon="🚧" title="警告">

`element_scope` は、同一 Struct ではない要素レベルのハイブリッド検索において、StructArray 要素レベル `AnnSearchRequest` オブジェクトの折りたたみを設定する場合にのみ使用してください。EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の要素レベルハイブリッド検索では使用しないでください。

</Admonition>

## 始める前に\{#before-you-begin}

ハイブリッド検索を実行する前に、コレクション、データ、インデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | コレクションに `chunks` などの StructArray フィールドが含まれていること。 |
| ベクトルサブフィールド | EmbeddingList 検索と要素レベル検索には別々のベクトルサブフィールドを使用します。 |
| インデックス | `chunks[emb_list_vector]` では `MAX_SIM*` メトリックを使用します。`chunks[emb]` では `COSINE`、`IP`、`L2` などの通常のベクトルメトリックを使用します。 |
| 再ランカー | `RRFRanker` またはアプリケーションでサポートされている別の再ランカーなど、ハイブリッド再ランカーを選択します。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray ベクトルサブフィールドに対する EmbeddingList 検索は、ハイブリッド検索ではエンティティレベルです。これはエンティティレベルのベクトル検索リクエストのように動作し、一致した 1 つの Struct 要素オフセットは返しません。

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

この例では、両方の `AnnSearchRequest` オブジェクトがエンティティレベルの候補を生成します。最終結果は親エンティティの主キーによって識別されます。EmbeddingList リクエストに `element_scope` を追加しないでください。

## 同一 StructArray の要素レベルハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが、同じ StructArray フィールド配下の要素レベルベクトルサブフィールドを対象としている場合、ハイブリッド検索は再ランキング全体を通して要素レベル候補を維持できます。これは、最終結果が要素レベルのままになる唯一の StructArray ハイブリッドモードです。

次の例では、`chunks` StructArray フィールドに 2 つの要素レベルベクトルサブフィールド `chunks[emb]` と `chunks[code_emb]` があり、両方とも通常のベクトルメトリックを使用していることを前提としています。

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

両方の `AnnSearchRequest` オブジェクトは、`chunks` 配下のベクトルサブフィールドを検索します。同じ 0 始まりのオフセットは同じ Struct 要素を参照するため、ハイブリッド再ランカーは要素候補を直接ランク付けできます。このモードではエンティティレベルの折りたたみは実行されないため、`element_scope` を設定しないでください。

## エンティティレベルのハイブリッド検索のために要素レベルのヒットを折りたたむ\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索で、StructArray 要素レベル `AnnSearchRequest` をコレクションレベルのベクトルリクエスト、EmbeddingList リクエスト、または別の StructArray フィールド配下の要素レベルリクエストと組み合わせる場合、最終候補のスコープはエンティティレベルになります。この場合、各 StructArray 要素レベル `AnnSearchRequest` は、ハイブリッド再ランキングの前にエンティティレベル候補へと折りたたまれます。

同じエンティティ内で複数一致した要素をどのように折りたたむかを制御する必要がある場合は、StructArray 要素レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用してください。

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

この例では、`title_req` がエンティティレベルであるため、最終的なハイブリッド結果もエンティティレベルです。`chunk_req` リクエストはまず `chunks[emb]` から要素ヒットを返し、その後、同じエンティティから返された要素を、最良の 3 つの要素スコアの合計によって折りたたみます。エンティティレベルの折りたたみが必要な場合に `element_scope` を省略すると、折りたたみ戦略はデフォルトで `max` になります。

## 折りたたみ戦略を選ぶ\{#choose-a-collapse-strategy}

| 戦略 | 挙動 | `topk` | メトリック要件 |
| --- | --- | --- | --- |
| `max` | エンティティに対して返された最良の要素スコアを保持します。 | 使用不可。 | サポートされている任意の通常のベクトルメトリック。 |
| `sum` | エンティティに対して返されたすべての要素スコアを合計します。 | 使用不可。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `avg` | エンティティに対して返されたすべての要素スコアを平均します。 | 使用不可。 | サポートされている任意の通常のベクトルメトリック。 |
| `topk_sum` | エンティティに対して返された最良の `K` 個の要素スコアを合計します。 | 必須であり、正の値でなければなりません。 | `IP` や `COSINE` など、正の相関を持つメトリックのみ。 |
| `topk_avg` | エンティティに対して返された最良の `K` 個の要素スコアを平均します。 | 必須であり、正の値でなければなりません。 | サポートされている任意の通常のベクトルメトリック。 |

折りたたみは、その StructArray 要素レベル `AnnSearchRequest` によって返された要素ヒットのみを使用します。ANN 検索後にエンティティ内のすべての Struct 要素を走査するわけではありません。折りたたみに利用したい要素が十分に返されるよう、リクエストの `limit` を十分大きく設定してください。

## フィルター、範囲検索、グループ化を追加する\{#add-filters-range-search-and-grouping}

スカラー条件をベクトル検索に参加する同じ Struct 要素に適用したい場合は、StructArray 要素レベル `AnnSearchRequest` に `element_filter` を付加できます。親エンティティの条件には、`hybrid_search()` にトップレベルの `filter` を使用することもできます。

StructArray の要素レベルベクトルフィールドは、ハイブリッド検索で範囲検索をサポートします。要素レベル `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加してください。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしません。

要素レベルのハイブリッドグループ化は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされ、`group_by_field` は主キーでなければなりません。コレクションレベルのベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルリクエストが混在する場合、ハイブリッドグループ化はサポートされません。範囲検索とグループ化を組み合わせないでください。

## ハイブリッド結果を解釈する\{#interpret-hybrid-results}

| 最終候補のスコープ | 結果キー | オフセットの挙動 | 発生する場合 |
| --- | --- | --- | --- |
| エンティティレベル | 主キー。 | 最終結果に要素オフセットは含まれません。 | ハイブリッドリクエストにコレクションレベルのベクトルフィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の要素レベルリクエストが含まれる場合。 |
| 要素レベル | 主キー + 親 StructArray フィールド + 要素オフセット。 | API または SDK によって公開されている場合、選択された要素オフセットを返せます。 | すべての `AnnSearchRequest` オブジェクトが要素レベルであり、かつ同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索でエンティティレベル候補へ折りたたむ必要がある StructArray 要素レベル `AnnSearchRequest` オブジェクトに対してのみ使用してください。

- `element_scope` を EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の要素レベルハイブリッド検索に使用しないでください。

- `sum` および `topk_sum` の折りたたみ戦略には、`IP` や `COSINE` など、正の相関を持つメトリックが必要です。`L2` では使用しないでください。

- `topk_sum` および `topk_avg` には正の `topk` 値が必要です。その他の折りたたみ戦略には `topk` を含めてはいけません。

- EmbeddingList レベルの StructArray リクエストは、範囲検索または group-by をサポートしません。

- ハイブリッド group-by は、同一 StructArray の要素レベルハイブリッド検索に対してのみ、かつ主キーでのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- 同一 StructArray の要素レベルハイブリッドリクエストに `element_scope` を追加すること。このリクエストは要素レベルのままであり、エンティティレベルの折りたたみは実行しません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでにエンティティレベルです。

- 2 つの StructArray フィールドが要素オフセットを共有していると想定すること。`chunks` のオフセット `3` と別の StructArray フィールドのオフセット `3` は異なる要素であるため、ハイブリッドリクエストはエンティティレベルになります。

- `L2` とともに `topk_sum` を使用すること。`L2` のように距離が小さいほど類似度が高いメトリックでは、`max`、`avg`、または `topk_avg` を使用してください。

- 折りたたみ後のエンティティレベルハイブリッド結果に、選択された Struct 要素オフセットが含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray ベクトル検索の 2 つの基本モードについて学ぶには、[StructArray を使用した基本ベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索にスカラーフィルターを追加するには、[StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは距離の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 親エンティティごとに要素レベルのハイブリッド結果をグループ化するには、[StructArray を使用したグループ検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


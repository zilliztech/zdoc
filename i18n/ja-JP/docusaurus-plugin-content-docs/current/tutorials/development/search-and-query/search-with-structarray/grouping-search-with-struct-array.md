---
title: "StructArray を使用したグルーピング検索 | Cloud"
slug: /grouping-search-with-struct-array
sidebar_label: "グルーピング検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致した場合、同じエンティティから複数のヒットが返されることがあります。グルーピングにより、これらの要素ヒットをまとめ、各親エンティティが最大 1 回だけ表示されるようにします。 | Cloud"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用したグルーピング検索

このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致した場合、同じエンティティから複数のヒットが返されることがあります。グルーピングにより、これらの要素ヒットをまとめ、各親エンティティが最大 1 回だけ表示されるようにします。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` vector サブフィールドは、通常の vector metric を使用した要素レベル検索用にインデックス化されています。

## StructArray へのグルーピングの適用方法\{#how-grouping-applies-to-structarray}

| 検索モード | グルーピングの動作 | 結果の動作 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当しません。 |
| 要素レベル検索 | 主キーでのグルーピングによりサポートされます。 | 親エンティティごとに最大 1 件の結果を返します。要素レベルのメタデータは保持されるため、API または SDK が公開している場合は、選択された要素のインデックスまたはオフセットを返すことができます。 |
| ハイブリッド検索 | すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。 | 最終的な結果処理の前に、要素レベルのサブ検索が主キーでグループ化されます。 |

<Admonition type="info" icon="📘" title="Notes">

グループ化されていない要素レベル検索で重複する親エンティティが多すぎる場合は、グルーピングを使用してください。一致したすべての Struct 要素を個別のヒットとして扱いたい場合は、`group_by_field` を使わずに [StructArray を使用した基本ベクトル検索](./search-with-struct-array) を使用してください。

</Admonition>

## 始める前に\{#before-you-begin}

グルーピング検索を実行する前に、collection、データ、インデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| 要素レベル vector サブフィールド | `chunks[emb]` のような StructArray の vector サブフィールドを使用し、通常の vector metric でインデックス化します。 |
| 通常の vector クエリ | `EmbeddingList` ではなく、通常のクエリ vector を使用します。 |
| 主キーによるグルーピング | `doc_id` など、collection の主キーを `group_by_field` として使用します。 |
| 範囲パラメータなし | `radius` や `range_filter` などの範囲検索パラメータとグルーピング検索を組み合わせないでください。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## グループ化された要素レベル検索を実行する\{#run-grouped-element-level-search}

次の例では、まず個々の chunks を検索し、その後、要素ヒットを親エンティティの主キーでグループ化します。

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
    limit=5,
    group_by_field="doc_id",
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

グルーピングを行わない場合、複数の chunk がクエリに一致すると、同じ `doc_id` が複数回表示されることがあります。`group_by_field="doc_id"` を使用すると、各親エンティティは最大 1 回だけ表示されます。グルーピングでは要素レベルのメタデータが保持されるため、API または SDK が公開している場合、グループ化された結果には選択された Struct 要素のインデックスまたはオフセットを引き続き含めることができます。

## scalar フィルターを追加する\{#add-scalar-filters}

グルーピング検索は StructArray の scalar フィルタリングと組み合わせることができます。scalar 条件によって、要素レベル vector 検索に参加する Struct 要素を制限したい場合は、`element_filter` を使用します。

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
    filter=filter_expr,
    limit=5,
    group_by_field="doc_id",
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

最上位の述語は候補エンティティを選択します。`element_filter` の述語は、要素レベル vector 検索を一致する Struct 要素のみに制限します。その後、グルーピングによって一致した要素ヒットが主キーごとにまとめられます。

## ハイブリッド検索でグルーピングを使用する\{#use-grouping-in-hybrid-search}

StructArray におけるハイブリッドグルーピングは要素レベル機能です。すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象としている場合にのみサポートされます。グループ化された StructArray ハイブリッド検索では、EmbeddingList レベルのリクエストを使用しないでください。

次の例では、`chunks` StructArray フィールドに 2 つの要素レベル vector サブフィールド `chunks[emb]` と `chunks[code_emb]` があり、両方とも通常の vector metric でインデックス化されていることを前提としています。

```python
from pymilvus import AnnSearchRequest, RRFRanker

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
    group_by_field="doc_id",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
    ],
)
```

この例では、両方のサブリクエストが同じ StructArray フィールド `chunks` 配下の要素レベル vector フィールドを対象としています。通常の vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストが混在している場合、ハイブリッド検索では要素レベルの group-by はサポートされません。

## グループ化された結果を解釈する\{#interpret-grouped-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | グループ化された親エンティティの主キー。 |
| `distance` または score | その親エンティティに対して選択された Struct 要素の score または distance。 |
| `offset` | 返された場合の、選択された Struct 要素の 0 始まりの位置。 |
| 重複した主キー | 主キーでグループ化している場合は想定されません。 |
| `limit` | グループ化された親エンティティ結果に適用されます。 |

## 制限事項\{#limitations}

- グルーピング検索は、要素レベルの StructArray vector 検索にのみ適用されます。EmbeddingList 検索および EmbeddingList レベルのハイブリッド検索では group-by はサポートされません。

- `group_by_field` には主キーを使用してください。StructArray の要素レベルグルーピングは、任意の scalar フィールドに対する汎用的な group-by ではありません。

- グルーピング検索を範囲検索と組み合わせないでください。

- グルーピング検索では、`EmbeddingList` クエリや `MAX_SIM*` metric を使用しないでください。

- ハイブリッドグルーピングは、すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。

- 通常の vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストがハイブリッド検索に混在している場合、ハイブリッドグルーピングはサポートされません。

## よくある間違い\{#common-mistakes}

- EmbeddingList 検索用の `chunks[emb_list_vector]` でグルーピングを使用すること。

- 主キーではない scalar フィールドでグルーピングすること。

- 複数フィールドでグルーピングすること。要素レベルの StructArray グルーピングでは、主キーによるグルーピングのみがサポートされています。

- グループ化された結果が一致したすべての Struct 要素を表すと期待すること。グルーピングでは、親エンティティごとに最大 1 件の結果のみが返されます。

- グループ化された要素レベル検索が EmbeddingList 形式の `MAX_SIM*` score を再計算すると想定すること。グルーピングは要素レベルのヒットをまとめるだけであり、スコアリングモデルは変更しません。

- `group_by_field` を `radius` または `range_filter` と組み合わせること。

## 次のステップ\{#next-steps}

1. まずグループ化されていない要素レベル検索について学ぶには、[StructArray を使用した基本ベクトル検索](./search-with-struct-array) を参照してください。

1. グループ化された検索に scalar フィルターを追加するには、[StructArray を使用したフィルタリング検索](./filtered-search-with-struct-arrays) を参照してください。

1. グルーピングの代わりに score または distance の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


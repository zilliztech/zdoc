---
title: "StructArray を使用したグループ化検索 | Cloud"
slug: /grouping-search-with-struct-array
sidebar_label: "グループ化検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致すると、同じエンティティから複数のヒットが返ることがあります。グループ化により、これらの要素ヒットをまとめて、各親エンティティが最大 1 回だけ表示されるようにします。 | Cloud"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用したグループ化検索

このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致すると、同じエンティティから複数のヒットが返ることがあります。グループ化により、これらの要素ヒットをまとめて、各親エンティティが最大 1 回だけ表示されるようにします。

このページでは、[Create a StructArray Field](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` vector サブフィールドは、通常の vector metric を使用した要素レベル検索向けにインデックス化されています。

## StructArray へのグループ化の適用方法\{#how-grouping-applies-to-structarray}

| 検索モード | グループ化の動作 | 結果の動作 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当なし。 |
| 要素レベル検索 | プライマリキーでのグループ化によりサポートされます。 | 親エンティティごとに最大 1 件の結果を返します。要素レベルのメタデータは保持されるため、API または SDK で公開されている場合は、選択された要素のインデックスまたはオフセットを返すことができます。 |
| ハイブリッド検索 | すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。 | 最終的な結果処理の前に、要素レベルのサブ検索はプライマリキーごとにグループ化されます。 |

<Admonition type="info" icon="📘" title="メモ">

グループ化されていない要素レベル検索で、重複する親エンティティが多すぎる場合はグループ化を使用してください。一致した各 Struct 要素を個別のヒットとして取得したい場合は、`group_by_field` を使用せずに [Basic Vector Search with StructArray](./search-with-struct-array) を使用してください。

</Admonition>

## 始める前に\{#before-you-begin}

グループ化検索を実行する前に、collection、データ、およびインデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| 要素レベル vector サブフィールド | `chunks[emb]` のような StructArray vector サブフィールドを使用し、通常の vector metric でインデックス化してください。 |
| 通常の vector クエリ | `EmbeddingList` ではなく、通常のクエリ vector を使用してください。 |
| プライマリキーのグループ化 | `doc_id` など、collection のプライマリキーを `group_by_field` として使用してください。 |
| 範囲パラメータなし | `radius` や `range_filter` などの範囲検索パラメータとグループ化検索を組み合わせないでください。 |

インデックスの設定については、[Index StructArray Fields](./index-struct-array) を参照してください。

## グループ化された要素レベル検索を実行する\{#run-grouped-element-level-search}

次の例では、まず個々の chunk を検索し、その後、要素ヒットを親エンティティのプライマリキーでグループ化します。

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

グループ化を行わない場合、複数の chunk がクエリに一致すると、同じ `doc_id` が複数回表示されることがあります。`group_by_field="doc_id"` を使用すると、各親エンティティは最大 1 回だけ表示されます。グループ化では要素レベルのメタデータが保持されるため、API または SDK が公開している場合、グループ化された結果には選択された Struct 要素のインデックスまたはオフセットを引き続き含めることができます。

## scalar フィルタを追加する\{#add-scalar-filters}

StructArray の scalar フィルタリングとグループ化検索を組み合わせることができます。scalar 条件で、要素レベル vector 検索に参加する Struct 要素を制約する必要がある場合は、`element_filter` を使用してください。

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

トップレベルの述語は候補エンティティを選択します。`element_filter` 述語は、要素レベル vector 検索を一致する Struct 要素に制限します。その後、グループ化によって一致した要素ヒットがプライマリキーごとにまとめられます。

## ハイブリッド検索でグループ化を使用する\{#use-grouping-in-hybrid-search}

StructArray でのハイブリッドグループ化は要素レベルの機能です。これは、すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。グループ化された StructArray ハイブリッド検索では、EmbeddingList レベルのリクエストを使用しないでください。

次の例では、`chunks` StructArray フィールドに 2 つの要素レベル vector サブフィールド `chunks[emb]` と `chunks[code_emb]` があり、どちらも通常の vector metric でインデックス化されていることを前提としています。

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

この例では、両方のサブリクエストが同じ StructArray フィールド `chunks` 配下の要素レベル vector フィールドを対象としています。通常の vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストが混在する場合、ハイブリッド検索では要素レベルの group-by はサポートされません。

## グループ化された結果を解釈する\{#interpret-grouped-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | グループ化された親エンティティのプライマリキー。 |
| `distance` または score | その親エンティティに対して選択された Struct 要素の score または distance。 |
| `offset` | 返される場合、選択された Struct 要素の 0 ベースの位置。 |
| 繰り返されるプライマリキー | プライマリキーでグループ化している場合は想定されません。 |
| `limit` | グループ化された親エンティティ結果に適用されます。 |

## 制限事項\{#limitations}

- グループ化検索は、要素レベルの StructArray vector 検索にのみ適用されます。EmbeddingList 検索および EmbeddingList レベルのハイブリッド検索では group-by はサポートされません。

- `group_by_field` にはプライマリキーを使用してください。StructArray の要素レベルのグループ化は、任意の scalar フィールドに対する汎用的な group-by ではありません。

- グループ化検索を範囲検索と組み合わせないでください。

- グループ化検索では、`EmbeddingList` クエリまたは `MAX_SIM*` metric を使用しないでください。

- ハイブリッドグループ化は、すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。

- 通常の vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストがハイブリッド検索に混在する場合、ハイブリッドグループ化はサポートされません。

## よくある間違い\{#common-mistakes}

- EmbeddingList 検索向けの `chunks[emb_list_vector]` でグループ化を使用すること。

- プライマリキーではない scalar フィールドでグループ化すること。

- 複数のフィールドでグループ化すること。要素レベルの StructArray グループ化では、プライマリキーによるグループ化のみをサポートします。

- グループ化された結果が一致したすべての Struct 要素を表すと期待すること。グループ化では、親エンティティごとに最大 1 件の結果のみを返します。

- グループ化された要素レベル検索が EmbeddingList スタイルの `MAX_SIM*` score を再計算すると考えること。グループ化は要素レベルのヒットをまとめるだけで、スコアリングモデル自体は変更しません。

- `group_by_field` を `radius` または `range_filter` と組み合わせること。

## 次のステップ\{#next-steps}

1. まずグループ化されていない要素レベル検索について学ぶには、[Basic Vector Search with StructArray](./search-with-struct-array) をお読みください。

1. グループ化検索に scalar フィルタを追加するには、[Filtered Search with StructArray](./filtered-search-with-struct-arrays) をお読みください。

1. グループ化の代わりに score または distance の境界を使用するには、[Range Search with StructArray](./range-search-with-struct-arrays) をお読みください。

1. StructArray 検索の制限を確認するには、[StructArray Limits](./struct-array-limits) をお読みください。


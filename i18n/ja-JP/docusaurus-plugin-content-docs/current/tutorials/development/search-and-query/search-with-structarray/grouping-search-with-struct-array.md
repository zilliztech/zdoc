---
title: "StructArray を使ったグループ化検索 | Cloud"
slug: /grouping-search-with-struct-array
sidebar_label: "グループ化検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致すると、同じエンティティから複数のヒットが返されることがあります。グループ化では、それらの要素ヒットをまとめ、各親エンティティが最大 1 回だけ表示されるようにします。 | Cloud"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったグループ化検索

このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致すると、同じエンティティから複数のヒットが返されることがあります。グループ化では、それらの要素ヒットをまとめ、各親エンティティが最大 1 回だけ表示されるようにします。

このページでは、[Create a StructArray Field](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray field があります。`chunks[emb]` vector subfield には通常の vector metric で要素レベル検索を行うための index が作成されています。

## StructArray へのグループ化の適用方法\{#how-grouping-applies-to-structarray}

| Search mode | Grouping behavior | Result behavior |
| --- | --- | --- |
| EmbeddingList search | サポートされていません。 | 該当しません。 |
| Element-level search | 主キーでのグループ化としてサポートされています。 | 親エンティティごとに最大 1 件の結果を返します。要素レベルのメタデータは保持されるため、API または SDK で公開されている場合は、選択された要素 index または offset を返すことができます。 |
| Hybrid search | すべての sub-search が同じ StructArray field 配下の要素レベル vector field を対象としている場合にのみサポートされます。 | 最終的な結果処理の前に、要素レベルの sub-search が主キーごとにグループ化されます。 |

<Admonition type="info" icon="📘" title="注意">

グループ化されていない要素レベル検索で、重複する親エンティティが多く返されすぎる場合にグループ化を使用してください。一致するすべての Struct 要素を個別のヒットとして取得したい場合は、`group_by_field` を使用せずに [Basic Vector Search with StructArray](./search-with-struct-array) を使用してください。

</Admonition>

## 始める前に\{#before-you-begin}

グループ化検索を実行する前に、collection、データ、index を準備してください。

| Requirement | Details |
| --- | --- |
| Element-level vector subfield | `chunks[emb]` のような StructArray vector subfield を使用し、通常の vector metric で index を作成します。 |
| Regular vector query | `EmbeddingList` ではなく、通常の query vector を使用します。 |
| Primary key grouping | `doc_id` のように、collection の主キーを `group_by_field` として使用します。 |
| No range parameters | グループ化検索を `radius` や `range_filter` などの range-search パラメータと組み合わせないでください。 |

index の設定については、[Index StructArray Fields](./index-struct-array) を参照してください。

## グループ化された要素レベル検索を実行する\{#run-grouped-element-level-search}

次の例では、まず個々の chunk を検索し、その後、要素ヒットを親エンティティの主キーでグループ化します。

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

グループ化しない場合、複数の chunk がクエリに一致すると、同じ `doc_id` が複数回現れることがあります。`group_by_field="doc_id"` を使用すると、各親エンティティは最大 1 回だけ表示されます。グループ化では要素レベルのメタデータが保持されるため、API または SDK が公開している場合、グループ化された結果には選択された Struct 要素の index または offset を引き続き含めることができます。

## scalar フィルターを追加する\{#add-scalar-filters}

グループ化検索は、StructArray の scalar フィルタリングと組み合わせることができます。scalar 条件で要素レベル vector 検索に参加する Struct 要素を制限したい場合は、`element_filter` を使用してください。

```plaintext
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

トップレベルの述語は候補エンティティを選択します。`element_filter` の述語は、要素レベル vector 検索を一致する Struct 要素のみに制限します。その後、グループ化によって、一致した要素ヒットが主キーごとにまとめられます。

## hybrid search でグループ化を使用する\{#use-grouping-in-hybrid-search}

StructArray での hybrid grouping は要素レベルの機能です。これは、すべての sub-search が同じ StructArray field 配下の要素レベル vector field を対象としている場合にのみサポートされます。グループ化された StructArray hybrid search では、EmbeddingList レベルのリクエストを使用しないでください。

次の例では、`chunks` StructArray field が 2 つの要素レベル vector subfield、`chunks[emb]` と `chunks[code_emb]` を持ち、両方に通常の vector metric で index が作成されていることを前提としています。

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

この例では、両方の sub-request が同じ StructArray field `chunks` 配下の要素レベル vector field を対象としています。hybrid search は、通常の vector field、異なる StructArray field、または EmbeddingList レベルのリクエストを混在させる場合、要素レベルの group-by をサポートしません。

## グループ化された結果を解釈する\{#interpret-grouped-results}

| Result item | Meaning |
| --- | --- |
| `id` | グループ化された親エンティティの主キー。 |
| `distance` or score | その親エンティティに対して選択された Struct 要素の score または distance。 |
| `offset` | 返される場合、選択された Struct 要素の 0 ベースの位置。 |
| Repeated primary keys | 主キーでグループ化している場合は想定されません。 |
| `limit` | グループ化された親エンティティ結果に適用されます。 |

## 制限事項\{#limitations}

- グループ化検索は、要素レベルの StructArray vector 検索にのみ適用されます。EmbeddingList search および EmbeddingList レベルの hybrid search は group-by をサポートしません。

- `group_by_field` には主キーを使用してください。StructArray の要素レベルグループ化は、任意の scalar field に対する汎用的な group-by ではありません。

- グループ化検索を range search と組み合わせないでください。

- グループ化検索では、`EmbeddingList` query または `MAX_SIM*` metric を使用しないでください。

- hybrid grouping は、すべての sub-search が同じ StructArray field 配下の要素レベル vector field を対象としている場合にのみサポートされます。

- hybrid search が通常の vector field、異なる StructArray field、または EmbeddingList レベルのリクエストを混在させる場合、hybrid grouping はサポートされません。

## よくある間違い\{#common-mistakes}

- `chunks[emb_list_vector]` に対してグループ化を使用すること。これは EmbeddingList search 用です。

- 主キーではない scalar field でグループ化すること。

- 複数の field でグループ化すること。要素レベルの StructArray グループ化では、主キーによるグループ化のみサポートされます。

- グループ化された結果が一致したすべての Struct 要素を表すと期待すること。グループ化では、親エンティティごとに最大 1 件の結果のみ返されます。

- グループ化された要素レベル検索が EmbeddingList スタイルの `MAX_SIM*` score を再計算すると想定すること。グループ化は要素レベルのヒットをまとめるだけであり、スコアリングモデル自体は変更しません。

- `group_by_field` を `radius` や `range_filter` と組み合わせること。

## 次のステップ\{#next-steps}

1. まずグループ化されていない要素レベル検索を学ぶには、[Basic Vector Search with StructArray](./search-with-struct-array) を参照してください。

1. グループ化検索に scalar フィルターを追加するには、[Filtered Search with StructArray](./filtered-search-with-struct-arrays) を参照してください。

1. グループ化の代わりに score または distance の境界を使用するには、[Range Search with StructArray](./range-search-with-struct-arrays) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。


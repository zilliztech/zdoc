---
title: "StructArray を使ったグルーピング検索 | BYOC"
slug: /grouping-search-with-struct-array
sidebar_label: "グルーピング検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致すると、同じエンティティから複数のヒットが返る場合があります。グルーピングにより、これらの要素ヒットがまとめられ、各親エンティティは最大 1 回だけ表示されます。 | BYOC"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったグルーピング検索

このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致すると、同じエンティティから複数のヒットが返る場合があります。グルーピングにより、これらの要素ヒットがまとめられ、各親エンティティは最大 1 回だけ表示されます。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。この collection には、`chunks` という名前の StructArray フィールドがあります。`chunks[emb]` vector サブフィールドは、通常の vector metric を使用した要素レベル検索用に index 化されています。

## StructArray へのグルーピングの適用方法\{#how-grouping-applies-to-structarray}

| Search mode | Grouping behavior | Result behavior |
| --- | --- | --- |
| EmbeddingList search | サポートされていません。 | 該当なし。 |
| Element-level search | 主キーによるグルーピングでサポートされます。 | 親エンティティごとに最大 1 件の結果を返します。要素レベルのメタデータは保持されるため、API または SDK で公開されている場合は、選択された要素の index または offset を返せます。 |
| Hybrid search | すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。 | 最終的な結果処理の前に、要素レベルのサブ検索は主キーごとにグループ化されます。 |

<Admonition type="info" icon="📘" title="注意">

グループ化されていない要素レベル検索で、重複した親エンティティが多すぎる場合はグルーピングを使用してください。一致したすべての Struct 要素を個別のヒットとして取得したい場合は、`group_by_field` を使わずに [StructArray を使った基本 vector 検索](./search-with-struct-array) を使用してください。

</Admonition>

## 始める前に\{#before-you-begin}

グルーピング検索を実行する前に、collection、データ、および index を準備してください。

| Requirement | Details |
| --- | --- |
| Element-level vector subfield | `chunks[emb]` のような StructArray vector サブフィールドを使用し、通常の vector metric で index 化します。 |
| Regular vector query | `EmbeddingList` ではなく、通常のクエリ vector を使用します。 |
| Primary key grouping | `doc_id` のように、collection の主キーを `group_by_field` として使用します。 |
| No range parameters | グルーピング検索を、`radius` や `range_filter` などの範囲検索パラメータと組み合わせないでください。 |

index の設定については、[StructArray フィールドの index 化](./index-struct-array) を参照してください。

## グループ化された要素レベル検索を実行する\{#run-grouped-element-level-search}

次の例では、まず個々の chunk を検索し、その後、要素ヒットを親エンティティの主キーごとにグループ化します。

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

グルーピングを行わない場合、複数の chunk がクエリに一致すると、同じ `doc_id` が複数回表示されることがあります。`group_by_field="doc_id"` を指定すると、各親エンティティは最大 1 回だけ表示されます。グルーピングでは要素レベルのメタデータが保持されるため、API または SDK が公開している場合、グループ化された結果には選択された Struct 要素の index または offset も含められます。

## scalar フィルタを追加する\{#add-scalar-filters}

グルーピング検索は StructArray の scalar フィルタリングと組み合わせることができます。要素レベル vector 検索に参加する Struct 要素を scalar 条件で制限したい場合は、`element_filter` を使用します。

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

トップレベルの述語は候補エンティティを選択します。`element_filter` の述語は、要素レベル vector 検索を一致する Struct 要素のみに制限します。その後、グルーピングによって、一致した要素ヒットが主キーごとにまとめられます。

## hybrid search でグルーピングを使用する\{#use-grouping-in-hybrid-search}

StructArray での hybrid グルーピングは要素レベルの機能です。これは、すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。グループ化された StructArray hybrid search では、EmbeddingList レベルのリクエストを使用しないでください。

次の例では、`chunks` StructArray フィールドに 2 つの要素レベル vector サブフィールド `chunks[emb]` と `chunks[code_emb]` があり、両方とも通常の vector metric で index 化されていることを前提としています。

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

この例では、両方のサブリクエストが同じ StructArray フィールド `chunks` 配下の要素レベル vector フィールドを対象としています。通常の vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる hybrid search では、要素レベルの group-by はサポートされません。

## グループ化された結果を解釈する\{#interpret-grouped-results}

| Result item | Meaning |
| --- | --- |
| `id` | グループ化された親エンティティの主キー。 |
| `distance` or score | その親エンティティに対して選択された Struct 要素の score または distance。 |
| `offset` | 返された場合の、選択された Struct 要素の 0 ベースの位置。 |
| Repeated primary keys | 主キーでグルーピングする場合は想定されません。 |
| `limit` | グループ化された親エンティティ結果に適用されます。 |

## 制限事項\{#limitations}

- グルーピング検索は、要素レベルの StructArray vector 検索にのみ適用されます。EmbeddingList search および EmbeddingList レベルの hybrid search では group-by はサポートされません。

- `group_by_field` には主キーを使用してください。StructArray の要素レベルグルーピングは、任意の scalar フィールドに対する汎用的な group-by ではありません。

- グルーピング検索を range search と組み合わせないでください。

- グルーピング検索では、`EmbeddingList` クエリまたは `MAX_SIM*` metric を使用しないでください。

- hybrid グルーピングは、すべてのサブ検索が同じ StructArray フィールド配下の要素レベル vector フィールドを対象とする場合にのみサポートされます。

- 通常の vector フィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを hybrid search に混在させる場合、hybrid グルーピングはサポートされません。

## よくある間違い\{#common-mistakes}

- EmbeddingList search 用である `chunks[emb_list_vector]` に対してグルーピングを使用すること。

- 主キーではない scalar フィールドでグルーピングすること。

- 複数のフィールドでグルーピングすること。要素レベルの StructArray グルーピングでは、主キーによるグルーピングのみをサポートしています。

- グループ化された結果が、一致したすべての Struct 要素を表すと期待すること。グルーピングでは、親エンティティごとに最大 1 件の結果のみ返されます。

- グループ化された要素レベル検索が、EmbeddingList スタイルの `MAX_SIM*` score を再計算すると考えること。グルーピングは要素レベルのヒットをまとめるものであり、スコアリングモデルを変更するものではありません。

- `group_by_field` を `radius` または `range_filter` と組み合わせること。

## 次のステップ\{#next-steps}

1. まずグループ化されていない要素レベル検索を学ぶには、[StructArray を使った基本 vector 検索](./search-with-struct-array) を参照してください。

1. グループ化検索に scalar フィルタを追加するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. グルーピングの代わりに score または distance の境界を使用するには、[StructArray を使った範囲検索](./range-search-with-struct-arrays) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


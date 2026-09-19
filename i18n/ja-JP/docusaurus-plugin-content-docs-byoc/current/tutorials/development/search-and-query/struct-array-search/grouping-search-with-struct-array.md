---
title: "StructArray を使ったグルーピング検索 | BYOC"
slug: /grouping-search-with-struct-array
sidebar_label: "グルーピング検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致した場合に同じエンティティから複数のヒットが返されることがあります。グルーピングによりこれらの要素ヒットがまとめられるため、各親エンティティは最大 1 回だけ表示されます。 | BYOC"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使ったグルーピング検索

このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。要素レベル検索では、複数の Struct 要素がクエリに一致した場合に同じエンティティから複数のヒットが返されることがあります。グルーピングによりこれらの要素ヒットがまとめられるため、各親エンティティは最大 1 回だけ表示されます。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクトルサブフィールドは、通常のベクトルメトリクスを使用した要素レベル検索用にインデックス化されています。

## StructArray へのグルーピングの適用方法\{#how-grouping-applies-to-structarray}

| 検索モード | グルーピングの動作 | 結果の動作 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当しません。 |
| 要素レベル検索 | 主キーによるグルーピングでサポートされています。 | 親エンティティごとに最大 1 件の結果を返します。要素レベルのメタデータが保持されるため、API または SDK で公開されている場合には、選択された要素のインデックスまたはオフセットを返すことができます。 |
| ハイブリッド検索 | すべてのサブ検索が同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされています。 | 最終的な結果の処理の前に、要素レベルのサブ検索が主キーごとにグループ化されます。 |

<Admonition type="info" title="Notes">

グルーピングされていない要素レベル検索で重複する親エンティティが多すぎる場合は、グルーピングを使用してください。一致したすべての Struct 要素を個別のヒットとして取得する場合は、`group_by_field` を使用せずに [StructArray を使った基本的なベクトル検索](./search-with-struct-array) を使用してください。

</Admonition>

## 事前準備\{#before-you-begin}

グルーピング検索を実行する前に、コレクション、データ、およびインデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| 要素レベルベクトルサブフィールド | `chunks[emb]` などの StructArray ベクトルサブフィールドを使用し、通常のベクトルメトリクスでインデックス化します。 |
| 通常のベクトルクエリ | `EmbeddingList` ではなく、通常のクエリベクトルを使用します。 |
| 主キーによるグルーピング | `doc_id` など、コレクションの主キーを `group_by_field` として使用します。 |
| 範囲パラメータを使用しない | グルーピング検索を、`radius` や `range_filter` などの範囲検索パラメータと組み合わせないでください。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## グループ化された要素レベル検索を実行する\{#run-grouped-element-level-search}

次の例では、まず個々のチャンクを検索し、その後、要素ヒットを親エンティティの主キーごとにグループ化します。

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

グルーピングを行わない場合、複数のチャンクがクエリに一致すると、同じ `doc_id` が複数回出現することがあります。`group_by_field="doc_id"` を指定すると、各親エンティティは最大 1 回だけ出現します。グルーピングでは要素レベルのメタデータが保持されるため、API または SDK が公開している場合には、グループ化された結果に選択された Struct 要素のインデックスまたはオフセットを含めることもできます。

## スカラーフィルタを追加する\{#add-scalar-filters}

グルーピング検索は、StructArray のスカラーフィルタリングと組み合わせることができます。スカラー条件によって、要素レベルベクトル検索に参加する Struct 要素を制限する場合は、`element_filter` を使用します。

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

トップレベルの述語は候補エンティティを選択します。`element_filter` 述語は、要素レベルベクトル検索を一致する Struct 要素に制限します。その後、グルーピングによって、一致した要素ヒットが主キーごとにまとめられます。

## ハイブリッド検索でグルーピングを使用する\{#use-grouping-in-hybrid-search}

StructArray でのハイブリッドグルーピングは、要素レベルの機能です。すべてのサブ検索が同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされます。グループ化された StructArray ハイブリッド検索では、EmbeddingList レベルのリクエストを使用しないでください。

次の例では、`chunks` StructArray フィールドに `chunks[emb]` と `chunks[code_emb]` という 2 つの要素レベルベクトルサブフィールドがあり、どちらも通常のベクトルメトリクスでインデックス化されていることを前提としています。

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

この例では、両方のサブリクエストが同じ StructArray フィールド `chunks` 配下の要素レベルベクトルフィールドを対象としています。通常のベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストが混在するハイブリッド検索では、要素レベルの group-by はサポートされません。

## グループ化された結果を解釈する\{#interpret-grouped-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | グループ化された親エンティティの主キーです。 |
| `distance` またはスコア | その親エンティティに対して選択された Struct 要素のスコアまたは距離です。 |
| `offset` | 返される場合の、選択された Struct 要素の 0 から始まる位置です。 |
| 重複する主キー | 主キーでグルーピングする場合、想定されません。 |
| `limit` | グループ化された親エンティティの結果に適用されます。 |

## 制限事項\{#limitations}

- グルーピング検索は、要素レベルの StructArray ベクトル検索にのみ適用されます。EmbeddingList 検索および EmbeddingList レベルのハイブリッド検索は group-by をサポートしていません。

- `group_by_field` には主キーを使用してください。StructArray の要素レベルのグルーピングは、任意のスカラーフィールドに対する汎用的な group-by ではありません。

- グルーピング検索と範囲検索を組み合わせないでください。

- グルーピング検索では、`EmbeddingList` クエリまたは `MAX_SIM*` メトリクスを使用しないでください。

- ハイブリッドグルーピングは、すべてのサブ検索が同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされます。

- ハイブリッド検索で通常のベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストが混在する場合、ハイブリッドグルーピングはサポートされません。

## よくある間違い\{#common-mistakes}

- EmbeddingList 検索を目的とした `chunks[emb_list_vector]` でグルーピングを使用すること。

- 主キーではないスカラーフィールドでグルーピングすること。

- 複数のフィールドでグルーピングすること。StructArray の要素レベルのグルーピングでは、主キーによるグルーピングのみがサポートされています。

- グループ化された結果が、一致したすべての Struct 要素を表すと期待すること。グルーピングでは、親エンティティごとに最大 1 件の結果のみが返されます。

- グループ化された要素レベル検索が EmbeddingList 形式の `MAX_SIM*` スコアを再計算すると想定すること。グルーピングは要素レベルのヒットをまとめるものであり、スコアリングモデルは変更しません。

- `group_by_field` を `radius` または `range_filter` と組み合わせること。

## 次のステップ\{#next-steps}

1. まずグルーピングされていない要素レベル検索について学ぶには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. グループ化された検索にスカラーフィルタを追加するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. グルーピングの代わりにスコアまたは距離の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


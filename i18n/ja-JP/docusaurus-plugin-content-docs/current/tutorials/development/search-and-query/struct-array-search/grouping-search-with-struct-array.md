---
title: "StructArray を使用したグループ化検索 | Cloud"
slug: /grouping-search-with-struct-array
sidebar_label: "グループ化検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。複数の Struct 要素がクエリに一致すると、要素レベル検索では同じエンティティから複数のヒットが返される場合があります。グループ化により、それらの要素ヒットがまとめられ、各親エンティティは最大 1 回だけ表示されます。 | Cloud"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用したグループ化検索

このページでは、StructArray の要素レベル検索結果を親エンティティごとにグループ化する方法を説明します。複数の Struct 要素がクエリに一致すると、要素レベル検索では同じエンティティから複数のヒットが返される場合があります。グループ化により、それらの要素ヒットがまとめられ、各親エンティティは最大 1 回だけ表示されます。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクトルサブフィールドは、通常のベクトルメトリクスを使用した要素レベル検索向けにインデックス化されています。

## StructArray へのグループ化の適用方法\{#how-grouping-applies-to-structarray}

| 検索モード | グループ化の動作 | 結果の動作 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当しません。 |
| 要素レベル検索 | プライマリキーによるグループ化でサポートされます。 | 親エンティティごとに最大 1 件の結果を返します。要素レベルのメタデータは保持されるため、API または SDK で公開されている場合は、選択された要素のインデックスまたはオフセットを返すことができます。 |
| ハイブリッド検索 | すべてのサブ検索が同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされます。 | 最終的な結果処理の前に、要素レベルのサブ検索がプライマリキーごとにグループ化されます。 |

<Admonition type="info" title="Notes">

グループ化されていない要素レベル検索で重複する親エンティティが多すぎる場合は、グループ化を使用してください。一致するすべての Struct 要素を個別のヒットとして取得する場合は、`group_by_field` を使用せずに [StructArray を使った基本的なベクトル検索](./search-with-struct-array) を使用してください。

</Admonition>

## 始める前に\{#before-you-begin}

グループ化検索を実行する前に、コレクション、データ、およびインデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| 要素レベルのベクトルサブフィールド | `chunks[emb]` などの StructArray ベクトルサブフィールドを使用し、通常のベクトルメトリクスでインデックス化します。 |
| 通常のベクトルクエリ | `EmbeddingList` ではなく、通常のクエリベクトルを使用します。 |
| プライマリキーによるグループ化 | `doc_id` など、コレクションのプライマリキーを `group_by_field` として使用します。 |
| 範囲パラメータなし | `radius` や `range_filter` などの範囲検索パラメータとグループ化検索を組み合わせないでください。 |

インデックスの設定については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

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

グループ化しない場合、クエリに複数の chunk が一致すると、同じ `doc_id` が複数回表示されることがあります。`group_by_field="doc_id"` を指定すると、各親エンティティは最大 1 回だけ表示されます。グループ化は要素レベルのメタデータを保持するため、API または SDK で公開されている場合は、グループ化された結果に選択された Struct 要素のインデックスまたはオフセットを含めることができます。

## スカラーフィルタを追加する\{#add-scalar-filters}

グループ化検索は、StructArray のスカラーフィルタリングと組み合わせることができます。スカラー条件によって要素レベルのベクトル検索に参加する Struct 要素を制限する場合は、`element_filter` を使用します。

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

トップレベルの述語は候補エンティティを選択します。`element_filter` 述語は、要素レベルのベクトル検索を一致する Struct 要素に制限します。その後、グループ化によって一致する要素ヒットがプライマリキーごとにまとめられます。

## ハイブリッド検索でグループ化を使用する\{#use-grouping-in-hybrid-search}

StructArray でのハイブリッドグループ化は要素レベルの機能です。すべてのサブ検索が同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされます。グループ化された StructArray ハイブリッド検索では、EmbeddingList レベルのリクエストを使用しないでください。

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

この例では、両方のサブリクエストが同じ StructArray フィールド `chunks` 配下の要素レベルベクトルフィールドを対象としています。通常のベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる場合、ハイブリッド検索では要素レベルの group-by はサポートされません。

## グループ化された結果を解釈する\{#interpret-grouped-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | グループ化された親エンティティのプライマリキー。 |
| `distance` またはスコア | その親エンティティに対して選択された Struct 要素のスコアまたは距離。 |
| `offset` | 返される場合の、選択された Struct 要素の 0 ベースの位置。 |
| 繰り返されるプライマリキー | プライマリキーでグループ化する場合は想定されません。 |
| `limit` | グループ化された親エンティティの結果に適用されます。 |

## 制限事項\{#limitations}

- グループ化検索は、要素レベルの StructArray ベクトル検索にのみ適用されます。EmbeddingList 検索および EmbeddingList レベルのハイブリッド検索は group-by をサポートしていません。

- `group_by_field` にはプライマリキーを使用してください。StructArray の要素レベルグループ化は、任意のスカラーフィールドに対する汎用的な group-by ではありません。

- グループ化検索と範囲検索を組み合わせないでください。

- グループ化検索では、`EmbeddingList` クエリまたは `MAX_SIM*` メトリクスを使用しないでください。

- ハイブリッドグループ化は、すべてのサブ検索が同じ StructArray フィールド配下の要素レベルベクトルフィールドを対象とする場合にのみサポートされます。

- ハイブリッド検索で通常のベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる場合、ハイブリッドグループ化はサポートされません。

## よくある間違い\{#common-mistakes}

- EmbeddingList 検索向けの `chunks[emb_list_vector]` でグループ化を使用すること。

- プライマリキーではないスカラーフィールドでグループ化すること。

- 複数のフィールドでグループ化すること。StructArray の要素レベルグループ化でサポートされるのは、プライマリキーによるグループ化のみです。

- グループ化された結果が一致したすべての Struct 要素を表すと期待すること。グループ化では、親エンティティごとに最大 1 件の結果のみが返されます。

- グループ化された要素レベル検索が EmbeddingList スタイルの `MAX_SIM*` スコアを再計算すると考えること。グループ化は要素レベルのヒットをまとめるものであり、スコアリングモデルを変更するものではありません。

- `group_by_field` を `radius` または `range_filter` と組み合わせること。

## 次のステップ\{#next-steps}

1. まずグループ化されていない要素レベル検索について学ぶには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. グループ化検索にスカラーフィルタを追加するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. グループ化の代わりにスコアまたは距離の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

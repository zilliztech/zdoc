---
title: "StructArray を使った基本ベクトル検索 | Cloud"
slug: /search-with-struct-array
sidebar_label: "基本ベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。EmbeddingList search は各 entity に保存された embedding list をスコアリングし、element-level search は各 Struct 要素を個別に検索します。 | Cloud"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った基本ベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。EmbeddingList search は各 entity に保存された embedding list をスコアリングし、element-level search は各 Struct 要素を個別に検索します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。各 chunk にはテキスト、scalar メタデータ、EmbeddingList search 用のインデックスを持つ `emb_list_vector` という名前のベクトルサブフィールド、および element-level search 用のインデックスを持つ `emb` という名前のベクトルサブフィールドが含まれます。

## 始める前に\{#before-you-begin}

collection のスキーマ、データ、およびインデックスがすでに準備されていることを確認してください。

| 要件 | 準備場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成する。 | [StructArray フィールドを作成する](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含む entity を挿入する。 | [StructArray フィールドにデータを挿入する](./insert-struct-array) |
| EmbeddingList search 用に `chunks[emb_list_vector]` に `MAX_SIM*` インデックスを作成する。 | [StructArray フィールドにインデックスを作成する](./index-struct-array) |
| element-level search 用に `chunks[emb]` に通常のベクトルメトリックインデックスを作成する。 | [StructArray フィールドにインデックスを作成する](./index-struct-array) |

<Admonition type="warning" icon="🚧" title="警告">

ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスしか受け付けません。EmbeddingList search と element-level search の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList search 用にインデックスされ、`chunks[emb]` は element-level search 用にインデックスされています。

</Admonition>

## 検索モードを選ぶ\{#choose-a-search-mode}

| 観点 | EmbeddingList search | Element-level search |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上のベクトルを含む embedding list。 | 通常のベクトル。 |
| メトリックファミリー | `MAX_SIM_COSINE` などの `MAX_SIM*`。 | `COSINE`、`IP`、`L2` などの通常のベクトルメトリック。 |
| 1 件のヒットが表すもの | StructArray ベクトルサブフィールドがクエリ embedding list に類似している一致 entity。 | StructArray フィールド内の一致した Struct 要素。 |
| 結果の粒度 | entity レベル。 | Struct 要素レベル。 |
| Offset | 該当なし。 | 返されるときに一致した Struct 要素の 0 ベース位置を識別する。 |
| 典型的な用途 | ColBERT、ColPali、その他の late-interaction retrieval パターン。 | chunk レベル、passage レベル、clip レベル、patch レベル、fact レベルの retrieval。 |

## EmbeddingList search を実行する\{#run-embeddinglist-search}

クエリ自体が複数のベクトルを含み、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` メトリックでインデックスされている場合は、EmbeddingList search を使用します。結果は entity レベルの一致になります。

```python
from pymilvus import MilvusClient
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query = EmbeddingList()
query.add([0.12, 0.21, 0.32, 0.44])
query.add([0.18, 0.23, 0.29, 0.36])

results = client.search(
    collection_name="tech_articles",
    data=[query],
    anns_field="chunks[emb_list_vector]",
    limit=3,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)

for hits in results:
    for hit in hits:
        print(hit["id"], hit["distance"], hit["entity"])
```

この検索モードでは、`limit` は各クエリに対して返される entity の数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の Struct 要素ではなく、一致した親 entity を表します。

<Admonition type="info" icon="📘" title="注記">

完全な ColBERT または ColPali スタイルの手順については、[Embedding Lists を使った検索](./tutorial-colbert-colpali) を参照してください。このページでは、StructArray 検索の基本的な動作のみを扱います。

</Admonition>

## element-level search を実行する\{#run-element-level-search}

各 Struct 要素が独立してベクトル検索に参加する必要がある場合は、element-level search を使用します。クエリは通常のベクトルであり、対象ベクトルサブフィールドは通常のベクトルメトリックでインデックスされている必要があります。

```python
query_vector = [0.19, 0.24, 0.30, 0.37]

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    limit=5,
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

element-level search では、各ヒットは一致した Struct 要素を表します。`offset` 値は、StructArray フィールド内におけるその要素の 0 ベース位置です。複数の Struct 要素がクエリに一致する場合、同じ entity が複数回現れることがあります。`limit` 値は一意な親 entity ではなく、要素ヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| 結果項目 | EmbeddingList search | Element-level search |
| --- | --- | --- |
| `id` | 一致した entity の主キー。 | 一致した Struct 要素を含む entity の主キー。 |
| `distance` または score | クエリ embedding list と保存済み embedding list の間の score または distance。 | クエリベクトルと一致した Struct 要素ベクトルの間の score または distance。 |
| `offset` | 該当なし。 | 返されるときに一致した Struct 要素の 0 ベース位置。 |
| 繰り返される主キー | 結果は entity レベルのため、単一クエリでは通常発生しない。 | 同じ entity 内の複数の Struct 要素が一致する可能性があるため、発生する可能性がある。 |
| 要求された StructArray 出力フィールド | 一致した entity から返される。 | 対象 API および SDK でサポートされる element-level ヒット形式で返される。 |

## よくある間違い\{#common-mistakes}

- 必要なサブフィールドパス構文 `chunks[emb]` ではなく、`chunks.emb` を使用する。

- 通常のベクトルメトリックでインデックスされたベクトルサブフィールドに対して EmbeddingList クエリを使用する。

- `MAX_SIM*` メトリックでインデックスされたベクトルサブフィールドに対して通常のベクトルクエリを使用する。

- element-level search の `limit` がその数だけ一意な親 entity を返すと期待する。返されるのは要素ヒットです。

- EmbeddingList search が特定の要素 offset を返すと期待する。返されるのは entity レベルの一致です。

- 1 つのベクトルサブフィールドを両方の検索モードに再利用する。各ベクトルサブフィールドは 1 つのインデックスしか受け付けないため、別々のベクトルサブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. scalar 条件で element-level search を制限するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. score または distance の境界で検索するには、[StructArray を使った範囲検索](./range-search-with-struct-arrays) を参照してください。

1. element-level search の後に親 entity ごとに最大 1 件の結果を返すには、[StructArray を使ったグループ化検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) を参照してください。

1. サポートされているデータ型、メトリック、フィルタ、およびバージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


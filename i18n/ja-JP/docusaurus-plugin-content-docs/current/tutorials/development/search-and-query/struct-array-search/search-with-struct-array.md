---
title: "StructArray を使った基本的なベクトル検索 | Cloud"
slug: /search-with-struct-array
sidebar_label: "基本的なベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。各 entity に保存された embedding list をスコアリングする EmbeddingList search と、各 Struct 要素を個別に検索する element-level search です。 | Cloud"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った基本的なベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。各 entity に保存された embedding list をスコアリングする EmbeddingList search と、各 Struct 要素を個別に検索する element-level search です。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。各 chunk には、テキスト、scalar メタデータ、EmbeddingList search 用の index がある `emb_list_vector` という名前のベクトルサブフィールド、および element-level search 用の index がある `emb` という名前のベクトルサブフィールドが含まれています。

## 始める前に\{#before-you-begin}

collection の schema、データ、index がすでに準備されていることを確認してください。

| 要件 | 準備場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成する。 | [StructArray フィールドの作成](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含む entity を挿入する。 | [StructArray フィールドへのデータ挿入](./insert-struct-array) |
| EmbeddingList search 用に `chunks[emb_list_vector]` に `MAX_SIM*` index を作成する。 | [StructArray フィールドのインデックス作成](./index-struct-array) |
| element-level search 用に `chunks[emb]` に通常のベクトル metric の index を作成する。 | [StructArray フィールドのインデックス作成](./index-struct-array) |

<Admonition type="warning" icon="🚧" title="警告">

1 つのベクトルフィールドまたはベクトルサブフィールドで受け付けられる index は 1 つだけです。EmbeddingList search と element-level search の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList search 用に index 化され、`chunks[emb]` は element-level search 用に index 化されています。

</Admonition>

## 検索モードを選ぶ\{#choose-a-search-mode}

| 項目 | EmbeddingList search | Element-level search |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上のベクトルを含む embedding list。 | 通常のベクトル。 |
| Metric ファミリー | `MAX_SIM*`。たとえば `MAX_SIM_COSINE`。 | `COSINE`、`IP`、`L2` などの通常のベクトル metric。 |
| 1 件のヒットが表すもの | StructArray ベクトルサブフィールドがクエリ embedding list に類似する一致した entity。 | StructArray フィールド内の一致した Struct 要素。 |
| 結果の粒度 | Entity レベル。 | Struct 要素レベル。 |
| Offset | 該当なし。 | 返される場合、一致した Struct 要素の 0 始まりの位置を識別する。 |
| 一般的な用途 | ColBERT、ColPali、その他の late-interaction retrieval パターン。 | chunk レベル、passage レベル、clip レベル、patch レベル、fact レベルの retrieval。 |

## EmbeddingList search を実行する\{#run-embeddinglist-search}

クエリ自体に複数のベクトルが含まれ、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` metric で index 化されている場合は、EmbeddingList search を使用します。結果は entity レベルの一致です。

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

この検索モードでは、`limit` は各クエリに対して返される entity の数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の 1 つの Struct 要素ではなく、一致した親 entity を表します。

<Admonition type="info" icon="📘" title="注記">

ColBERT または ColPali スタイルの完全なウォークスルーについては、[Embedding Lists を使った検索](./tutorial-colbert-colpali) を参照してください。このページでは、基本的な StructArray 検索の動作のみを扱います。

</Admonition>

## element-level search を実行する\{#run-element-level-search}

各 Struct 要素が独立してベクトル検索に参加する必要がある場合は、element-level search を使用します。クエリは通常のベクトルであり、対象のベクトルサブフィールドは通常のベクトル metric で index 化されている必要があります。

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

element-level search では、各ヒットは一致した Struct 要素を表します。`offset` の値は、StructArray フィールド内におけるその要素の 0 始まりの位置です。同じ entity でも、複数の Struct 要素がクエリに一致する場合は複数回現れることがあります。`limit` の値は、一意な親 entity ではなく、要素ヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| 結果項目 | EmbeddingList search | Element-level search |
| --- | --- | --- |
| `id` | 一致した entity の主キー。 | 一致した Struct 要素を含む entity の主キー。 |
| `distance` または score | クエリ embedding list と保存された embedding list の間の score または distance。 | クエリベクトルと一致した Struct 要素ベクトルの間の score または distance。 |
| `offset` | 該当なし。 | 返される場合、一致した Struct 要素の 0 始まりの位置。 |
| 主キーの繰り返し | 結果は entity レベルのため、単一クエリでは通常発生しない。 | 同じ entity 内の複数の Struct 要素が一致する可能性があるため、発生しうる。 |
| 要求した StructArray 出力フィールド | 一致した entity から返される。 | 対象の API と SDK でサポートされる element-level ヒット形式で返される。 |

## よくある間違い\{#common-mistakes}

- 必要なサブフィールドパス構文 `chunks[emb]` ではなく、`chunks.emb` を使用する。

- 通常のベクトル metric で index 化されたベクトルサブフィールドに対して EmbeddingList クエリを使用する。

- `MAX_SIM*` metric で index 化されたベクトルサブフィールドに対して通常のベクトルクエリを使用する。

- element-level search の `limit` で、その数だけ一意な親 entity が返ると期待する。返るのは要素ヒットです。

- EmbeddingList search で特定の要素 offset が返ると期待する。返るのは entity レベルの一致です。

- 1 つのベクトルサブフィールドを両方の検索モードで再利用する。各ベクトルサブフィールドで受け付けられる index は 1 つだけなので、別々のベクトルサブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. scalar 条件で element-level search を制限するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. score または distance の境界で検索するには、[StructArray を使った範囲検索](./range-search-with-struct-arrays) を参照してください。

1. element-level search の後に親 entity ごとに最大 1 件の結果を返すには、[StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) を参照してください。

1. サポートされているデータ型、metric、filter、およびバージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


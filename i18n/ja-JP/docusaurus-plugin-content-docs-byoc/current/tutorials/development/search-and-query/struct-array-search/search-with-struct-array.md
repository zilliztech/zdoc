---
title: "StructArray を使った基本的なベクトル検索 | BYOC"
slug: /search-with-struct-array
sidebar_label: "基本的なベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内の vector サブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。各 entity に格納された embedding list をスコアリングする EmbeddingList search と、各 Struct 要素を個別に検索する element-level search です。 | BYOC"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った基本的なベクトル検索

このページでは、StructArray フィールド内の vector サブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。各 entity に格納された embedding list をスコアリングする EmbeddingList search と、各 Struct 要素を個別に検索する element-level search です。

このページでは、[Create a StructArray Field](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。各 chunk には text、scalar metadata、EmbeddingList search 用の index が付いた `emb_list_vector` という名前の vector サブフィールド、および element-level search 用の index が付いた `emb` という名前の vector サブフィールドが含まれます。

## Before you begin\{#before-you-begin}

collection schema、data、index がすでに準備されていることを確認してください。

| Requirement | Where to prepare it |
| --- | --- |
| `chunks` などの StructArray フィールドを作成する。 | [Create a StructArray Field](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含む entity を挿入する。 | [Insert Data into StructArray Fields](./insert-struct-array) |
| EmbeddingList search 用に `chunks[emb_list_vector]` に `MAX_SIM*` index を作成する。 | [Index StructArray Fields](./index-struct-array) |
| element-level search 用に `chunks[emb]` に通常のベクトル metric index を作成する。 | [Index StructArray Fields](./index-struct-array) |

<Admonition type="warning" icon="🚧" title="Warning">

vector フィールドまたは vector サブフィールドは 1 つの index しか受け付けません。EmbeddingList search と element-level search の両方が必要な場合は、2 つの別々の vector サブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList search 用に index され、`chunks[emb]` は element-level search 用に index されています。

</Admonition>

## 検索モードを選択する\{#choose-a-search-mode}

| Aspect | EmbeddingList search | Element-level search |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上の vector を含む embedding list。 | 通常の vector。 |
| Metric ファミリー | `MAX_SIM*`。たとえば `MAX_SIM_COSINE`。 | 通常のベクトル metric。たとえば `COSINE`、`IP`、`L2`。 |
| 1 件のヒットが表すもの | StructArray の vector サブフィールドがクエリ embedding list に類似している、マッチした entity。 | StructArray フィールド内のマッチした Struct 要素。 |
| 結果の粒度 | Entity レベル。 | Struct 要素レベル。 |
| Offset | 該当なし。 | 返される際に、マッチした Struct 要素の 0 ベース位置を示す。 |
| 代表的な用途 | ColBERT、ColPali、その他の late-interaction retrieval パターン。 | chunk レベル、passage レベル、clip レベル、patch レベル、または fact レベルの retrieval。 |

## EmbeddingList search を実行する\{#run-embeddinglist-search}

クエリ自体が複数の vector を含み、対象の StructArray vector サブフィールドが `MAX_SIM*` metric で index されている場合は、EmbeddingList search を使用します。結果は entity レベルの一致です。

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

この検索モードでは、`limit` は各クエリに対して返される entity の数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の 1 つの Struct 要素ではなく、マッチした親 entity を表します。

<Admonition type="info" icon="📘" title="Notes">

完全な ColBERT または ColPali スタイルの手順については、[Search with Embedding Lists](./tutorial-colbert-colpali) を参照してください。このページでは、基本的な StructArray 検索動作のみを扱います。

</Admonition>

## element-level search を実行する\{#run-element-level-search}

各 Struct 要素が独立してベクトル検索に参加する必要がある場合は、element-level search を使用します。クエリは通常の vector であり、対象の vector サブフィールドは通常のベクトル metric で index されている必要があります。

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

element-level search では、各ヒットはマッチした Struct 要素を表します。`offset` 値は、StructArray フィールド内におけるその要素の 0 ベース位置です。複数の Struct 要素がクエリに一致した場合、同じ entity が複数回現れることがあります。`limit` 値は一意な親 entity ではなく、要素ヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| Result item | EmbeddingList search | Element-level search |
| --- | --- | --- |
| `id` | マッチした entity の主キー。 | マッチした Struct 要素を含む entity の主キー。 |
| `distance` または score | クエリ embedding list と格納された embedding list の間の score または distance。 | クエリ vector とマッチした Struct 要素 vector の間の score または distance。 |
| `offset` | 該当なし。 | 返される際に、マッチした Struct 要素の 0 ベース位置。 |
| 繰り返される主キー | 結果が entity レベルであるため、単一クエリでは通常発生しない。 | 同じ entity 内の複数の Struct 要素が一致する可能性があるため、発生することがある。 |
| 要求された StructArray 出力フィールド | マッチした entity から返される。 | 対象の API および SDK でサポートされる element-level hit 形式で返される。 |

## よくある間違い\{#common-mistakes}

- 必須のサブフィールドパス構文 `chunks[emb]` の代わりに `chunks.emb` を使う。

- 通常のベクトル metric で index された vector サブフィールドに対して EmbeddingList クエリを使用する。

- `MAX_SIM*` metric で index された vector サブフィールドに対して通常の vector クエリを使用する。

- element-level search の `limit` が、その数だけ一意な親 entity を返すと期待する。返されるのは要素ヒットです。

- EmbeddingList search が特定の要素 offset を返すと期待する。返されるのは entity レベルの一致です。

- 1 つの vector サブフィールドを両方の検索モードで再利用する。各 vector サブフィールドは 1 つの index しか受け付けないため、別々の vector サブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. scalar 条件で element-level search を制限するには、[Filtered Search with StructArray](./filtered-search-with-struct-arrays) をお読みください。

1. score または distance の境界で検索するには、[Range Search with StructArray](./range-search-with-struct-arrays) をお読みください。

1. element-level search の後に親 entity ごとに最大 1 件の結果だけを返すには、[Grouping Search with StructArray](./grouping-search-with-struct-array) をお読みください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[Hybrid Search with StructArray](./hybrid-search-with-struct-array) をお読みください。

1. サポートされるデータ型、metric、filter、バージョンごとの制限を確認するには、[StructArray Limits](./struct-array-limits) をお読みください。


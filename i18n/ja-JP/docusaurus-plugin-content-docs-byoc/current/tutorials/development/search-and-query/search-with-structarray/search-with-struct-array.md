---
title: "StructArray を使用した基本的なベクトル検索 | BYOC"
slug: /search-with-struct-array
sidebar_label: "基本的なベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。各 entity に保存された embedding list をスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベル検索です。 | BYOC"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使用した基本的なベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。EmbeddingList 検索は各 entity に保存された embedding list をスコアリングし、要素レベル検索は各 Struct 要素を個別に検索します。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` collection を使用します。この collection には `chunks` という名前の StructArray フィールドがあります。各 chunk には、テキスト、scalar メタデータ、EmbeddingList 検索用の index が付いた `emb_list_vector` というベクトルサブフィールド、および要素レベル検索用の index が付いた `emb` というベクトルサブフィールドが含まれています。

## 始める前に\{#before-you-begin}

collection の schema、データ、および index がすでに準備されていることを確認してください。

| 要件 | 準備場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成する。 | [StructArray フィールドの作成](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含む entity を挿入する。 | [StructArray フィールドへのデータの挿入](./insert-struct-array) |
| EmbeddingList 検索用に `chunks[emb_list_vector]` に `MAX_SIM*` index を作成する。 | [StructArray フィールドのインデックス作成](./index-struct-array) |
| 要素レベル検索用に `chunks[emb]` に通常の vector metric index を作成する。 | [StructArray フィールドのインデックス作成](./index-struct-array) |

<Admonition type="warning" icon="🚧" title="警告">

1 つの vector フィールドまたはベクトルサブフィールドで受け入れられる index は 1 つだけです。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用に index 化され、`chunks[emb]` は要素レベル検索用に index 化されています。

</Admonition>

## 検索モードを選択する\{#choose-a-search-mode}

| 観点 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上のベクトルを含む embedding list。 | 通常の vector。 |
| Metric ファミリー | `MAX_SIM_COSINE` などの `MAX_SIM*`。 | `COSINE`、`IP`、`L2` などの通常の vector metrics。 |
| 1 件のヒットが表すもの | StructArray のベクトルサブフィールドがクエリ embedding list と類似している一致 entity。 | StructArray フィールド内の一致した Struct 要素。 |
| 結果の粒度 | Entity レベル。 | Struct 要素レベル。 |
| Offset | 該当なし。 | 返される際に、一致した Struct 要素の 0 始まりの位置を識別する。 |
| 一般的な用途 | ColBERT、ColPali、その他の late-interaction retrieval パターン。 | Chunk レベル、passage レベル、clip レベル、patch レベル、または fact レベルの検索。 |

## EmbeddingList 検索を実行する\{#run-embeddinglist-search}

クエリ自体に複数のベクトルが含まれ、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` metric で index 化されている場合は、EmbeddingList 検索を使用します。結果は entity レベルの一致です。

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

この検索モードでは、`limit` は各クエリに対して返される entity の数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の Struct 要素 1 つではなく、一致した親 entity を表します。

<Admonition type="info" icon="📘" title="メモ">

ColBERT または ColPali スタイルの完全なウォークスルーについては、[Embedding Lists を使用した検索](./tutorial-colbert-colpali) を参照してください。このページでは、基本的な StructArray 検索の動作のみを扱います。

</Admonition>

## 要素レベル検索を実行する\{#run-element-level-search}

各 Struct 要素を独立してベクトル検索に参加させたい場合は、要素レベル検索を使用します。クエリは通常の vector であり、対象のベクトルサブフィールドは通常の vector metric で index 化されている必要があります。

```plaintext
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

要素レベル検索では、各ヒットは一致した Struct 要素を表します。`offset` の値は、StructArray フィールド内におけるその要素の 0 始まりの位置です。複数の Struct 要素がクエリに一致する場合、同じ entity が複数回表示されることがあります。`limit` の値は一意な親 entity ではなく、要素ヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| 結果項目 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| `id` | 一致した entity の主キー。 | 一致した Struct 要素を含む entity の主キー。 |
| `distance` または score | クエリ embedding list と保存された embedding list の間の score または distance。 | クエリ vector と一致した Struct 要素ベクトルの間の score または distance。 |
| `offset` | 該当なし。 | 返される際に、一致した Struct 要素の 0 始まりの位置。 |
| 主キーの繰り返し | 結果は entity レベルのため、単一クエリでは通常発生しない。 | 同じ entity 内の複数の Struct 要素が一致する可能性があるため、発生する可能性がある。 |
| 要求した StructArray 出力フィールド | 一致した entity から返される。 | 対象 API および SDK がサポートする要素レベルのヒット形式で返される。 |

## よくある間違い\{#common-mistakes}

- 必須のサブフィールドパス構文 `chunks[emb]` の代わりに `chunks.emb` を使用する。

- 通常の vector metric で index 化されたベクトルサブフィールドに対して EmbeddingList クエリを使用する。

- `MAX_SIM*` metric で index 化されたベクトルサブフィールドに対して通常の vector クエリを使用する。

- 要素レベル検索の `limit` によって、その数だけ一意な親 entity が返されると期待する。返されるのは要素ヒットです。

- EmbeddingList 検索で特定の要素 offset が返されると期待する。返されるのは entity レベルの一致です。

- 1 つのベクトルサブフィールドを両方の検索モードで再利用する。各ベクトルサブフィールドで受け入れられる index は 1 つだけであるため、別々のベクトルサブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. Scalar 条件で要素レベル検索を制限するには、[StructArray を使用したフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. Score または distance の境界で検索するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 要素レベル検索の後に親 entity ごとに最大 1 件の結果を返すには、[StructArray を使用したグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[StructArray を使用したハイブリッド検索](./hybrid-search-with-struct-array) を参照してください。

1. サポートされているデータ型、metrics、filters、およびバージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


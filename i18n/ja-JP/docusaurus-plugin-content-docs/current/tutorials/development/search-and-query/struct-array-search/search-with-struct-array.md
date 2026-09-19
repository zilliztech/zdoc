---
title: "StructArray を使った基本的なベクトル検索 | Cloud"
slug: /search-with-struct-array
sidebar_label: "基本的なベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は、各エンティティに保存されている embedding list をスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベル検索という 2 つの基本的なベクトル検索モードをサポートしています。 | Cloud"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った基本的なベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は、各エンティティに保存されている embedding list をスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベル検索という 2 つの基本的なベクトル検索モードをサポートしています。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`chunks` という名前の StructArray フィールドがあります。各チャンクには、テキスト、スカラーメタデータ、EmbeddingList 検索用のインデックスを持つ `emb_list_vector` という名前のベクトルサブフィールド、および要素レベル検索用のインデックスを持つ `emb` という名前のベクトルサブフィールドが含まれています。

## 始める前に\{#before-you-begin}

コレクションのスキーマ、データ、インデックスがすでに準備されていることを確認してください。

| 要件 | 準備する場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成します。 | [StructArray フィールドの作成](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含むエンティティを挿入します。 | [StructArray フィールドへのデータ挿入](./insert-struct-array) |
| EmbeddingList 検索用に `chunks[emb_list_vector]` に `MAX_SIM*` インデックスを作成します。 | [StructArray フィールドのインデックス作成](./index-struct-array) |
| 要素レベル検索用に `chunks[emb]` に通常のベクトルメトリクスのインデックスを作成します。 | [StructArray フィールドのインデックス作成](./index-struct-array) |

<Admonition type="warning" title="Warning">

ベクトルフィールドまたはベクトルサブフィールドで受け付けられるインデックスは 1 つだけです。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用に、`chunks[emb]` は要素レベル検索用にインデックス化されています。

</Admonition>

## 検索モードを選択する\{#choose-a-search-mode}

| 項目 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| 対象のサブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上のベクトルを含む embedding list。 | 通常のベクトル。 |
| メトリクスファミリー | `MAX_SIM_COSINE` などの `MAX_SIM*`。 | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクス。 |
| 1 件のヒットが表すもの | StructArray のベクトルサブフィールドがクエリの embedding list に類似している、一致したエンティティ。 | StructArray フィールド内で一致した Struct 要素。 |
| 結果の粒度 | エンティティレベル。 | Struct 要素レベル。 |
| オフセット | 該当しません。 | 返される場合、一致した Struct 要素の 0 ベースの位置を示します。 |
| 一般的な用途 | ColBERT、ColPali、その他の late-interaction 検索パターン。 | チャンクレベル、パッセージレベル、クリップレベル、パッチレベル、ファクトレベルの検索。 |

## EmbeddingList 検索を実行する\{#run-embeddinglist-search}

クエリ自体に複数のベクトルが含まれており、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` メトリクスでインデックス化されている場合は、EmbeddingList 検索を使用します。結果はエンティティレベルの一致となります。

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

この検索モードでは、`limit` はクエリごとに返されるエンティティの数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の 1 つの Struct 要素ではなく、一致した親エンティティを表します。

<Admonition type="info" title="Notes">

ColBERT または ColPali スタイルの完全なウォークスルーについては、[EmbeddingLists を使った検索](./tutorial-colbert-colpali) を参照してください。このページでは、StructArray の基本的な検索動作のみを扱います。

</Admonition>

## 要素レベル検索を実行する\{#run-element-level-search}

各 Struct 要素をベクトル検索に個別に参加させる場合は、要素レベル検索を使用します。クエリは通常のベクトルであり、対象のベクトルサブフィールドは通常のベクトルメトリクスでインデックス化されている必要があります。

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

要素レベル検索では、各ヒットは一致した Struct 要素を表します。`offset` の値は、StructArray フィールド内におけるその要素の 0 ベースの位置です。複数の Struct 要素がクエリに一致した場合は、同じエンティティが複数回現れることがあります。`limit` の値は、一意の親エンティティではなく、要素のヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| 結果項目 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| `id` | 一致したエンティティのプライマリキー。 | 一致した Struct 要素を含むエンティティのプライマリキー。 |
| `distance` またはスコア | クエリの embedding list と保存されている embedding list の間のスコアまたは距離。 | クエリベクトルと一致した Struct 要素のベクトルの間のスコアまたは距離。 |
| `offset` | 該当しません。 | 返される場合の、一致した Struct 要素の 0 ベースの位置。 |
| プライマリキーの繰り返し | 結果はエンティティレベルであるため、単一のクエリでは想定されません。 | 同じエンティティ内の複数の Struct 要素が一致する可能性があるため、発生し得ます。 |
| 要求した StructArray 出力フィールド | 一致したエンティティから返されます。 | 対象の API と SDK がサポートする要素レベルのヒット形式で返されます。 |

## よくある間違い\{#common-mistakes}

- 必須のサブフィールドパス構文 `chunks[emb]` ではなく、`chunks.emb` を使用すること。

- 通常のベクトルメトリクスでインデックス化されたベクトルサブフィールドに対して EmbeddingList クエリを使用すること。

- `MAX_SIM*` メトリクスでインデックス化されたベクトルサブフィールドに対して通常のベクトルクエリを使用すること。

- 要素レベル検索の `limit` で、その数だけ一意の親エンティティが返されると期待すること。返されるのは要素のヒットです。

- EmbeddingList 検索で特定の要素のオフセットが返されると期待すること。返されるのはエンティティレベルの一致です。

- 1 つのベクトルサブフィールドを両方の検索モードで再利用すること。ベクトルサブフィールドで受け付けられるインデックスは 1 つだけであるため、別々のベクトルサブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. スカラー条件で要素レベル検索を制限するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. スコアまたは距離の境界で検索するには、[StructArray を使った範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 要素レベル検索の後に親エンティティごとに最大 1 件の結果を返すには、[StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) を参照してください。

1. サポートされているデータ型、メトリクス、フィルター、およびバージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

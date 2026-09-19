---
title: "StructArray を使った基本的なベクトル検索 | BYOC"
slug: /search-with-struct-array
sidebar_label: "基本的なベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。各エンティティに格納された embedding list をスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベル検索です。 | BYOC"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray を使った基本的なベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モード、つまり、各エンティティに格納された embedding list をスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベル検索をサポートしています。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには `chunks` という名前の StructArray フィールドがあります。各 chunk には、テキスト、スカラーメタデータ、EmbeddingList 検索用のインデックスが付いた `emb_list_vector` という名前のベクトルサブフィールド、および要素レベル検索用のインデックスが付いた `emb` という名前のベクトルサブフィールドが含まれます。

## 事前準備\{#before-you-begin}

コレクションのスキーマ、データ、およびインデックスがすでに準備されていることを確認してください。

| 要件 | 準備する場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成します。 | [StructArray フィールドを作成する](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含むエンティティを挿入します。 | [StructArray フィールドにデータを挿入する](./insert-struct-array) |
| EmbeddingList 検索用に `chunks[emb_list_vector]` に `MAX_SIM*` インデックスを作成します。 | [StructArray フィールドのインデックス作成](./index-struct-array) |
| 要素レベル検索用に `chunks[emb]` に通常のベクトルメトリクスのインデックスを作成します。 | [StructArray フィールドのインデックス作成](./index-struct-array) |

<Admonition type="warning" title="Warning">

ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスしか受け付けません。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用にインデックス化され、`chunks[emb]` は要素レベル検索用にインデックス化されています。

</Admonition>

## 検索モードを選択する\{#choose-a-search-mode}

| 項目 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上のベクトルを含む embedding list。 | 通常のベクトル。 |
| メトリクスファミリー | `MAX_SIM_COSINE` などの `MAX_SIM*`。 | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクス。 |
| 1 件のヒットが表すもの | StructArray のベクトルサブフィールドがクエリの embedding list に類似している、一致したエンティティ。 | StructArray フィールド内の一致した Struct 要素。 |
| 結果の粒度 | エンティティレベル。 | Struct 要素レベル。 |
| オフセット | 該当しません。 | 返される際に、一致した Struct 要素の 0 ベースの位置を示します。 |
| 代表的な用途 | ColBERT、ColPali、その他の late interaction 検索パターン。 | chunk レベル、passage レベル、clip レベル、patch レベル、fact レベルの検索。 |

## EmbeddingList 検索を実行する\{#run-embeddinglist-search}

クエリ自体が複数のベクトルを含み、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` メトリクスでインデックス化されている場合は、EmbeddingList 検索を使用します。結果はエンティティレベルの一致です。

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

ColBERT や ColPali スタイルの完全な手順については、[Embedding List で検索する](./tutorial-colbert-colpali) を参照してください。このページでは、基本的な StructArray 検索の動作のみを扱います。

</Admonition>

## 要素レベル検索を実行する\{#run-element-level-search}

各 Struct 要素が個別にベクトル検索に参加する必要がある場合は、要素レベル検索を使用します。クエリは通常のベクトルであり、対象のベクトルサブフィールドは通常のベクトルメトリクスでインデックス化されている必要があります。

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

要素レベル検索では、各ヒットは一致した Struct 要素を表します。`offset` の値は、StructArray フィールド内におけるその要素の 0 ベースの位置です。複数の Struct 要素がクエリに一致する場合は、同じエンティティが複数回現れることがあります。`limit` の値は、一意の親エンティティではなく、要素のヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| 結果の項目 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| `id` | 一致したエンティティの主キー。 | 一致した Struct 要素を含むエンティティの主キー。 |
| `distance` またはスコア | クエリの embedding list と格納されている embedding list の間のスコアまたは距離。 | クエリベクトルと一致した Struct 要素のベクトルの間のスコアまたは距離。 |
| `offset` | 該当しません。 | 返される際の、一致した Struct 要素の 0 ベースの位置。 |
| 重複する主キー | 結果がエンティティレベルであるため、単一のクエリでは想定されません。 | 同じエンティティ内の複数の Struct 要素が一致する可能性があるため、発生する可能性があります。 |
| 要求された StructArray 出力フィールド | 一致したエンティティから返されます。 | 対象の API と SDK でサポートされる要素レベルのヒット形式で返されます。 |

## よくある間違い\{#common-mistakes}

- 必須のサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使用すること。

- 通常のベクトルメトリクスでインデックス化されたベクトルサブフィールドに対して EmbeddingList クエリを使用すること。

- `MAX_SIM*` メトリクスでインデックス化されたベクトルサブフィールドに対して通常のベクトルクエリを使用すること。

- 要素レベル検索の `limit` が、その数だけ一意の親エンティティを返すと期待すること。返されるのは要素のヒットです。

- EmbeddingList 検索が特定の 1 つの要素オフセットを返すと期待すること。返されるのはエンティティレベルの一致です。

- 1 つのベクトルサブフィールドを両方の検索モードで再利用すること。各ベクトルサブフィールドは 1 つのインデックスしか受け付けないため、別々のベクトルサブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. スカラー条件で要素レベル検索を制限するには、[StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. スコアまたは距離の境界で検索するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 要素レベル検索の後に親エンティティごとに最大 1 件の結果を返すには、[StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[StructArray を使用したハイブリッド検索](./hybrid-search-with-struct-array) を参照してください。

1. サポートされているデータ型、メトリクス、フィルター、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

---
title: "StructArray フィールドにデータを挿入する | Cloud"
slug: /insert-struct-array
sidebar_label: "StructArray フィールドにデータを挿入する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "各エンティティが構造化された要素の順序付きリストを含む場合に、StructArray フィールドへデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表されます。各オブジェクトは 1 つの Struct 要素を表し、コレクションスキーマで定義された Struct サブフィールド名を使用します。 | Cloud"
type: origin
token: WTPbww9GkifmAvkuRWLcVd4jnnh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドにデータを挿入する

各エンティティが構造化された要素の順序付きリストを含む場合に、StructArray フィールドへデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表されます。各オブジェクトは 1 つの Struct 要素を表し、コレクションスキーマで定義された Struct サブフィールド名を使用します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。各エンティティは技術記事であり、`chunks` フィールドには記事のチャンクが Struct 要素として格納されます。

## 事前準備\{#before-you-begin}

コレクションスキーマにすでに `chunks` StructArray フィールドが含まれていることを確認してください。

| フィールド | 型 | 挿入する値 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事 ID。 |
| `title` | `VARCHAR` | 記事タイトル。 |
| `category` | `VARCHAR` | 記事カテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルの埋め込み。 |
| `chunks` | `ARRAY<STRUCT>` | チャンクオブジェクトのリスト。 |

`chunks` 内の各オブジェクトは Struct スキーマに従う必要があります。

| サブフィールド | 型 | 挿入する値 |
| --- | --- | --- |
| `text` | `VARCHAR` | チャンクのテキスト。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名。 |
| `page` | `INT64` | ページ番号または論理的な位置。 |
| `quality_score` | `FLOAT` | チャンクレベルのスコア。 |
| `has_code` | `BOOL` | チャンクにコードが含まれるかどうか。 |
| `emb_list_vector` | `FLOAT_VECTOR` | EmbeddingList 検索用に書き込むベクトル。 |
| `emb` | `FLOAT_VECTOR` | 要素レベルの検索用に書き込むベクトル。 |

<Admonition type="info" title="Notes">

挿入ペイロードでは、`chunks` は通常のフィールドであり、その値は Struct オブジェクトの配列です。各オブジェクトの内部では、`text` や `emb` のようなサブフィールド名を使用します。`chunks[text]` や `chunks[emb]` のようなパス構文は、挿入後にインデックスを作成する場合、検索を実行する場合、フィルターを構築する場合、または出力フィールドを指定する場合にのみ使用してください。

</Admonition>

## 挿入ペイロードの形状を理解する\{#understand-the-insert-payload-shape}

`chunks` の値は Struct 要素の配列です。各要素は、キーがサブフィールド名であるオブジェクトです。

```json
{
  "doc_id": 1,
  "title": "StructArray indexing patterns",
  "category": "index",
  "title_vector": [0.12, 0.08, 0.32, 0.48],
  "chunks": [
    {
      "text": "Create one index for each vector subfield.",
      "section": "index",
      "page": 1,
      "quality_score": 0.96,
      "has_code": false,
      "emb_list_vector": [0.10, 0.20, 0.30, 0.40],
      "emb": [0.10, 0.20, 0.30, 0.40]
    },
    {
      "text": "Use MAX_SIM metrics for EmbeddingList search.",
      "section": "index",
      "page": 2,
      "quality_score": 0.91,
      "has_code": true,
      "emb_list_vector": [0.16, 0.24, 0.35, 0.45],
      "emb": [0.16, 0.24, 0.35, 0.45]
    }
  ]
}
```

`emb_list_vector` と `emb` は、異なる検索モードをサポートするため、別々のベクトルサブフィールドです。EmbeddingList 検索では、StructArray フィールド内のすべてのベクトルを 1 つの埋め込みリストとして扱い、`MAX_SIM*` メトリクスを用いたエンティティレベルの結果を返します。要素レベルの検索では、各 Struct 要素を個別に検索し、一致した要素のオフセットを返すことができます。この例では、簡潔にするために同じベクトル値を両方のフィールドに格納しています。本番アプリケーションでは、両方の検索モードが同じチャンク埋め込みを使用する場合は同じ埋め込みを両方のサブフィールドに格納でき、2 つの検索モードで異なる表現を使用する場合は異なる埋め込みを格納できます。

## 行を挿入する\{#insert-rows}

StructArray 値を含む行を挿入するには `client.insert()` を使用します。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

data = [
    {
        "doc_id": 1,
        "title": "StructArray indexing patterns",
        "category": "index",
        "title_vector": [0.12, 0.08, 0.32, 0.48],
        "chunks": [
            {
                "text": "Create one index for each vector subfield.",
                "section": "index",
                "page": 1,
                "quality_score": 0.96,
                "has_code": False,
                "emb_list_vector": [0.10, 0.20, 0.30, 0.40],
                "emb": [0.10, 0.20, 0.30, 0.40],
            },
            {
                "text": "Use MAX_SIM metrics for EmbeddingList search.",
                "section": "index",
                "page": 2,
                "quality_score": 0.91,
                "has_code": True,
                "emb_list_vector": [0.16, 0.24, 0.35, 0.45],
                "emb": [0.16, 0.24, 0.35, 0.45],
            },
        ],
    },
    {
        "doc_id": 2,
        "title": "Filtered StructArray search",
        "category": "filter",
        "title_vector": [0.20, 0.18, 0.22, 0.40],
        "chunks": [
            {
                "text": "Use element_filter to match scalar conditions within the same Struct element.",
                "section": "filter",
                "page": 1,
                "quality_score": 0.93,
                "has_code": True,
                "emb_list_vector": [0.21, 0.18, 0.33, 0.44],
                "emb": [0.21, 0.18, 0.33, 0.44],
            },
            {
                "text": "MATCH_LEAST checks how many elements satisfy a predicate.",
                "section": "filter",
                "page": 2,
                "quality_score": 0.88,
                "has_code": False,
                "emb_list_vector": [0.24, 0.22, 0.31, 0.39],
                "emb": [0.24, 0.22, 0.31, 0.39],
            },
        ],
    },
    {
        "doc_id": 3,
        "title": "Element-level search with offsets",
        "category": "search",
        "title_vector": [0.33, 0.11, 0.29, 0.37],
        "chunks": [
            {
                "text": "Element-level search can return the offset of the matched Struct element.",
                "section": "search",
                "page": 1,
                "quality_score": 0.95,
                "has_code": False,
                "emb_list_vector": [0.32, 0.14, 0.28, 0.41],
                "emb": [0.32, 0.14, 0.28, 0.41],
            }
        ],
    },
]

result = client.insert(
    collection_name="tech_articles",
    data=data,
)

print(result)
```

## nullable な StructArray フィールドに挿入する\{#insert-into-nullable-structarray-fields}

`chunks` フィールドが nullable の場合、エンティティは `chunks` フィールド全体を null に設定できます。Python では、null 値を表すために `None` を使用します。

```python
client.insert(
    collection_name="tech_articles",
    data=[
        {
            "doc_id": 10,
            "title": "Article without chunks yet",
            "category": "draft",
            "title_vector": [0.05, 0.10, 0.15, 0.20],
            "chunks": None,
        }
    ],
)
```

nullable な StructArray フィールドに有効な StructArray 値が含まれている場合、その値内のすべてのサブフィールドは null であるか、有効な値を持つ必要があります。一部のサブフィールドを null にし、他のサブフィールドを有効な値に設定したエンティティを挿入すると、エラーになります。

<Admonition type="warning" title="Warning">

nullable な StructArray フィールドは、Milvus v3.0.x と互換性のあるクラスターでのみ使用できます。既存のコレクションに StructArray フィールドを動的に追加する場合、追加するフィールドは nullable である必要があり、既存のエンティティでは、新しいフィールドのすべてのサブフィールドに対して `null` が返されます。

</Admonition>

## 挿入したデータを検証する\{#validate-inserted-data}

コレクションをクエリして、StructArray フィールド全体または選択したサブフィールドを返すことができます。

```python
rows = client.query(
    collection_name="tech_articles",
    filter="doc_id in [1, 2, 3]",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)

for row in rows:
    print(row)
```

`chunks[text]` のような StructArray フィールドパスは、クエリ、検索、フィルター、またはインデックスの作成を行う場合にのみ使用してください。挿入ペイロードでは、引き続き `chunks` の下にネストされたオブジェクトを使用する必要があります。

## 挿入ルール\{#insert-rules}

| ルール | 説明 |
| --- | --- |
| StructArray フィールドにはオブジェクトの配列を使用します。 | `chunks` の値はリストであり、リスト内の各項目は Struct 要素です。 |
| 各 Struct 要素の内部ではサブフィールド名を使用します。 | `chunks` 内には `{"chunks[text]": "..."}` ではなく `{"text": "...", "emb": [...]}` を挿入します。 |
| Struct スキーマに一致させます。 | 各 Struct 要素は、Struct スキーマで定義されたサブフィールドを使用する必要があります。 |
| ベクトルの次元を一致させます。 | ベクトル値は、それぞれのベクトルサブフィールドに設定された `dim` と一致する必要があります。 |
| `max_capacity` を守ります。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドの `max_capacity` を超えてはなりません。 |
| 検索モードごとに別々のベクトルサブフィールドを使用します。 | EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、両方のベクトルサブフィールドにベクトル値を書き込みます。 |
| `null` はフィールドが nullable の場合にのみ使用します。 | null 非許容の StructArray フィールドには、有効な StructArray 値が必要です。 |

## よくある間違い\{#common-mistakes}

- 挿入ペイロードで `chunks[text]` のようなフィールドパスを使用すること。

- Struct 要素から必須サブフィールドを省略すること。

- 次元が誤ったベクトルを挿入すること。

- `max_capacity` が許容する数を超える Struct 要素を挿入すること。

- 同じ StructArray 値内で、他のサブフィールドは有効なのに 1 つのサブフィールドだけを `null` に設定すること。

- `emb_list_vector` にのみベクトルを書き込み、その後 `chunks[emb]` で要素レベルの検索を実行しようとすること。

- `emb` にのみベクトルを書き込み、その後 `chunks[emb_list_vector]` で EmbeddingList 検索を実行しようとすること。

## 次のステップ\{#next-steps}

1. `chunks[emb_list_vector]`、`chunks[emb]`、およびスカラーサブフィールドのインデックスを作成するには、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

1. StructArray のベクトルサブフィールドを検索するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. nullable の動作とバージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

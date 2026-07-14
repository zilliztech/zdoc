---
title: "StructArray フィールドにデータを挿入する | BYOC"
slug: /insert-struct-array
sidebar_label: "StructArray フィールドにデータを挿入する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "各エンティティが構造化された要素の順序付きリストを含む場合、StructArray フィールドにデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表されます。各オブジェクトは 1 つの Struct 要素を表し、collection schema で定義された Struct サブフィールド名を使用します。 | BYOC"
type: origin
token: WTPbww9GkifmAvkuRWLcVd4jnnh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドにデータを挿入する

各エンティティが構造化された要素の順序付きリストを含む場合、StructArray フィールドにデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表されます。各オブジェクトは 1 つの Struct 要素を表し、collection schema で定義された Struct サブフィールド名を使用します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。各エンティティは技術記事であり、`chunks` フィールドには Struct 要素として記事のチャンクが格納されます。

## 始める前に\{#before-you-begin}

collection schema にすでに `chunks` StructArray フィールドが含まれていることを確認してください。

| フィールド | 型 | 挿入値 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事 ID。 |
| `title` | `VARCHAR` | 記事タイトル。 |
| `category` | `VARCHAR` | 記事カテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルの埋め込み。 |
| `chunks` | `ARRAY<STRUCT>` | チャンクオブジェクトのリスト。 |

`chunks` 内の各オブジェクトは Struct schema に従う必要があります。

| サブフィールド | 型 | 挿入値 |
| --- | --- | --- |
| `text` | `VARCHAR` | チャンクテキスト。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名。 |
| `page` | `INT64` | ページ番号または論理位置。 |
| `quality_score` | `FLOAT` | チャンクレベルのスコア。 |
| `has_code` | `BOOL` | そのチャンクにコードが含まれているかどうか。 |
| `emb_list_vector` | `FLOAT_VECTOR` | EmbeddingList 検索用に書き込まれる vector。 |
| `emb` | `FLOAT_VECTOR` | 要素レベル検索用に書き込まれる vector。 |

<Admonition type="info" icon="📘" title="メモ">

挿入ペイロードでは、`chunks` は通常のフィールドであり、その値は Struct オブジェクトの配列です。各オブジェクトの中では、`text` や `emb` のようなサブフィールド名を使用します。`chunks[text]` や `chunks[emb]` のようなパス構文は、挿入後に index を作成したり、検索を実行したり、filter を構築したり、出力フィールドを指定したりする場合にのみ使用してください。

</Admonition>

## 挿入ペイロードの形状を理解する\{#understand-the-insert-payload-shape}

`chunks` の値は Struct 要素の配列です。各要素は、キーがサブフィールド名であるオブジェクトです。

```plaintext
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

`emb_list_vector` と `emb` は、異なる検索モードをサポートするため、別々の vector サブフィールドです。EmbeddingList 検索では、StructArray フィールド内のすべての vector を 1 つの embedding list として扱い、`MAX_SIM*` メトリクスでエンティティレベルの結果を返します。要素レベル検索では、各 Struct 要素を独立して検索し、一致した要素のオフセットを返すことができます。この例では単純化のために、両方のフィールドに同じ vector 値を格納しています。本番アプリケーションでは、両方の検索モードが同じチャンク埋め込みを使う場合は同じ embeddings を両方のサブフィールドに格納でき、2 つの検索モードが異なる表現を使う場合は異なる embeddings を格納できます。

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

```plaintext
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

nullable な StructArray フィールドに有効な StructArray 値が含まれる場合、その値内のすべてのサブフィールドは null であるか、有効な値を持つ必要があります。一部のサブフィールドを null にし、ほかのサブフィールドを有効な値に設定したエンティティを挿入するとエラーになります。

<Admonition type="warning" icon="🚧" title="警告">

nullable な StructArray フィールドは、Milvus v3.0.x と互換性のある cluster でのみ使用できます。既存の collection に StructArray フィールドを動的に追加する場合、追加するフィールドは nullable である必要があり、既存のエンティティではその新しいフィールドのすべてのサブフィールドについて `null` が返されます。

</Admonition>

## 挿入したデータを検証する\{#validate-inserted-data}

collection をクエリし、StructArray フィールドまたは選択したサブフィールドを返すことができます。

```plaintext
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

`chunks[text]` のような StructArray フィールドパスは、クエリ、検索、filter、または index 作成時にのみ使用してください。挿入ペイロードでは、引き続き `chunks` の下にネストされたオブジェクトを使用する必要があります。

## 挿入ルール\{#insert-rules}

| ルール | 説明 |
| --- | --- |
| StructArray フィールドにはオブジェクトの配列を使用する。 | `chunks` の値はリストであり、リスト内の各項目は Struct 要素です。 |
| 各 Struct 要素内ではサブフィールド名を使用する。 | `{"chunks[text]": "..."}` ではなく、`chunks` 内に `{"text": "...", "emb": [...]}` を挿入します。 |
| Struct schema に一致させる。 | 各 Struct 要素は、Struct schema で定義されたサブフィールドを使用する必要があります。 |
| vector 次元を一致させる。 | vector 値は、その vector サブフィールドに設定された `dim` と一致する必要があります。 |
| `max_capacity` を守る。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドの `max_capacity` を超えてはなりません。 |
| 検索モードごとに別々の vector サブフィールドを使用する。 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、両方の vector サブフィールドに vector 値を書き込みます。 |
| `null` はフィールドが nullable の場合にのみ使用する。 | non-nullable な StructArray フィールドには、有効な StructArray 値が必要です。 |

## よくあるミス\{#common-mistakes}

- 挿入ペイロードで `chunks[text]` のようなフィールドパスを使用する。

- Struct 要素から必須サブフィールドを省略する。

- 次元が間違った vector を挿入する。

- `max_capacity` が許可する数より多くの Struct 要素を挿入する。

- 同じ StructArray 値内で、ほかのサブフィールドは有効なのに 1 つのサブフィールドだけを `null` に設定する。

- `emb_list_vector` にしか vector を書き込まず、その後 `chunks[emb]` で要素レベル検索を実行しようとする。

- `emb` にしか vector を書き込まず、その後 `chunks[emb_list_vector]` で EmbeddingList 検索を実行しようとする。

## 次のステップ\{#next-steps}

1. `chunks[emb_list_vector]`、`chunks[emb]`、および scalar サブフィールドの index を作成するには、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

1. StructArray vector サブフィールドを検索するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. nullable の動作とバージョン固有の制限を確認するには、[StructArray の制限事項](./struct-array-limits) を参照してください。


---
title: "StructArray フィールドにデータを挿入する | BYOC"
slug: /insert-struct-array
sidebar_label: "StructArray フィールドにデータを挿入する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "各 entity に順序付きの構造化要素リストが含まれる場合に、StructArray フィールドへデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表されます。各オブジェクトは 1 つの Struct 要素を表し、collection schema で定義された Struct subfield 名を使用します。 | BYOC"
type: origin
token: WTPbww9GkifmAvkuRWLcVd4jnnh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドにデータを挿入する

各 entity に順序付きの構造化要素リストが含まれる場合に、StructArray フィールドへデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表されます。各オブジェクトは 1 つの Struct 要素を表し、collection schema で定義された Struct subfield 名を使用します。

このページでは、[Create a StructArray Field](./create-struct-array) の `tech_articles` collection を使用します。各 entity は技術記事であり、`chunks` フィールドには Struct 要素として記事のチャンクが格納されます。

## 事前準備\{#before-you-begin}

collection schema にすでに `chunks` StructArray フィールドが含まれていることを確認してください。

| Field | Type | Insert value |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事 ID。 |
| `title` | `VARCHAR` | 記事タイトル。 |
| `category` | `VARCHAR` | 記事カテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルの embedding。 |
| `chunks` | `ARRAY<STRUCT>` | chunk オブジェクトのリスト。 |

`chunks` 内の各オブジェクトは Struct schema に従う必要があります。

| Subfield | Type | Insert value |
| --- | --- | --- |
| `text` | `VARCHAR` | chunk テキスト。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名。 |
| `page` | `INT64` | ページ番号または論理的位置。 |
| `quality_score` | `FLOAT` | chunk レベルのスコア。 |
| `has_code` | `BOOL` | その chunk にコードが含まれているかどうか。 |
| `emb_list_vector` | `FLOAT_VECTOR` | EmbeddingList search 用に書き込まれる vector。 |
| `emb` | `FLOAT_VECTOR` | 要素レベル search 用に書き込まれる vector。 |

<Admonition type="info" icon="📘" title="Notes">

挿入ペイロードでは、`chunks` は通常のフィールドであり、その値は Struct オブジェクトの配列です。各オブジェクトの内部では、`text` や `emb` のような subfield 名を使用します。`chunks[text]` や `chunks[emb]` のようなパス構文は、挿入後に index を作成したり、search を実行したり、filter を構築したり、output fields を指定したりする場合にのみ使用してください。

</Admonition>

## 挿入ペイロードの形状を理解する\{#understand-the-insert-payload-shape}

`chunks` の値は Struct 要素の配列です。各要素は、キーが subfield 名であるオブジェクトです。

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

`emb_list_vector` と `emb` は、異なる search モードをサポートするため、別々の vector subfield です。EmbeddingList search は StructArray フィールド内のすべての vector を 1 つの embedding list として扱い、`MAX_SIM*` metrics による entity レベルの結果を返します。要素レベル search は各 Struct 要素を独立して検索し、一致した要素の offset を返すことができます。この例では簡潔さのために両方のフィールドに同じ vector 値を格納しています。本番アプリケーションでは、両方の search モードが同じ chunk embedding を使用する場合は同じ embedding を両方の subfield に格納でき、2 つの search モードが異なる表現を使用する場合は異なる embedding を格納できます。

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

## nullable な StructArray フィールドへの挿入\{#insert-into-nullable-structarray-fields}

`chunks` フィールドが nullable の場合、entity は `chunks` フィールド全体を null に設定できます。Python では、null 値を表すために `None` を使用します。

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

nullable な StructArray フィールドに有効な StructArray 値が含まれる場合、その値のすべての subfield は null であるか、有効な値を持っている必要があります。一部の subfield を null にし、他の subfield を有効な値に設定した entity を挿入するとエラーになります。

<Admonition type="warning" icon="🚧" title="Warning">

nullable な StructArray フィールドは、Milvus v3.0.x と互換性のある cluster でのみ利用できます。既存の collection に StructArray フィールドを動的に追加する場合、追加されるフィールドは nullable でなければならず、既存の entity はその新しいフィールドのすべての subfield に対して `null` を返します。

</Admonition>

## 挿入されたデータを検証する\{#validate-inserted-data}

collection を query して、StructArray フィールドまたは選択した subfield を返すことができます。

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

`chunks[text]` のような StructArray フィールドパスは、query、search、filter、または index 作成時にのみ使用してください。挿入ペイロードでは、引き続き `chunks` 配下のネストされたオブジェクトを使用する必要があります。

## 挿入ルール\{#insert-rules}

| Rule | Explanation |
| --- | --- |
| StructArray フィールドにはオブジェクトの配列を使用する。 | `chunks` の値はリストであり、リスト内の各項目が Struct 要素です。 |
| 各 Struct 要素の内部では subfield 名を使用する。 | `{"chunks[text]": "..."}` ではなく、`chunks` の中に `{"text": "...", "emb": [...]}` を挿入します。 |
| Struct schema に一致させる。 | 各 Struct 要素は、Struct schema で定義された subfield を使用する必要があります。 |
| vector 次元を一致させる。 | vector 値は、それぞれの vector subfield に設定された `dim` と一致する必要があります。 |
| `max_capacity` を守る。 | 1 つの entity に含める Struct 要素数は、StructArray フィールドの `max_capacity` を超えてはいけません。 |
| 別々の search モードには別々の vector subfield を使用する。 | EmbeddingList search と要素レベル search の両方が必要な場合、両方の vector subfield に vector 値を書き込みます。 |
| `null` はフィールドが nullable の場合のみ使用する。 | non-nullable な StructArray フィールドには、有効な StructArray 値が必要です。 |

## よくある間違い\{#common-mistakes}

- 挿入ペイロードで `chunks[text]` のようなフィールドパスを使用する。

- Struct 要素から必須 subfield を省略する。

- 次元が間違った vector を挿入する。

- `max_capacity` が許可する数を超える Struct 要素を挿入する。

- 同じ StructArray 値の中で、他の subfield は有効なのに 1 つの subfield だけを `null` に設定する。

- vector を `emb_list_vector` にしか書き込まず、その後 `chunks[emb]` に対して要素レベル search を実行しようとする。

- vector を `emb` にしか書き込まず、その後 `chunks[emb_list_vector]` に対して EmbeddingList search を実行しようとする。

## 次のステップ\{#next-steps}

1. `chunks[emb_list_vector]`、`chunks[emb]`、および scalar subfield の index を作成するには、[Index StructArray Fields](./index-struct-array) を参照してください。

1. StructArray vector subfield を search するには、[Basic Vector Search with StructArray](./search-with-struct-array) を参照してください。

1. nullable の動作とバージョン固有の制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。


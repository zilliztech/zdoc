---
title: "StructArray フィールドにインデックスを作成する | BYOC"
slug: /index-struct-array
sidebar_label: "StructArray フィールドにインデックスを作成する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "vector search を実行する前、または scalar filtering を高速化するために、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドの場合、インデックスの対象は `chunks[emblistvector]`、`chunks[emb]`、`chunks[section]` などのサブフィールドパスです。 | BYOC"
type: origin
token: VvkEwug9ciPZYVk6hM1chLydnib
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドにインデックスを作成する

vector search を実行する前、または scalar filtering を高速化するために、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドの場合、インデックスの対象は `chunks[emb_list_vector]`、`chunks[emb]`、`chunks[section]` などのサブフィールドパスです。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。`chunks` StructArray フィールドには、フィルタリング用の scalar サブフィールドと検索用の vector サブフィールドが含まれています。

## 開始する前に\{#before-you-begin}

collection schema にすでに `chunks` StructArray フィールドが含まれており、データが挿入されていることを確認してください。

| サブフィールドパス | 型 | インデックスの目的 |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスによる EmbeddingList 検索。 |
| `chunks[emb]` | `FLOAT_VECTOR` | 通常の vector メトリクスによる要素レベル検索。 |
| `chunks[section]` | `VARCHAR` | カテゴリフィルタリング。 |
| `chunks[quality_score]` | `FLOAT` | 数値フィルタリングおよび範囲スタイルの述語。 |
| `chunks[has_code]` | `BOOL` | ブールフィルタリング。 |

<Admonition type="info" icon="📘" title="注意">

vector フィールドまたは vector サブフィールドは、1 つのインデックスしか受け付けません。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々の vector サブフィールドを作成し、それぞれに個別にインデックスを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用にインデックスが作成され、`chunks[emb]` は要素レベル検索用にインデックスが作成されています。

</Admonition>

## インデックスを選択する\{#choose-indexes}

検索モードを使って vector メトリクスファミリーを選択します。

| 検索またはフィルタの目的 | 対象パス | 選択するもの |
| --- | --- | --- |
| EmbeddingList 検索 | `chunks[emb_list_vector]` | `MAX_SIM*` メトリクスファミリー。 |
| 要素レベルの vector search | `chunks[emb]` | `COSINE`、`IP`、`L2` などの通常の vector メトリクスファミリー。 |
| 文字列またはカテゴリでフィルタリング | `chunks[section]` | 対象でサポートされる scalar インデックス。 |
| 数値範囲でフィルタリング | `chunks[quality_score]`, `chunks[page]` | 対象でサポートされる scalar インデックス。 |
| ブール値でフィルタリング | `chunks[has_code]` | 対象でサポートされる scalar インデックス。 |

EmbeddingList 検索では、StructArray vector サブフィールド内の vector を embedding list として扱い、エンティティレベルの結果を返します。要素レベル検索では、各 Struct 要素を個別に検索し、一致した要素のオフセットを返すことができます。

## vector インデックスを作成する\{#create-vector-indexes}

次の例では、2 つの vector インデックスを作成します。最初のインデックスは EmbeddingList 検索に `MAX_SIM*` メトリクスを使用します。2 番目のインデックスは要素レベル検索に通常の vector メトリクスを使用します。

StructArray vector サブフィールドには `AUTOINDEX` を使用してください。

```plaintext
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[emb_list_vector]",
    index_name="chunks_emb_list_auto",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
)

index_params.add_index(
    field_name="chunks[emb]",
    index_name="chunks_emb_auto",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

<Admonition type="warning" icon="🚧" title="警告">

同じ vector サブフィールドに `MAX_SIM*` インデックスと通常の vector メトリクスインデックスを作成しないでください。両方の検索モードが必要な場合は、vector を 2 つの別々の vector サブフィールドに書き込み、各サブフィールドに 1 つのインデックスを作成してください。

</Admonition>

## scalar インデックスを作成する\{#create-scalar-indexes}

StructArray scalar サブフィールドをフィルタで使用する場合は、それらに scalar インデックスを作成します。同じ `structArray[subfield]` パス構文を使用してください。適用可能なインデックスタイプは `INVERTED`、`BITMAP`、`STL_SORT` です。

StructArray scalar サブフィールドには `AUTOINDEX` を使用してください。

```plaintext
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[section]",
    index_name="chunks_section_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[has_code]",
    index_name="chunks_has_code_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[quality_score]",
    index_name="chunks_quality_score_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[page]",
    index_name="chunks_page_auto",
    index_type="AUTOINDEX",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

scalar インデックスは必須ではありませんが、`element_filter(chunks, $[quality_score] > 0.9)` や `MATCH_ANY(chunks, $[section] == "index")` のように、StructArray scalar サブフィールドがフィルタで頻繁に使われる場合に有用です。

## インデックスとメトリクスの互換性\{#index-metric-compatibility}

次の表を使って、StructArray vector サブフィールドに対するインデックスタイプとメトリクスタイプを選択します。まず対象から始め、その後に検索モードごとにメトリクスファミリーを選択します。

StructArray vector サブフィールドには `AUTOINDEX` を使用してください。検索モードで必要なメトリクスファミリーからメトリクスタイプを選択します。

| 検索モード | vector サブフィールドのデータ型 | インデックスタイプ | メトリクスタイプ |
| --- | --- | --- | --- |
| EmbeddingList 検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| EmbeddingList 検索 | `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |
| 要素レベル検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `L2`, `IP`, `COSINE` |
| 要素レベル検索 | `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`, `JACCARD` |

バージョン固有のサポートやその他の制限については、[StructArray の制限](./struct-array-limits) を参照してください。

## インデックスを確認する\{#verify-indexes}

インデックスを作成した後、collection を describe するかインデックスを一覧表示して、想定したサブフィールドパスにインデックスが作成されていることを確認します。

```python
indexes = client.list_indexes(
    collection_name="tech_articles",
)

print(indexes)
```

SDK のバージョンがインデックス記述 API を提供している場合は、特定のインデックスを describe することもできます。

```python
index = client.describe_index(
    collection_name="tech_articles",
    index_name="chunks_emb_cosine",
)

print(index)
```

## インデックスのルール\{#index-rules}

| ルール | 説明 |
| --- | --- |
| サブフィールドインデックスにはパス構文を使用する。 | `emb` や `chunks.emb` ではなく、`chunks[emb]` にインデックスを作成します。 |
| 1 つの vector サブフィールドは 1 つのインデックスを受け付ける。 | 異なるメトリクスファミリーが必要な場合は、別々の vector サブフィールドを使用します。 |
| EmbeddingList 検索には `MAX_SIM*` メトリクスを使用する。 | EmbeddingList クエリデータには、`MAX_SIM*` メトリクスで構築されたインデックスが必要です。 |
| 要素レベル検索には通常の vector メトリクスを使用する。 | 要素レベル検索では通常の vector クエリデータと、`COSINE`、`IP`、`L2` などのメトリクスを使用します。 |
| フィルタに現れる scalar サブフィールドにインデックスを作成する。 | 対象でサポートされる scalar インデックスタイプを使用します。 |
| vector フィールドの制限を意識する。 | vector フィールドと vector サブフィールドの総数には制限があります。多くの vector サブフィールドを追加する前に StructArray の制限を確認してください。 |

## よくある間違い\{#common-mistakes}

- `chunks[emb]` ではなく `chunks.emb` にインデックスを作成する。

- `MAX_SIM*` インデックスだけを作成し、その後で同じサブフィールドに対して要素レベル検索を実行しようとする。

- 通常の vector インデックスだけを作成し、その後で同じサブフィールドに対して EmbeddingList 検索を実行しようとする。

- `MAX_SIM*` と通常の vector メトリクスの両方に 1 つの vector サブフィールドを使い回す。

- 頻繁に使われる StructArray フィルタに対する scalar インデックスを忘れる。

- Struct schema に存在しない StructArray サブフィールドにインデックスを作成する。

## 次のステップ\{#next-steps}

1. エンティティレベルの EmbeddingList 検索または要素レベルの vector search を実行するには、[StructArray を使った基本的な vector search](./search-with-struct-array) を参照してください。

1. 検索中に StructArray scalar サブフィールドをフィルタリングするには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. インデックスとメトリクスの制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


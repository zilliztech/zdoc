---
title: "StructArray フィールドのインデックス作成 | BYOC"
slug: /index-struct-array
sidebar_label: "StructArray フィールドのインデックス作成"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル検索を実行する前、またはスカラーフィルタリングを高速化するために、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドでは、インデックスの対象は `chunks[emblistvector]`、`chunks[emb]`、`chunks[section]` のようなサブフィールドパスです。 | BYOC"
type: origin
token: VvkEwug9ciPZYVk6hM1chLydnib
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドのインデックス作成

ベクトル検索を実行する前、またはスカラーフィルタリングを高速化するために、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドでは、インデックスの対象は `chunks[emb_list_vector]`、`chunks[emb]`、`chunks[section]` のようなサブフィールドパスです。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。`chunks` StructArray フィールドには、フィルタリング用のスカラーサブフィールドと検索用のベクトルサブフィールドが含まれています。

## 事前準備\{#before-you-begin}

コレクションスキーマにすでに `chunks` StructArray フィールドが含まれており、データが挿入されていることを確認してください。

| サブフィールドパス | 型 | インデックスの目的 |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスによる EmbeddingList 検索。 |
| `chunks[emb]` | `FLOAT_VECTOR` | 通常のベクトルメトリクスによる要素レベル検索。 |
| `chunks[section]` | `VARCHAR` | カテゴリフィルタリング。 |
| `chunks[quality_score]` | `FLOAT` | 数値フィルタリングおよび範囲スタイルの述語。 |
| `chunks[has_code]` | `BOOL` | ブールフィルタリング。 |

<Admonition type="info" title="Notes">

ベクトルフィールドまたはベクトルサブフィールドは、1 つのインデックスしか受け付けません。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成し、それぞれに個別にインデックスを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用にインデックス化され、`chunks[emb]` は要素レベル検索用にインデックス化されています。

</Admonition>

## インデックスの選択\{#choose-indexes}

ベクトルメトリクスファミリーを選択するには、検索モードを使用します。

| 検索またはフィルタの目的 | 対象パス | 選択内容 |
| --- | --- | --- |
| EmbeddingList 検索 | `chunks[emb_list_vector]` | `MAX_SIM*` メトリクスファミリー。 |
| 要素レベルのベクトル検索 | `chunks[emb]` | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスファミリー。 |
| 文字列またはカテゴリでフィルタ | `chunks[section]` | 対象でサポートされているスカラーインデックス。 |
| 数値範囲でフィルタ | `chunks[quality_score]`、`chunks[page]` | 対象でサポートされているスカラーインデックス。 |
| ブール値でフィルタ | `chunks[has_code]` | 対象でサポートされているスカラーインデックス。 |

EmbeddingList 検索では、StructArray のベクトルサブフィールド内のベクトルを embedding list として扱い、エンティティレベルの結果を返します。要素レベル検索では、各 Struct 要素を独立して検索し、一致した要素のオフセットを返すことができます。

## ベクトルインデックスの作成\{#create-vector-indexes}

次の例では、2 つのベクトルインデックスを作成します。1 つ目のインデックスは EmbeddingList 検索用に `MAX_SIM*` メトリクスを使用します。2 つ目のインデックスは要素レベル検索用に通常のベクトルメトリクスを使用します。

StructArray のベクトルサブフィールドには `AUTOINDEX` を使用します。

```python
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

<Admonition type="warning" title="Warning">

同じベクトルサブフィールドに `MAX_SIM*` インデックスと通常のベクトルメトリクスのインデックスを作成しないでください。両方の検索モードが必要な場合は、2 つの別々のベクトルサブフィールドにベクトルを書き込み、各サブフィールドに 1 つずつインデックスを作成してください。

</Admonition>

## スカラーインデックスの作成\{#create-scalar-indexes}

StructArray のスカラーサブフィールドをフィルタで使用する場合は、それらのサブフィールドにスカラーインデックスを作成します。同じ `structArray[subfield]` パス構文を使用します。適用可能なインデックスタイプは `INVERTED`、`BITMAP`、`STL_SORT` です。

StructArray のスカラーサブフィールドには `AUTOINDEX` を使用します。

```python
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

スカラーインデックスは必須ではありませんが、`element_filter(chunks, $[quality_score] > 0.9)` や `MATCH_ANY(chunks, $[section] == "index")` のように、StructArray のスカラーサブフィールドがフィルタに頻繁に出現する場合に有用です。

## 適用可能なメトリクスタイプ\{#applicable-metric-types}

次の表を使用して、StructArray フィールドに適用可能なメトリクスタイプを理解してください。

| メトリクスタイプ | 説明 |
| --- | --- |
| `MAX_SIM_COSINE`（`MAX_SIM`） | Cosine に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_L2` | L2 に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_IP` | IP に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_HAMMING` | Hamming に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_JACCARD` | Jaccard に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |

次の式は、クエリの embedding list と StructArray フィールド内のベクトルサブフィールドとの距離を計算する場合に適用されます。

$$
Distance({q}, {v})=\Sigma_{i=1}^{n}(Max_{j=1}^{m}Distance(q_i,v_j))
$$

上記の式では、$q$ は $n$ 個の要素からなる embedding list を指し、$v$ は $m$ 個の要素を含む StructArray サブフィールドを指します。

## インデックスとメトリクスの互換性\{#index-metric-compatibility}

次の表を使用して、StructArray のベクトルサブフィールドに使用するインデックスタイプとメトリクスタイプを選択してください。まず対象から始め、次に検索モードに応じてメトリクスファミリーを選択します。

StructArray のベクトルサブフィールドには `AUTOINDEX` を使用します。検索モードで必要なメトリクスファミリーからメトリクスタイプを選択してください。

| 検索モード | ベクトルサブフィールドのデータ型 | インデックスタイプ | メトリクスタイプ |
| --- | --- | --- | --- |
| EmbeddingList 検索 | `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2` |
| EmbeddingList 検索 | `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`、`MAX_SIM_JACCARD` |
| 要素レベル検索 | `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` | `AUTOINDEX` | `L2`、`IP`、`COSINE` |
| 要素レベル検索 | `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`、`JACCARD` |

バージョン固有のサポートやその他の制限については、[StructArray の制限](./struct-array-limits) を参照してください。

## インデックスの確認\{#verify-indexes}

インデックスを作成した後は、コレクションを describe するか、インデックスを一覧表示して、想定したサブフィールドパスがインデックス化されていることを確認してください。

```python
indexes = client.list_indexes(
    collection_name="tech_articles",
)

print(indexes)
```

SDK のバージョンでインデックス記述 API が公開されている場合は、特定のインデックスを describe することもできます。

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
| サブフィールドのインデックスにはパス構文を使用します。 | `emb` や `chunks.emb` ではなく、`chunks[emb]` にインデックスを作成します。 |
| 1 つのベクトルサブフィールドが受け付けるインデックスは 1 つです。 | 異なるメトリクスファミリーが必要な場合は、別々のベクトルサブフィールドを使用してください。 |
| EmbeddingList 検索には `MAX_SIM*` メトリクスを使用します。 | EmbeddingList クエリデータには、`MAX_SIM*` メトリクスで構築されたインデックスが必要です。 |
| 要素レベル検索には通常のベクトルメトリクスを使用します。 | 要素レベル検索では、通常のベクトルクエリデータと `COSINE`、`IP`、`L2` などのメトリクスを使用します。 |
| フィルタに出現するスカラーサブフィールドにインデックスを作成します。 | 対象でサポートされているスカラーインデックスタイプを使用します。 |
| ベクトルフィールドの制限に注意してください。 | ベクトルフィールドとベクトルサブフィールドの合計数には制限があります。多数のベクトルサブフィールドを追加する前に、StructArray の制限を確認してください。 |

## よくある間違い\{#common-mistakes}

- `chunks[emb]` ではなく `chunks.emb` にインデックスを作成する。

- `MAX_SIM*` インデックスだけを作成し、その後同じサブフィールドで要素レベル検索を実行しようとする。

- 通常のベクトルインデックスだけを作成し、その後同じサブフィールドで EmbeddingList 検索を実行しようとする。

- 1 つのベクトルサブフィールドを `MAX_SIM*` と通常のベクトルメトリクスの両方に再利用する。

- 頻繁に使用される StructArray フィルタのスカラーインデックスを作成し忘れる。

- Struct スキーマに存在しない StructArray サブフィールドにインデックスを作成する。

## 次のステップ\{#next-steps}

1. エンティティレベルの EmbeddingList 検索または要素レベルのベクトル検索を実行するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. 検索中に StructArray のスカラーサブフィールドでフィルタリングするには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. インデックスとメトリクスの制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

---
title: "StructArray フィールドにインデックスを作成 | Cloud"
slug: /index-struct-array
sidebar_label: "StructArray フィールドにインデックスを作成"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル検索を実行する前、またはスカラー フィルタリングを高速化するために、StructArray サブフィールドにインデックスを作成します。StructArray フィールドでは、インデックスの対象は `chunks[emblistvector]`、`chunks[emb]`、`chunks[section]` のようなサブフィールド パスです。 | Cloud"
type: origin
token: VvkEwug9ciPZYVk6hM1chLydnib
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドにインデックスを作成

ベクトル検索を実行する前、またはスカラー フィルタリングを高速化するために、StructArray サブフィールドにインデックスを作成します。StructArray フィールドでは、インデックスの対象は `chunks[emb_list_vector]`、`chunks[emb]`、`chunks[section]` のようなサブフィールド パスです。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` collection を使用します。`chunks` StructArray フィールドには、フィルタリング用のスカラー サブフィールドと検索用のベクトル サブフィールドが含まれています。

## 始める前に\{#before-you-begin}

collection スキーマにすでに `chunks` StructArray フィールドが含まれており、データが挿入されていることを確認してください。

| サブフィールド パス | 型 | インデックスの目的 |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスによる EmbeddingList 検索。 |
| `chunks[emb]` | `FLOAT_VECTOR` | 通常のベクトル メトリクスによる要素レベル検索。 |
| `chunks[section]` | `VARCHAR` | カテゴリ フィルタリング。 |
| `chunks[quality_score]` | `FLOAT` | 数値フィルタリングと範囲スタイルの述語。 |
| `chunks[has_code]` | `BOOL` | ブール フィルタリング。 |

<Admonition type="info" icon="📘" title="Notes">

ベクトル フィールドまたはベクトル サブフィールドでは、受け入れられるインデックスは 1 つだけです。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトル サブフィールドを作成し、それぞれに個別にインデックスを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用にインデックス化され、`chunks[emb]` は要素レベル検索用にインデックス化されています。

</Admonition>

## インデックスを選択する\{#choose-indexes}

検索モードを使用して、ベクトル メトリクス ファミリーを選択します。

| 検索またはフィルタの目的 | 対象パス | 選択するもの |
| --- | --- | --- |
| EmbeddingList 検索 | `chunks[emb_list_vector]` | `MAX_SIM*` メトリクス ファミリー。 |
| 要素レベルのベクトル検索 | `chunks[emb]` | `COSINE`、`IP`、`L2` などの通常のベクトル メトリクス ファミリー。 |
| 文字列またはカテゴリでフィルタリング | `chunks[section]` | 対象でサポートされているスカラー インデックス。 |
| 数値範囲でフィルタリング | `chunks[quality_score]`, `chunks[page]` | 対象でサポートされているスカラー インデックス。 |
| ブール値でフィルタリング | `chunks[has_code]` | 対象でサポートされているスカラー インデックス。 |

EmbeddingList 検索では、StructArray ベクトル サブフィールド内のベクトルを埋め込みリストとして扱い、エンティティ レベルの結果を返します。要素レベル検索では、各 Struct 要素を独立して検索し、一致した要素のオフセットを返すことができます。

## ベクトル インデックスを作成する\{#create-vector-indexes}

次の例では 2 つのベクトル インデックスを作成します。最初のインデックスは EmbeddingList 検索のために `MAX_SIM*` メトリクスを使用します。2 つ目のインデックスは要素レベル検索のために通常のベクトル メトリクスを使用します。

StructArray ベクトル サブフィールドには `AUTOINDEX` を使用します。

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

<Admonition type="warning" icon="🚧" title="Warning">

同じベクトル サブフィールドに `MAX_SIM*` インデックスと通常のベクトル メトリクス インデックスを作成しないでください。両方の検索モードが必要な場合は、2 つの別々のベクトル サブフィールドにベクトルを書き込み、各サブフィールドに 1 つずつインデックスを作成してください。

</Admonition>

## スカラー インデックスを作成する\{#create-scalar-indexes}

フィルタで使用する場合は、StructArray スカラー サブフィールドにスカラー インデックスを作成します。同じ `structArray[subfield]` パス構文を使用します。適用可能なインデックス タイプは `INVERTED`、`BITMAP`、`STL_SORT` です。

StructArray スカラー サブフィールドには `AUTOINDEX` を使用します。

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

スカラー インデックスは必須ではありませんが、`element_filter(chunks, $[quality_score] > 0.9)` や `MATCH_ANY(chunks, $[section] == "index")` のように、StructArray スカラー サブフィールドがフィルタで頻繁に使われる場合に有用です。

## 適用可能なメトリクス タイプ\{#applicable-metric-types}

次の表を使用して、StructArray フィールドに適用可能なメトリクス タイプを確認してください。

| Metric Type | 説明 |
| --- | --- |
| `MAX_SIM_COSINE` (`MAX_SIM`) | 2 つのベクトル間の類似度を Cosine に基づいて測定し、その後、2 つのベクトル リスト間の類似度を MaxSim を使用して計算します。 |
| `MAX_SIM_L2` | 2 つのベクトル間の類似度を L2 に基づいて測定し、その後、2 つのベクトル リスト間の類似度を MaxSim を使用して計算します。 |
| `MAX_SIM_IP` | 2 つのベクトル間の類似度を IP に基づいて測定し、その後、2 つのベクトル リスト間の類似度を MaxSim を使用して計算します。 |
| `MAX_SIM_HAMMING` | 2 つのベクトル間の類似度を Hamming に基づいて測定し、その後、2 つのベクトル リスト間の類似度を MaxSim を使用して計算します。 |
| `MAX_SIM_JACCARD` | 2 つのベクトル間の類似度を Jaccard に基づいて測定し、その後、2 つのベクトル リスト間の類似度を MaxSim を使用して計算します。 |

以下の式は、クエリ埋め込みリストと StructArray フィールド内のベクトル サブフィールドとの距離を計算する際に適用されます。

$$
Distance(\{q\}, \{v\})=\Sigma_\{i=1\}^\{n\}(Max_\{j=1\}^\{m\}Distance(q_i,v_j))
$$

上記の式では、$q$ は $n$ 要素の埋め込みリストを指し、$v$ は $m$ 要素を含む StrctArray サブフィールドを指します。

## インデックスとメトリクスの互換性\{#index-metric-compatibility}

次の表を使用して、StructArray ベクトル サブフィールドに対するインデックス タイプとメトリクス タイプを選択します。まず対象から始めて、次に検索モードに応じてメトリクス ファミリーを選択します。

StructArray ベクトル サブフィールドには `AUTOINDEX` を使用します。検索モードで必要なメトリクス ファミリーからメトリクス タイプを選択してください。

| 検索モード | ベクトル サブフィールドのデータ型 | インデックス タイプ | メトリクス タイプ |
| --- | --- | --- | --- |
| EmbeddingList 検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| EmbeddingList 検索 | `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |
| 要素レベル検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `L2`, `IP`, `COSINE` |
| 要素レベル検索 | `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`, `JACCARD` |

バージョン固有のサポートやその他の制限については、[StructArray Limits](./struct-array-limits) を参照してください。

## インデックスを確認する\{#verify-indexes}

インデックスを作成した後、collection を describe するか、インデックスを一覧表示して、期待するサブフィールド パスがインデックス化されていることを確認します。

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
| サブフィールドのインデックスにはパス構文を使用する。 | `emb` や `chunks.emb` ではなく、`chunks[emb]` にインデックスを作成します。 |
| 1 つのベクトル サブフィールドが受け入れられるインデックスは 1 つ。 | 異なるメトリクス ファミリーが必要な場合は、別々のベクトル サブフィールドを使用します。 |
| EmbeddingList 検索には `MAX_SIM*` メトリクスを使用する。 | EmbeddingList クエリ データには、`MAX_SIM*` メトリクスで構築されたインデックスが必要です。 |
| 要素レベル検索には通常のベクトル メトリクスを使用する。 | 要素レベル検索では、通常のベクトル クエリ データと `COSINE`、`IP`、`L2` などのメトリクスを使用します。 |
| フィルタに現れるスカラー サブフィールドにインデックスを作成する。 | 対象でサポートされているスカラー インデックス タイプを使用します。 |
| ベクトル フィールドの制限を意識する。 | ベクトル フィールドとベクトル サブフィールドの総数には制限があります。多数のベクトル サブフィールドを追加する前に StructArray Limits を参照してください。 |

## よくある間違い\{#common-mistakes}

- `chunks[emb]` ではなく `chunks.emb` にインデックスを作成する。

- `MAX_SIM*` インデックスだけを作成し、その後で同じサブフィールドに対して要素レベル検索を実行しようとする。

- 通常のベクトル インデックスだけを作成し、その後で同じサブフィールドに対して EmbeddingList 検索を実行しようとする。

- 1 つのベクトル サブフィールドを `MAX_SIM*` と通常のベクトル メトリクスの両方に再利用する。

- 多用される StructArray フィルタのためのスカラー インデックスを忘れる。

- Struct スキーマに存在しない StructArray サブフィールドにインデックスを作成する。

## 次のステップ\{#next-steps}

1. エンティティ レベルの EmbeddingList 検索または要素レベルのベクトル検索を実行するには、[StructArray を使った基本ベクトル検索](./search-with-struct-array) を参照してください。

1. 検索中に StructArray スカラー サブフィールドでフィルタリングするには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. インデックスとメトリクスの制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。


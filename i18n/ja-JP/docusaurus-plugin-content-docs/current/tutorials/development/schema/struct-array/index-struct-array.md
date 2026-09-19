---
title: "StructArray フィールドにインデックスを作成する | Cloud"
slug: /index-struct-array
sidebar_label: "StructArray フィールドにインデックスを作成する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル検索を実行する前、またはスカラーフィルタリングを高速化する前に、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドでは、インデックスの対象は `chunks[emblistvector]`、`chunks[emb]`、`chunks[section]` などのサブフィールドパスです。 | Cloud"
type: origin
token: VvkEwug9ciPZYVk6hM1chLydnib
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドにインデックスを作成する

ベクトル検索を実行する前、またはスカラーフィルタリングを高速化する前に、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドでは、インデックスの対象は `chunks[emb_list_vector]`、`chunks[emb]`、`chunks[section]` などのサブフィールドパスです。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。`chunks` StructArray フィールドには、フィルタリング用のスカラーサブフィールドと検索用のベクトルサブフィールドが含まれています。

## 事前準備\{#before-you-begin}

コレクションスキーマにすでに `chunks` StructArray フィールドが含まれており、データが挿入済みであることを確認してください。

| サブフィールドパス | 型 | インデックスの目的 |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスを使用した EmbeddingList 検索。 |
| `chunks[emb]` | `FLOAT_VECTOR` | 通常のベクトルメトリクスを使用した要素レベル検索。 |
| `chunks[section]` | `VARCHAR` | カテゴリによるフィルタリング。 |
| `chunks[quality_score]` | `FLOAT` | 数値フィルタリングと範囲スタイルの述語。 |
| `chunks[has_code]` | `BOOL` | ブールフィルタリング。 |

<Admonition type="info" title="Notes">

ベクトルフィールドまたはベクトルサブフィールドが受け付けるインデックスは 1 つだけです。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成し、それぞれに個別にインデックスを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用にインデックス化され、`chunks[emb]` は要素レベル検索用にインデックス化されています。

</Admonition>

## インデックスを選択する\{#choose-indexes}

検索モードを使用して、ベクトルメトリクスファミリーを選択します。

| 検索またはフィルタの目的 | 対象パス | 選択する内容 |
| --- | --- | --- |
| EmbeddingList 検索 | `chunks[emb_list_vector]` | `MAX_SIM*` メトリクスファミリー。 |
| 要素レベルのベクトル検索 | `chunks[emb]` | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスファミリー。 |
| 文字列またはカテゴリによるフィルタ | `chunks[section]` | ターゲットでサポートされているスカラーインデックス。 |
| 数値範囲によるフィルタ | `chunks[quality_score]`, `chunks[page]` | ターゲットでサポートされているスカラーインデックス。 |
| ブール値によるフィルタ | `chunks[has_code]` | ターゲットでサポートされているスカラーインデックス。 |

EmbeddingList 検索では、StructArray のベクトルサブフィールド内のベクトルを embedding list として扱い、エンティティレベルの結果を返します。要素レベル検索では、各 Struct 要素を個別に検索し、一致した要素のオフセットを返すことができます。

## ベクトルインデックスを作成する\{#create-vector-indexes}

次の例では、2 つのベクトルインデックスを作成します。1 つ目のインデックスは、EmbeddingList 検索用に `MAX_SIM*` メトリクスを使用します。2 つ目のインデックスは、要素レベル検索用に通常のベクトルメトリクスを使用します。

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

同じベクトルサブフィールドに `MAX_SIM*` インデックスと通常のベクトルメトリクスのインデックスを作成しないでください。両方の検索モードが必要な場合は、2 つの別々のベクトルサブフィールドにベクトルを書き込み、各サブフィールドに 1 つずつインデックスを作成します。

</Admonition>

## スカラーインデックスを作成する\{#create-scalar-indexes}

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

スカラーインデックスは省略可能ですが、`element_filter(chunks, $[quality_score] > 0.9)` や `MATCH_ANY(chunks, $[section] == "index")` のように、StructArray のスカラーサブフィールドがフィルタに頻繁に現れる場合に役立ちます。

## 適用可能なメトリクスタイプ\{#applicable-metric-types}

次の表を使用して、StructArray フィールドに適用可能なメトリクスタイプを理解してください。

| メトリクスタイプ | 説明 |
| --- | --- |
| `MAX_SIM_COSINE` (`MAX_SIM`) | Cosine に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_L2` | L2 に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_IP` | IP に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_HAMMING` | Hamming に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_JACCARD` | Jaccard に基づいて 2 つのベクトル間の類似度を測定し、その後 MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |

クエリの embedding list と StructArray フィールド内のベクトルサブフィールドとの間の距離を計算する場合、次の式が適用されます。

$$
Distance({q}, {v})=\Sigma_{i=1}^{n}(Max_{j=1}^{m}Distance(q_i,v_j))
$$

上記の式では、$q$ は $n$ 個の要素からなる embedding list を指し、$v$ は $m$ 個の要素を含む StrctArray サブフィールドを指します。

## インデックスとメトリクスの互換性\{#index-metric-compatibility}

次の表を使用して、StructArray のベクトルサブフィールドに使用するインデックスタイプとメトリクスタイプを選択します。まずターゲットから始め、次に検索モードに応じてメトリクスファミリーを選択します。

StructArray のベクトルサブフィールドには `AUTOINDEX` を使用します。検索モードで必要なメトリクスファミリーからメトリクスタイプを選択します。

| 検索モード | ベクトルサブフィールドのデータ型 | インデックスタイプ | メトリクスタイプ |
| --- | --- | --- | --- |
| EmbeddingList 検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| EmbeddingList 検索 | `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |
| 要素レベル検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `L2`, `IP`, `COSINE` |
| 要素レベル検索 | `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`, `JACCARD` |

バージョン固有のサポートやその他の制限については、[StructArray の制限](./struct-array-limits) を参照してください。

## インデックスを確認する\{#verify-indexes}

インデックスを作成した後、コレクションを describe するかインデックスを一覧表示して、想定したサブフィールドパスにインデックスが作成されていることを確認します。

```python
indexes = client.list_indexes(
    collection_name="tech_articles",
)

print(indexes)
```

SDK のバージョンでインデックス記述 API が提供されている場合は、特定のインデックスを describe することもできます。

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
| サブフィールドのインデックスにはパス構文を使用します。 | `emb` や `chunks.emb` ではなく `chunks[emb]` にインデックスを作成します。 |
| 1 つのベクトルサブフィールドが受け付けるインデックスは 1 つです。 | 異なるメトリクスファミリーが必要な場合は、別々のベクトルサブフィールドを使用します。 |
| EmbeddingList 検索には `MAX_SIM*` メトリクスを使用します。 | EmbeddingList のクエリデータには、`MAX_SIM*` メトリクスで構築されたインデックスが必要です。 |
| 要素レベル検索には通常のベクトルメトリクスを使用します。 | 要素レベル検索では、通常のベクトルクエリデータと、`COSINE`、`IP`、`L2` などのメトリクスを使用します。 |
| フィルタに現れるスカラーサブフィールドにインデックスを作成します。 | ターゲットでサポートされているスカラーインデックスタイプを使用します。 |
| ベクトルフィールドの制限に注意してください。 | ベクトルフィールドとベクトルサブフィールドの合計数には制限があります。多数のベクトルサブフィールドを追加する前に StructArray の制限を確認してください。 |

## よくある間違い\{#common-mistakes}

- `chunks[emb]` ではなく `chunks.emb` にインデックスを作成する。

- `MAX_SIM*` インデックスだけを作成して、同じサブフィールドで要素レベル検索を実行しようとする。

- 通常のベクトルインデックスだけを作成して、同じサブフィールドで EmbeddingList 検索を実行しようとする。

- 1 つのベクトルサブフィールドを `MAX_SIM*` と通常のベクトルメトリクスの両方に再利用する。

- 頻繁に使用される StructArray フィルタ用のスカラーインデックスを忘れる。

- Struct スキーマに存在しない StructArray サブフィールドにインデックスを作成する。

## 次のステップ\{#next-steps}

1. エンティティレベルの EmbeddingList 検索または要素レベルのベクトル検索を実行するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. 検索中に StructArray のスカラーサブフィールドをフィルタリングするには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. インデックスとメトリクスの制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

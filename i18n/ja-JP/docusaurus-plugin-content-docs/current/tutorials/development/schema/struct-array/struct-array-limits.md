---
title: "StructArray の制限 | Cloud"
slug: /struct-array-limits
sidebar_label: "StructArray の制限"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポート範囲は、schema 定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルターにまたがります。本番環境で StructArray の動作に依存する前に、このページを制限事項のリファレンスとして使用してください。 | Cloud"
type: origin
token: Q7wIwcnrEiVDofk5G4Fc7vlonPh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray の制限

StructArray のサポート範囲は、schema 定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルターにまたがります。本番環境で StructArray の動作に依存する前に、このページを制限事項のリファレンスとして使用してください。

StructArray の制限の多くは、次の 3 つのいずれかに由来します。StructArray の schema モデル、vector subfield に対して選択する検索モード、そして collection が動作している Zilliz Cloud のバージョンです。

## 制限の概要\{#limits-at-a-glance}

| 領域 | 制限 |
| --- | --- |
| Schema の形状 | Struct は Array field の要素型としてのみ使用できます。Struct は collection のトップレベル field としてはサポートされていません。 |
| Subfield schema | 同じ StructArray field 内のすべての Struct 要素は、事前定義された 1 つの Struct schema を共有します。 |
| 容量 | `max_capacity` は必須であり、1 つの entity が StructArray field に格納できる Struct 要素数を制限します。 |
| Subfield の変更 | StructArray field を作成した後、その既存の StructArray field に subfield を追加することはできません。 |
| Subfield パス | インデックス、検索対象、出力 field、フィルターには、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| 挿入の形状 | StructArray field はオブジェクトの配列として挿入します。挿入ペイロード内ではパス構文を使用しないでください。 |
| Vector index | vector field または vector subfield は 1 つの index しか受け付けません。EmbeddingList 検索と要素レベル検索には別々の vector subfield を使用してください。 |
| Functions | field functions は StructArray field 内の field または subfield ではサポートされていません。 |
| Nullable field | Nullable な StructArray field はバージョン制限があります。サポートされている場合、null は StructArray field 全体に適用され、個々の Struct 要素に独立して適用されるわけではありません。 |
| Dynamic add field | 既存の collection に StructArray field を追加する機能はバージョン制限があり、追加する field は nullable である必要があります。 |

## Schema の制限\{#schema-limits}

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベルの field type ではありません。 | StructArray field は `datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して作成してください。 |
| すべての要素は 1 つの schema を共有します。 | StructArray field 内のすべての Struct 要素は、同じ subfield リストと subfield data type に従います。 |
| `max_capacity` は必須です。 | 1 つの entity 内の Struct 要素数は、StructArray field に設定された `max_capacity` を超えてはなりません。 |
| 既存の subfield は固定です。 | 既存の StructArray field に新しい subfield を追加することはできません。subfield schema を変更するには、StructArray field を削除してから、更新した schema でもう一度追加してください。 |
| ネストされた StructArray はサポートされていません。 | StructArray field には、ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` subfield を含めることはできません。 |
| Functions は StructArray 内ではサポートされていません。 | StructArray field またはその subfield に対して field functions を定義しないでください。 |

schema 作成の例については、[Create a StructArray Field](./create-struct-array) を参照してください。

## サポートされる subfield data type\{#supported-subfield-data-types}

StructArray の subfield は物理的な配列形式のストレージにマッピングされます。次の表は、サポートされる物理 type とサポートされない物理 type を示しています。

| Struct subfield の物理 type | サポート | 注記 |
| --- | --- | --- |
| `Array<Bool>` | サポート | subfield は `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポート | subfield は `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポート | subfield は `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポート | subfield は `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポート | subfield は `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポート | subfield は `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポート | subfield は `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポート | subfield は `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポート | subfield は `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | サポートされていません | Sparse vector subfield は StructArray field ではサポートされていません。 |
| `Array<String>` | サポートされていません | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | サポートされていません | JSON subfield は StructArray field ではサポートされていません。 |
| `Array<Geometry>` | サポートされていません | Geometry subfield および GIS functions は StructArray field ではサポートされていません。 |
| `Array<Text>` | サポートされていません | Text subfield は StructArray field ではサポートされていません。 |
| `Array<Timestamptz>` | サポートされていません | Timestamptz subfield および時間固有の式は StructArray field ではサポートされていません。 |
| ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | サポートされていません | StructArray field は、ネストされた array、vector-array、Struct、または Array-of-Struct subfield をサポートしません。 |

## Nullable と動的 schema の制限\{#nullable-and-dynamic-schema-limits}

Nullable な StructArray の動作と、StructArray field の動的追加はバージョン制限があります。

| 機能 | 制限 |
| --- | --- |
| Nullable な StructArray field | Nullable な StructArray と nullable な vector-array のサポートを含むバージョンでのみサポートされます。 |
| Python での null 値 | Python で null の StructArray 値を挿入するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| Null の適用範囲 | Null は StructArray field 全体に適用されます。たとえば、`chunks=None` は `chunks` が nullable の場合にのみ有効です。 |
| 部分的に null な StructArray 値 | StructArray field に有効な配列値が含まれる場合、同じ値の中で null の subfield 配列と有効な subfield 配列を混在させないでください。 |
| 動的に StructArray field を追加 | 既存の collection への StructArray field の追加は、動的 StructArray field サポートを含むバージョンでのみサポートされます。 |
| 動的追加における nullable 要件 | 既存の collection に追加される StructArray field は、既存の entity が新しい field に対する値を持たないため、nullable である必要があります。 |
| 動的追加後の既存 entity | 既存の entity は、追加された StructArray field に対して、その subfield 全体で `null` を返します。 |

Milvus v3.0.x と互換性のある cluster では、nullable な StructArray field、nullable な vector arrays、および動的な StructArray field 追加が利用可能です。

nullable な StructArray field を含む挿入例については、[Insert Data into StructArray Fields](./insert-struct-array) を参照してください。

## 挿入の制限\{#insert-limits}

| 制限 | 詳細 |
| --- | --- |
| ペイロードの形状 | StructArray field は、`chunks: [{"text": "...", "emb": [...]}]` のように Struct オブジェクトの配列として挿入します。 |
| Subfield 名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のような subfield 名を使用します。 |
| Schema 整合性 | 各 Struct 要素は Struct schema に一致している必要があります。 |
| 容量 | 1 つの entity 内の Struct 要素数は `max_capacity` を超えてはなりません。 |
| Vector 次元 | vector 値は、それぞれの vector subfield に設定された `dim` に一致している必要があります。 |
| 検索モードの重複 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々の vector subfield に vector を書き込んでください。 |

## Index と metric の制限\{#index-and-metric-limits}

StructArray の vector subfield は、EmbeddingList 検索または要素レベル検索のいずれかのために index 化できます。同じ vector subfield は両方の metric ファミリーを使用できません。これは、各 vector field または vector subfield が 1 つの index しか受け付けないためです。

| 検索モード | Metric ファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList 検索 | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2`、またはバイナリ `MAX_SIM_*` metrics | entity レベルの結果。 |
| 要素レベル検索 | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常の vector metrics | 一致した要素の offset を含められる要素レベルの結果。 |

両方のモードが必要な場合は、別々の vector subfield を使用してください。たとえば、EmbeddingList 検索には `chunks[emb_list_vector]` を、要素レベル検索には `chunks[emb]` を使用します。

StructArray の vector subfield は、collection schema を設計する際には vector subfield としてカウントされます。vector fields と vector subfields の総数は、対象バージョンとサービス tier の制限内に収めてください。

サポートされる index-type と metric-type の対応表については、[Index StructArray Fields](./index-struct-array) を参照してください。

## 検索の制限\{#search-limits}

| 検索動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList 検索 | `MAX_SIM*` metrics で index 化された StructArray vector subfield でサポートされます。entity レベルの結果を返します。 |
| 基本的な要素レベル検索 | 通常の vector metrics で index 化された StructArray vector subfield でサポートされます。一致した要素の offset を返すことができます。 |
| Range search | 対象バージョンの検索モードおよび index/metric サポートに応じてサポートされます。要素レベルの StructArray リクエストにおける hybrid search の range 動作については、対象バージョンを確認してください。 |
| Grouping search | 要素レベルの grouping search は offset を返すことができます。要素レベルの StructArray リクエストにおける hybrid search の group-by 動作はバージョン制限があります。 |
| Hybrid search | hybrid search リクエストには、対象バージョンがその検索組み合わせをサポートしている場合にのみ StructArray vector subfield リクエストを含めることができます。各リクエストは、引き続き index 化された vector subfield の metric ファミリーに従います。 |
| Offset 出力 | offset は要素レベル検索結果で利用できます。EmbeddingList 検索は entity レベルの結果を返し、主要な結果単位として要素 offset は使用しません。 |

## フィルターと演算子の制限\{#filter-and-operator-limits}

StructArray の scalar フィルタリングは、`element_filter` や `MATCH_*` ファミリーのような StructArray operators によって処理されます。詳細な predicate サポートマトリクスは [StructArray Operators](./struct-array-filtering) にあります。

高レベルでは次のとおりです。

- `$[subfield]` は StructArray operators の内部でのみ使用してください。

- scalar predicates には scalar subfield を使用してください。

- `$[...]` scalar predicate の入力として vector subfield を使用しないでください。

- JSON path 構文、JSON functions、array container functions、text match functions、Geometry / GIS functions、および Timestamptz 式は、StructArray の要素レベル predicate ではサポートされていません。

- 裸の boolean 式ではなく、`$[has_code] == true` のような明示的な boolean 比較を優先してください。

## 関連ページ\{#related-pages}

1. StructArray field を作成するには、[Create a StructArray Field](./create-struct-array) を参照してください。

1. データを挿入するには、[Insert Data into StructArray Fields](./insert-struct-array) を参照してください。

1. vector index と scalar index を作成するには、[Index StructArray Fields](./index-struct-array) を参照してください。

1. StructArray のフィルター構文を確認するには、[StructArray Operators](./struct-array-filtering) を参照してください。


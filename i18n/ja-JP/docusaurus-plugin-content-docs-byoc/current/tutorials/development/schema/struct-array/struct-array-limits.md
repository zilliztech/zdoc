---
title: "StructArray の制限 | BYOC"
slug: /struct-array-limits
sidebar_label: "StructArray の制限"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポートは、schema 定義、insert ペイロード、index、search モード、および StructArray 固有のフィルターにまたがります。本番環境で StructArray の動作を利用する前に、このページを制限事項のリファレンスとして使用してください。 | BYOC"
type: origin
token: Q7wIwcnrEiVDofk5G4Fc7vlonPh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray の制限

StructArray のサポートは、schema 定義、insert ペイロード、index、search モード、および StructArray 固有のフィルターにまたがります。本番環境で StructArray の動作を利用する前に、このページを制限事項のリファレンスとして使用してください。

StructArray の制限の多くは、次の 3 つのいずれかに由来します。StructArray の schema モデル、vector subfield に対して選択する search モード、そして collection が実行されている Zilliz Cloud のバージョンです。

## 制限の概要\{#limits-at-a-glance}

| 領域 | 制限 |
| --- | --- |
| Schema の形状 | Struct は Array field の element type としてのみ使用できます。Struct は collection のトップレベル field としてはサポートされません。 |
| Subfield schema | 同じ StructArray field 内のすべての Struct 要素は、1 つの事前定義された Struct schema を共有します。 |
| 容量 | `max_capacity` は必須であり、1 つの entity が StructArray field に保存できる Struct 要素数を制限します。 |
| Subfield の変更 | StructArray field を作成した後、その既存の StructArray field に subfield を追加することはできません。 |
| Subfield パス | index、search ターゲット、output field、filter には、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| Insert の形状 | StructArray field はオブジェクトの配列として insert します。insert ペイロード内では path 構文を使用しないでください。 |
| Vector index | vector field または vector subfield は 1 つの index しか受け付けません。EmbeddingList search と element-level search では、別々の vector subfield を使用してください。 |
| Functions | field functions は、StructArray field 内の field または subfield ではサポートされません。 |
| Nullable fields | nullable StructArray field はバージョン制限があります。サポートされる場合、null は個々の Struct 要素に独立して適用されるのではなく、StructArray field 全体に適用されます。 |
| Dynamic add field | 既存の collection への StructArray field の追加はバージョン制限があり、追加される field は nullable である必要があります。 |

## Schema の制限\{#schema-limits}

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベル field type ではありません。 | StructArray field は、`datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して作成してください。 |
| すべての要素は 1 つの schema を共有します。 | StructArray field 内のすべての Struct 要素は、同じ subfield リストと subfield data type に従います。 |
| `max_capacity` は必須です。 | 1 つの entity 内の Struct 要素数は、StructArray field に設定された `max_capacity` を超えてはなりません。 |
| 既存の subfield は固定です。 | 既存の StructArray field に新しい subfield を追加することはできません。subfield schema を変更するには、StructArray field を削除し、更新した schema で再度追加してください。 |
| ネストされた StructArray はサポートされません。 | StructArray field に、ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` subfield を含めることはできません。 |
| StructArray 内では functions はサポートされません。 | StructArray field またはその subfield に対して field functions を定義しないでください。 |

schema 作成の例については、[StructArray Field を作成する](./create-struct-array) を参照してください。

## サポートされる subfield data types\{#supported-subfield-data-types}

StructArray subfield は物理的な配列スタイルのストレージにマッピングされます。次の表に、サポートされる物理 type とサポートされない物理 type を示します。

| Struct subfield physical type | サポート | 注記 |
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
| `ArrayOfVector<SparseFloatVector>` | サポートされません | Sparse vector subfield は StructArray field ではサポートされません。 |
| `Array<String>` | サポートされません | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | サポートされません | JSON subfield は StructArray field ではサポートされません。 |
| `Array<Geometry>` | サポートされません | Geometry subfield と GIS functions は StructArray field ではサポートされません。 |
| `Array<Text>` | サポートされません | Text subfield は StructArray field ではサポートされません。 |
| `Array<Timestamptz>` | サポートされません | Timestamptz subfield と time-specific expressions は StructArray field ではサポートされません。 |
| ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | サポートされません | StructArray field は、ネストされた array、vector-array、Struct、または Array-of-Struct subfield をサポートしません。 |

## Nullable および動的 schema の制限\{#nullable-and-dynamic-schema-limits}

nullable StructArray の動作と動的な StructArray field 追加にはバージョン制限があります。

| 機能 | 制限 |
| --- | --- |
| Nullable StructArray field | nullable StructArray と nullable vector-array のサポートを含むバージョンでのみサポートされます。 |
| Python での null 値 | Python で null の StructArray 値を insert するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| Null の適用範囲 | null は StructArray field 全体に適用されます。たとえば、`chunks=None` は `chunks` が nullable の場合にのみ有効です。 |
| 部分的に null の StructArray 値 | StructArray field に有効な配列値が含まれている場合、同じ値の中で null の subfield 配列と有効な subfield 配列を混在させないでください。 |
| Dynamic add StructArray field | 既存の collection への StructArray field の追加は、dynamic StructArray field サポートを含むバージョンでのみサポートされます。 |
| Dynamic add における nullable 要件 | 既存の entity には新しい field の値がないため、既存の collection に追加する StructArray field は nullable である必要があります。 |
| Dynamic add 後の既存 entity | 既存の entity は、追加された StructArray field について、その subfield 全体にわたり `null` を返します。 |

Milvus v3.0.x と互換性のある cluster では、nullable StructArray field、nullable vector arrays、および動的な StructArray field 追加が利用できます。

nullable StructArray field を使用した insert 例については、[StructArray Fields にデータを挿入する](./insert-struct-array) を参照してください。

## Insert の制限\{#insert-limits}

| 制限 | 詳細 |
| --- | --- |
| ペイロードの形状 | StructArray field は、`chunks: [{"text": "...", "emb": [...]}]` のように Struct オブジェクトの配列として insert します。 |
| Subfield 名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のような subfield 名を使用してください。 |
| Schema の整合性 | 各 Struct 要素は Struct schema に一致している必要があります。 |
| 容量 | 1 つの entity 内の Struct 要素数は `max_capacity` を超えてはなりません。 |
| Vector 次元 | vector 値は、それぞれの vector subfield に設定された `dim` に一致している必要があります。 |
| Search モードの重複 | EmbeddingList search と element-level search の両方が必要な場合は、2 つの別々の vector subfield に vector を書き込んでください。 |

## Index と metric の制限\{#index-and-metric-limits}

StructArray の vector subfield は、EmbeddingList search または element-level search のいずれかのために index を作成できます。同じ vector subfield で両方の metric ファミリーを使用することはできません。これは、各 vector field または vector subfield が受け付ける index は 1 つだけだからです。

| Search モード | Metric ファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList search | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2`, または binary `MAX_SIM_*` metrics | entity-level の結果。 |
| Element-level search | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常の vector metrics | 一致した要素の offset を含められる element-level の結果。 |

両方のモードが必要な場合は、別々の vector subfield を使用してください。たとえば、EmbeddingList search には `chunks[emb_list_vector]` を使用し、element-level search には `chunks[emb]` を使用します。

StructArray の vector subfield は、collection schema を計画する際に vector subfield としてカウントされます。vector fields と vector subfields の合計数は、対象バージョンおよび service tier の制限内に収めてください。

サポートされる index-type と metric-type の対応表については、[StructArray Fields に index を作成する](./index-struct-array) を参照してください。

## Search の制限\{#search-limits}

| Search の動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList search | `MAX_SIM*` metrics で index された StructArray vector subfield でサポートされます。entity-level の結果を返します。 |
| 基本的な element-level search | 通常の vector metrics で index された StructArray vector subfield でサポートされます。一致した要素の offset を返すことができます。 |
| Range search | 対象バージョンの search モードおよび index/metric サポートに応じてサポートされます。element-level StructArray リクエストにおける hybrid search の range の動作については、対象バージョンを確認してください。 |
| Grouping search | element-level grouping search は offset を返すことができます。element-level StructArray リクエストに対する hybrid search の group-by 動作にはバージョン制限があります。 |
| Hybrid search | hybrid search リクエストには、対象バージョンがその検索の組み合わせをサポートしている場合にのみ、StructArray vector subfield リクエストを含めることができます。各リクエストは引き続き、index 済み vector subfield の metric ファミリーに従います。 |
| Offset 出力 | offset は element-level search の結果で利用できます。EmbeddingList search は entity-level の結果を返し、主要な結果単位として element offset は使用しません。 |

## Filter と operator の制限\{#filter-and-operator-limits}

StructArray の scalar filtering は、`element_filter` や `MATCH_*` ファミリーなどの StructArray operators によって処理されます。詳細な predicate サポート表は [StructArray Operators](./struct-array-filtering) にあります。

高レベルでは、次の点に注意してください。

- `$[subfield]` は StructArray operators の内部でのみ使用してください。

- scalar predicates には scalar subfield を使用してください。

- `$[...]` scalar predicate の入力として vector subfield を使用しないでください。

- JSON path 構文、JSON functions、array container functions、text match functions、Geometry / GIS functions、および Timestamptz expressions は、StructArray の element-level predicates ではサポートされません。

- 単独の boolean 式ではなく、`$[has_code] == true` のような明示的な boolean 比較を優先してください。

## 関連ページ\{#related-pages}

1. StructArray field を作成するには、[StructArray Field を作成する](./create-struct-array) を参照してください。

1. データを insert するには、[StructArray Fields にデータを挿入する](./insert-struct-array) を参照してください。

1. vector および scalar index を作成するには、[StructArray Fields に index を作成する](./index-struct-array) を参照してください。

1. StructArray filter 構文を確認するには、[StructArray Operators](./struct-array-filtering) を参照してください。


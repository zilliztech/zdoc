---
title: "StructArray の制限事項 | Cloud"
slug: /struct-array-limits
sidebar_label: "StructArray の制限事項"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルタにまたがります。本番環境で StructArray の動作を利用する前に、このページを制限事項のリファレンスとして使用してください。 | Cloud"
type: origin
token: Q7wIwcnrEiVDofk5G4Fc7vlonPh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray の制限事項

StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルタにまたがります。本番環境で StructArray の動作を利用する前に、このページを制限事項のリファレンスとして使用してください。

StructArray の制限の大部分は、次の 3 つのいずれかに由来します。StructArray のスキーマモデル、vector サブフィールドに対して選択する検索モード、および collection が稼働している Zilliz Cloud のバージョンです。

## 制限事項の概要\{#limits-at-a-glance}

| 領域 | 制限 |
| --- | --- |
| スキーマ形状 | Struct は Array フィールドの要素型としてのみ使用できます。Struct はトップレベルの collection フィールドとしてはサポートされません。 |
| サブフィールドスキーマ | 同じ StructArray フィールド内のすべての Struct 要素は、事前定義された 1 つの Struct スキーマを共有します。 |
| 容量 | `max_capacity` は必須であり、1 つの entity が StructArray フィールドに格納できる Struct 要素数を制限します。 |
| サブフィールドの変更 | StructArray フィールドを作成した後は、その既存の StructArray フィールドにサブフィールドを追加できません。 |
| サブフィールドパス | インデックス、検索対象、出力フィールド、フィルタには、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| 挿入形状 | StructArray フィールドはオブジェクトの配列として挿入します。挿入ペイロード内ではパス構文を使用しないでください。 |
| vector インデックス | vector フィールドまたは vector サブフィールドは 1 つのインデックスのみを受け入れます。EmbeddingList 検索と要素レベル検索には、別々の vector サブフィールドを使用してください。 |
| 関数 | フィールド関数は、StructArray フィールド内のフィールドまたはサブフィールドではサポートされません。 |
| Nullable フィールド | Nullable な StructArray フィールドはバージョンによって制限されます。サポートされている場合、null は個々の Struct 要素に個別に適用されるのではなく、StructArray フィールド全体に適用されます。 |
| 動的フィールド追加 | 既存の collection に StructArray フィールドを追加することはバージョンによって制限され、追加するフィールドは nullable である必要があります。 |

## スキーマの制限事項\{#schema-limits}

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベルのフィールド型ではありません。 | StructArray フィールドは、`datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して作成します。 |
| すべての要素は 1 つのスキーマを共有します。 | StructArray フィールド内のすべての Struct 要素は、同じサブフィールド一覧とサブフィールドデータ型に従います。 |
| `max_capacity` は必須です。 | 1 つの entity に含まれる Struct 要素数は、StructArray フィールドに設定された `max_capacity` を超えてはなりません。 |
| 既存のサブフィールドは固定です。 | 既存の StructArray フィールドに新しいサブフィールドを追加することはできません。サブフィールドスキーマを変更するには、StructArray フィールドを削除し、更新されたスキーマで再度追加してください。 |
| ネストした StructArray はサポートされません。 | StructArray フィールドには、ネストした `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` サブフィールドを含めることはできません。 |
| 関数は StructArray 内ではサポートされません。 | StructArray フィールドまたはそのサブフィールドに対してフィールド関数を定義しないでください。 |

スキーマ作成の例については、[Create a StructArray Field](./create-struct-array) を参照してください。

## サポートされるサブフィールドデータ型\{#supported-subfield-data-types}

StructArray のサブフィールドは、物理的な配列スタイルのストレージにマッピングされます。次の表は、サポートされる物理型とサポートされない物理型を示します。

| Struct サブフィールド物理型 | サポート | 注記 |
| --- | --- | --- |
| `Array<Bool>` | サポート | サブフィールドは `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポート | サブフィールドは `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポート | サブフィールドは `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポート | サブフィールドは `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポート | サブフィールドは `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポート | サブフィールドは `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポート | サブフィールドは `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポート | サブフィールドは `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポート | サブフィールドは `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | サポートされません | StructArray フィールドでは sparse vector サブフィールドはサポートされません。 |
| `Array<String>` | サポートされません | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | サポートされません | StructArray フィールドでは JSON サブフィールドはサポートされません。 |
| `Array<Geometry>` | サポートされません | StructArray フィールドでは Geometry サブフィールドおよび GIS 関数はサポートされません。 |
| `Array<Text>` | サポートされません | Text サブフィールドは StructArray フィールドではサポートされません。 |
| `Array<Timestamptz>` | サポートされません | Timestamptz サブフィールドおよび時間固有の式は StructArray フィールドではサポートされません。 |
| ネストした `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | サポートされません | StructArray フィールドでは、ネストした array、vector-array、Struct、または Array-of-Struct サブフィールドをサポートしません。 |

## Nullable と動的スキーマの制限事項\{#nullable-and-dynamic-schema-limits}

Nullable な StructArray の動作と、StructArray フィールドの動的追加は、バージョンによって制限されます。

| 機能 | 制限 |
| --- | --- |
| Nullable な StructArray フィールド | nullable StructArray と nullable vector-array のサポートを含むバージョンでのみサポートされます。 |
| Python での null 値 | Python で null の StructArray 値を挿入するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| null の適用範囲 | null は StructArray フィールド全体に適用されます。たとえば、`chunks` が nullable の場合にのみ `chunks=None` は有効です。 |
| 部分的に null な StructArray 値 | StructArray フィールドに有効な配列値が含まれる場合、同じ値の中で null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。 |
| StructArray フィールドの動的追加 | 既存の collection への StructArray フィールドの追加は、動的 StructArray フィールドのサポートを含むバージョンでのみサポートされます。 |
| 動的追加における nullable 要件 | 既存の collection に追加される StructArray フィールドは、既存の entity に新しいフィールドの値がないため、nullable である必要があります。 |
| 動的追加後の既存 entity | 既存の entity は、追加された StructArray フィールドについて、そのサブフィールド全体で `null` を返します。 |

Milvus v3.0.x と互換性のある cluster では、nullable StructArray フィールド、nullable vector arrays、および StructArray フィールドの動的追加を利用できます。

nullable な StructArray フィールドを含む挿入例については、[Insert Data into StructArray Fields](./insert-struct-array) を参照してください。

## 挿入の制限事項\{#insert-limits}

| 制限 | 詳細 |
| --- | --- |
| ペイロード形状 | StructArray フィールドは、`chunks: [{"text": "...", "emb": [...]}]` のように Struct オブジェクトの配列として挿入します。 |
| サブフィールド名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のようなサブフィールド名を使用します。 |
| スキーマ整合性 | 各 Struct 要素は Struct スキーマに一致している必要があります。 |
| 容量 | 1 つの entity に含まれる Struct 要素数は `max_capacity` を超えてはなりません。 |
| vector 次元 | vector 値は、それぞれの vector サブフィールドに設定された `dim` と一致している必要があります。 |
| 検索モードの重複 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々の vector サブフィールドに vector を書き込んでください。 |

## インデックスと metric の制限事項\{#index-and-metric-limits}

StructArray の vector サブフィールドは、EmbeddingList 検索または要素レベル検索のいずれかのためにインデックス化できます。同じ vector サブフィールドで両方の metric ファミリーを使用することはできません。これは、各 vector フィールドまたは vector サブフィールドが受け入れられるインデックスは 1 つだけだからです。

| 検索モード | metric ファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList 検索 | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2`, またはバイナリの `MAX_SIM_*` metric | entity レベルの結果。 |
| 要素レベル検索 | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常の vector metric | 一致した要素オフセットを含む可能性がある要素レベルの結果。 |

両方のモードが必要な場合は、別々の vector サブフィールドを使用してください。たとえば、EmbeddingList 検索には `chunks[emb_list_vector]` を、要素レベル検索には `chunks[emb]` を使用します。

StructArray の vector サブフィールドは、collection スキーマを計画する際に vector サブフィールドとしてカウントされます。vector フィールドと vector サブフィールドの合計数は、対象バージョンおよびサービス階層の制限内に収めてください。

サポートされる index-type と metric-type の対応表については、[Index StructArray Fields](./index-struct-array) を参照してください。

## 検索の制限事項\{#search-limits}

| 検索動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList 検索 | `MAX_SIM*` metric でインデックス化された StructArray の vector サブフィールドでサポートされます。entity レベルの結果を返します。 |
| 基本的な要素レベル検索 | 通常の vector metric でインデックス化された StructArray の vector サブフィールドでサポートされます。一致した要素オフセットを返すことができます。 |
| 範囲検索 | 対象バージョンの検索モードおよび index/metric サポートに応じてサポートされます。要素レベルの StructArray リクエストに対するハイブリッド検索の範囲動作については、対象バージョンを確認してください。 |
| グループ化検索 | 要素レベルのグループ化検索はオフセットを返すことができます。要素レベルの StructArray リクエストに対するハイブリッド検索の group-by 動作はバージョンによって制限されます。 |
| ハイブリッド検索 | ハイブリッド検索リクエストには、対象バージョンがその検索の組み合わせをサポートしている場合に限り、StructArray の vector サブフィールドリクエストを含めることができます。各リクエストは、引き続きインデックス化された vector サブフィールドの metric ファミリーに従います。 |
| オフセット出力 | オフセットは要素レベル検索結果で利用可能です。EmbeddingList 検索は entity レベルの結果を返し、主要な結果単位として要素オフセットを使用しません。 |

## フィルタと演算子の制限事項\{#filter-and-operator-limits}

StructArray の scalar フィルタリングは、`element_filter` や `MATCH_*` ファミリーなどの StructArray 演算子によって処理されます。詳細な述語サポートの対応表は、[StructArray Operators](./struct-array-filtering) にあります。

大まかには次のとおりです。

- `$[subfield]` は StructArray 演算子内でのみ使用してください。

- scalar 述語には scalar サブフィールドを使用してください。

- `$[...]` の scalar 述語入力として vector サブフィールドを使用しないでください。

- JSON パス構文、JSON 関数、配列コンテナ関数、text match 関数、Geometry / GIS 関数、および Timestamptz 式は、StructArray の要素レベル述語ではサポートされません。

- 裸の真偽値式ではなく、`$[has_code] == true` のような明示的な boolean 比較を推奨します。

## 関連ページ\{#related-pages}

1. StructArray フィールドを作成するには、[Create a StructArray Field](./create-struct-array) を参照してください。

1. データを挿入するには、[Insert Data into StructArray Fields](./insert-struct-array) を参照してください。

1. vector および scalar インデックスを作成するには、[Index StructArray Fields](./index-struct-array) を参照してください。

1. StructArray フィルタ構文を確認するには、[StructArray Operators](./struct-array-filtering) を参照してください。


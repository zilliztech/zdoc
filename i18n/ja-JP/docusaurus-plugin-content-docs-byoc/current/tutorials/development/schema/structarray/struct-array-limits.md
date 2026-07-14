---
title: "StructArray の制限 | BYOC"
slug: /struct-array-limits
sidebar_label: "StructArray の制限"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルタリングにまたがります。本番環境で StructArray の動作を利用する前に、このページを制限事項のリファレンスとして使用してください。 | BYOC"
type: origin
token: Q7wIwcnrEiVDofk5G4Fc7vlonPh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray の制限

StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルタリングにまたがります。本番環境で StructArray の動作を利用する前に、このページを制限事項のリファレンスとして使用してください。

StructArray の制限のほとんどは、次の 3 つのいずれかに由来します。StructArray のスキーマモデル、vector サブフィールドに対して選択する検索モード、そして collection が実行されている Zilliz Cloud のバージョンです。

## 制限事項の一覧\{#limits-at-a-glance}

| 項目 | 制限 |
| --- | --- |
| スキーマ形状 | Struct は Array フィールドの要素型としてのみ使用できます。Struct は collection のトップレベルフィールドとしてはサポートされていません。 |
| サブフィールドスキーマ | 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義された Struct スキーマを共有します。 |
| 容量 | `max_capacity` は必須であり、1 つのエンティティが StructArray フィールドに格納できる Struct 要素の数を制限します。 |
| サブフィールドの変更 | StructArray フィールドを作成した後、その既存の StructArray フィールドにサブフィールドを追加することはできません。 |
| サブフィールドパス | インデックス、検索対象、出力フィールド、フィルタには、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| 挿入形状 | StructArray フィールドはオブジェクトの配列として挿入します。挿入ペイロード内でパス構文は使用しないでください。 |
| vector index | vector フィールドまたは vector サブフィールドは 1 つの index しか受け付けません。EmbeddingList 検索と要素レベル検索には、別々の vector サブフィールドを使用してください。 |
| 関数 | フィールド関数は、StructArray フィールド内のフィールドまたはサブフィールドではサポートされていません。 |
| Nullable フィールド | Nullable な StructArray フィールドはバージョン制限があります。サポートされている場合、null は個々の Struct 要素に個別に適用されるのではなく、StructArray フィールド全体に適用されます。 |
| 動的フィールド追加 | 既存の collection に StructArray フィールドを追加する機能はバージョン制限があり、追加されるフィールドは nullable である必要があります。 |

## スキーマの制限\{#schema-limits}

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベルのフィールド型ではありません。 | `datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して StructArray フィールドを作成してください。 |
| すべての要素は 1 つのスキーマを共有します。 | StructArray フィールド内のすべての Struct 要素は、同じサブフィールドリストとサブフィールドデータ型に従います。 |
| `max_capacity` は必須です。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドに設定された `max_capacity` を超えてはなりません。 |
| 既存のサブフィールドは固定です。 | 既存の StructArray フィールドに新しいサブフィールドを追加することはできません。サブフィールドスキーマを変更するには、StructArray フィールドを削除し、更新したスキーマで再度追加してください。 |
| ネストされた StructArray はサポートされていません。 | StructArray フィールドには、ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` サブフィールドを含めることはできません。 |
| 関数は StructArray 内ではサポートされていません。 | StructArray フィールドまたはそのサブフィールドに対してフィールド関数を定義しないでください。 |

スキーマ作成の例については、[StructArray フィールドの作成](./create-struct-array)を参照してください。

## サポートされるサブフィールドのデータ型\{#supported-subfield-data-types}

StructArray のサブフィールドは、物理的な配列スタイルのストレージにマッピングされます。次の表は、サポートされる物理型とサポートされない物理型を示しています。

| Struct サブフィールドの物理型 | サポート | 注記 |
| --- | --- | --- |
| `Array<Bool>` | サポート | サブフィールドを `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポート | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポート | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポート | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポート | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポート | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポート | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポート | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポート | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | サポートされていません | Sparse vector サブフィールドは StructArray フィールドではサポートされていません。 |
| `Array<String>` | サポートされていません | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | サポートされていません | JSON サブフィールドは StructArray フィールドではサポートされていません。 |
| `Array<Geometry>` | サポートされていません | Geometry サブフィールドおよび GIS 関数は StructArray フィールドではサポートされていません。 |
| `Array<Text>` | サポートされていません | Text サブフィールドは StructArray フィールドではサポートされていません。 |
| `Array<Timestamptz>` | サポートされていません | Timestamptz サブフィールドおよび時刻固有の式は StructArray フィールドではサポートされていません。 |
| ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | サポートされていません | StructArray フィールドは、ネストされた配列、vector 配列、Struct、または Array-of-Struct サブフィールドをサポートしません。 |

## Nullable と動的スキーマの制限\{#nullable-and-dynamic-schema-limits}

Nullable な StructArray の動作および動的な StructArray フィールドの追加にはバージョン制限があります。

| 機能 | 制限 |
| --- | --- |
| Nullable な StructArray フィールド | nullable StructArray および nullable vector-array のサポートを含むバージョンでのみサポートされます。 |
| Python における null 値 | Python では、null の StructArray 値を挿入するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| Null の適用範囲 | null は StructArray フィールド全体に適用されます。たとえば、`chunks` が nullable である場合にのみ `chunks=None` が有効です。 |
| 部分的に null な StructArray 値 | StructArray フィールドが有効な配列値を含む場合、同じ値の中で null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。 |
| 動的な StructArray フィールド追加 | 既存の collection への StructArray フィールドの追加は、動的な StructArray フィールドサポートを含むバージョンでのみサポートされます。 |
| 動的追加時の nullable 要件 | 既存のエンティティには新しいフィールドの値が存在しないため、既存の collection に追加される StructArray フィールドは nullable である必要があります。 |
| 動的追加後の既存エンティティ | 既存のエンティティは、追加された StructArray フィールドについて、そのサブフィールド全体にわたって `null` を返します。 |

Milvus v3.0.x と互換性のある cluster では、nullable StructArray フィールド、nullable vector arrays、および動的な StructArray フィールド追加が利用できます。

nullable StructArray フィールドを使った挿入例については、[StructArray フィールドへのデータ挿入](./insert-struct-array)を参照してください。

## 挿入の制限\{#insert-limits}

| 制限 | 詳細 |
| --- | --- |
| ペイロード形状 | StructArray フィールドは、`chunks: [{"text": "...", "emb": [...]}]` のような Struct オブジェクトの配列として挿入します。 |
| サブフィールド名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のようなサブフィールド名を使用します。 |
| スキーマ整合性 | 各 Struct 要素は Struct スキーマに一致している必要があります。 |
| 容量 | 1 つのエンティティ内の Struct 要素数は `max_capacity` を超えてはなりません。 |
| vector 次元 | vector 値は、それぞれの vector サブフィールドに設定された `dim` に一致している必要があります。 |
| 検索モードの重複 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々の vector サブフィールドに vector を書き込んでください。 |

## index と metric の制限\{#index-and-metric-limits}

StructArray の vector サブフィールドには、EmbeddingList 検索または要素レベル検索のいずれかのために index を作成できます。同じ vector サブフィールドで両方の metric ファミリーを使用することはできません。これは、各 vector フィールドまたは vector サブフィールドが受け付けられる index が 1 つだけだからです。

| 検索モード | Metric ファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList 検索 | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2`、またはバイナリ `MAX_SIM_*` metrics | エンティティレベルの結果。 |
| 要素レベル検索 | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常の vector metrics | 一致した要素の offset を含められる要素レベルの結果。 |

両方のモードが必要な場合は、別々の vector サブフィールドを使用してください。たとえば、EmbeddingList 検索には `chunks[emb_list_vector]` を、要素レベル検索には `chunks[emb]` を使用します。

StructArray の vector サブフィールドは、collection スキーマを設計する際には vector サブフィールドとしてカウントされます。vector フィールドと vector サブフィールドの合計数は、対象バージョンおよびサービス階層の制限内に収めてください。

サポートされる index-type と metric-type の対応表については、[StructArray フィールドの index 作成](./index-struct-array)を参照してください。

## 検索の制限\{#search-limits}

| 検索動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList 検索 | `MAX_SIM*` metrics で index 化された StructArray の vector サブフィールドでサポートされます。エンティティレベルの結果を返します。 |
| 基本的な要素レベル検索 | 通常の vector metrics で index 化された StructArray の vector サブフィールドでサポートされます。一致した要素の offset を返すことができます。 |
| 範囲検索 | 対象バージョンの検索モードおよび index/metric サポートに応じてサポートされます。要素レベルの StructArray リクエストにおける hybrid search の範囲動作については、対象バージョンを確認してください。 |
| グルーピング検索 | 要素レベルの grouping search は offset を返すことができます。要素レベルの StructArray リクエストに対する hybrid search の group-by 動作にはバージョン制限があります。 |
| Hybrid search | hybrid search リクエストには、対象バージョンがその検索の組み合わせをサポートする場合にのみ、StructArray の vector サブフィールドリクエストを含めることができます。各リクエストは引き続き、index 化された vector サブフィールドの metric ファミリーに従います。 |
| Offset 出力 | offset は要素レベル検索結果で利用できます。EmbeddingList 検索はエンティティレベルの結果を返し、主要な結果単位として要素 offset は使用しません。 |

## フィルタと演算子の制限\{#filter-and-operator-limits}

StructArray の scalar フィルタリングは、`element_filter` や `MATCH_*` ファミリーなどの StructArray 演算子によって処理されます。詳細な述語サポートマトリクスは、[StructArray Operators](./struct-array-filtering) にあります。

大まかには次のとおりです。

- `$[subfield]` は StructArray 演算子の内部でのみ使用してください。

- scalar 述語には scalar サブフィールドを使用してください。

- `$[...]` の scalar 述語入力として vector サブフィールドを使用しないでください。

- JSON パス構文、JSON 関数、配列コンテナ関数、テキスト一致関数、Geometry / GIS 関数、および Timestamptz 式は、StructArray の要素レベル述語ではサポートされていません。

- 裸の boolean 式ではなく、`$[has_code] == true` のような明示的な boolean 比較を推奨します。

## 関連ページ\{#related-pages}

1. StructArray フィールドを作成するには、[StructArray フィールドの作成](./create-struct-array)を参照してください。

1. データを挿入するには、[StructArray フィールドへのデータ挿入](./insert-struct-array)を参照してください。

1. vector index と scalar index を作成するには、[StructArray フィールドの index 作成](./index-struct-array)を参照してください。

1. StructArray のフィルタ構文を確認するには、[StructArray Operators](./struct-array-filtering)を参照してください。


---
title: "StructArray の制限 | Cloud"
slug: /struct-array-limits
sidebar_label: "StructArray の制限"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限のリファレンスとして使用してください。 | Cloud"
type: origin
token: Q7wIwcnrEiVDofk5G4Fc7vlonPh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray の制限

StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限のリファレンスとして使用してください。

StructArray の制限の多くは、次の 3 つのいずれかに由来します。StructArray のスキーマモデル、ベクトルサブフィールドに選択する検索モード、そしてコレクションが実行されている Zilliz Cloud のバージョンです。

## 制限の概要\{#limits-at-a-glance}

| 領域 | 制限 |
| --- | --- |
| スキーマの形状 | Struct は Array フィールドの要素型としてのみ使用できます。Struct はトップレベルのコレクションフィールドとしてはサポートされていません。 |
| サブフィールドスキーマ | 同じ StructArray フィールド内のすべての Struct 要素は、事前定義された 1 つの Struct スキーマを共有します。 |
| 容量 | `max_capacity` は必須で、1 つのエンティティが StructArray フィールドに格納できる Struct 要素数を制限します。 |
| サブフィールドの変更 | StructArray フィールドの作成後、その既存の StructArray フィールドにサブフィールドを追加することはできません。 |
| サブフィールドパス | インデックス、検索対象、出力フィールド、フィルターには、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| 挿入の形状 | StructArray フィールドはオブジェクトの配列として挿入します。挿入ペイロード内ではパス構文を使用しないでください。 |
| ベクトルインデックス | ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスのみを受け付けます。EmbeddingList 検索と要素レベル検索には別々のベクトルサブフィールドを使用してください。 |
| 関数 | フィールド関数は、StructArray フィールド内のフィールドまたはサブフィールドではサポートされていません。 |
| nullable なフィールド | nullable な StructArray フィールドはバージョンによって制限されます。サポートされている場合、null は StructArray フィールド全体に適用され、個々の Struct 要素に独立して適用されるわけではありません。 |
| フィールドの動的追加 | 既存のコレクションへの StructArray フィールドの追加はバージョンによって制限され、追加するフィールドは nullable である必要があります。 |

## スキーマの制限\{#schema-limits}

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベルのフィールド型ではありません。 | StructArray フィールドは、`datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して作成します。 |
| すべての要素が 1 つのスキーマを共有します。 | StructArray フィールド内のすべての Struct 要素は、同じサブフィールドリストとサブフィールドデータ型に従います。 |
| `max_capacity` は必須です。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドに設定された `max_capacity` を超えてはなりません。 |
| 既存のサブフィールドは固定です。 | 既存の StructArray フィールドに新しいサブフィールドを追加することはできません。サブフィールドスキーマを変更するには、StructArray フィールドを削除し、更新したスキーマで再度追加します。 |
| ネストされた StructArray はサポートされていません。 | StructArray フィールドには、ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` サブフィールドを含めることはできません。 |
| StructArray 内では関数はサポートされていません。 | StructArray フィールドまたはそのサブフィールドにフィールド関数を定義しないでください。 |

スキーマ作成の例については、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

## サポートされるサブフィールドデータ型\{#supported-subfield-data-types}

StructArray のサブフィールドは、物理的な配列形式のストレージにマッピングされます。次の表に、サポートされる物理型とサポートされない物理型を示します。

| Struct サブフィールドの物理型 | サポート | 備考 |
| --- | --- | --- |
| `Array<Bool>` | サポート対象 | サブフィールドを `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポート対象 | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポート対象 | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポート対象 | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポート対象 | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポート対象 | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポート対象 | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポート対象 | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポート対象 | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | サポート対象外 | スパースベクトルのサブフィールドは StructArray フィールドではサポートされていません。 |
| `Array<String>` | サポート対象外 | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | サポート対象外 | JSON サブフィールドは StructArray フィールドではサポートされていません。 |
| `Array<Geometry>` | サポート対象外 | Geometry サブフィールドと GIS 関数は StructArray フィールドではサポートされていません。 |
| `Array<Text>` | サポート対象外 | Text サブフィールドは StructArray フィールドではサポートされていません。 |
| `Array<Timestamptz>` | サポート対象外 | Timestamptz サブフィールドと時間固有の式は StructArray フィールドではサポートされていません。 |
| ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | サポート対象外 | StructArray フィールドは、ネストされた配列、ベクトル配列、Struct、または Struct の配列のサブフィールドをサポートしていません。 |

## Nullable と動的スキーマの制限\{#nullable-and-dynamic-schema-limits}

nullable な StructArray の動作と、StructArray フィールドの動的追加はバージョンによって制限されます。

| 機能 | 制限 |
| --- | --- |
| nullable な StructArray フィールド | Milvus 3.0.0 以降の 3.0.x 系を実行しているオンデマンドクラスターでサポートされます。`nullable=True` は StructArray の親に設定し、Struct サブフィールドを個別に nullable として構成しないでください。 |
| Python での null 値 | Python で null の StructArray 値を挿入するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| null の適用範囲 | null は StructArray フィールド全体に適用されます。たとえば、`chunks=None` は `chunks` が nullable の場合にのみ有効です。 |
| 部分的に null の StructArray 値 | StructArray フィールドに有効な配列値が含まれている場合、同じ値の中で null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。 |
| StructArray フィールドの動的追加 | Milvus 3.0.0 以降の 3.0.x 系を実行しているオンデマンドクラスターでサポートされます。 |
| 動的追加における nullable の要件 | 既存のコレクションに追加される StructArray フィールドは、既存のエンティティが新しいフィールドの値を持たないため、nullable である必要があります。 |
| 動的追加後の既存エンティティ | 既存のエンティティは、追加された StructArray フィールドについて、そのサブフィールド全体で `null` を返します。 |

Zilliz Cloud では、nullable な StructArray フィールド、nullable なベクトル配列、および StructArray フィールドの動的追加は、Milvus 3.0.0 以降の 3.0.x 系を実行しているオンデマンドクラスターでサポートされています。サービングクラスターはこれらの機能をサポートしていません。

nullable な StructArray フィールドを使用した挿入例については、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

## 挿入の制限\{#insert-limits}

| 制限 | 詳細 |
| --- | --- |
| ペイロードの形状 | StructArray フィールドは、`chunks: [{"text": "...", "emb": [...]}]` のような Struct オブジェクトの配列として挿入します。 |
| サブフィールド名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のようなサブフィールド名を使用します。 |
| スキーマの整合性 | 各 Struct 要素は Struct スキーマに一致している必要があります。 |
| 容量 | 1 つのエンティティ内の Struct 要素数は `max_capacity` を超えてはなりません。 |
| ベクトル次元 | ベクトル値は、それぞれのベクトルサブフィールドに設定された `dim` と一致している必要があります。 |
| 検索モードの重複 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドにベクトルを書き込みます。 |

## インデックスとメトリクスの制限\{#index-and-metric-limits}

StructArray のベクトルサブフィールドは、EmbeddingList 検索または要素レベル検索のいずれかに対してインデックスを作成できます。同じベクトルサブフィールドで両方のメトリクスファミリーを使用することはできません。これは、各ベクトルフィールドまたはベクトルサブフィールドが 1 つのインデックスのみを受け付けるためです。

| 検索モード | メトリクスファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList 検索 | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2`、またはバイナリ `MAX_SIM_*` メトリクス | エンティティレベルの結果。 |
| 要素レベル検索 | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常のベクトルメトリクス | 一致した要素のオフセットを含めることができる要素レベルの結果。 |

両方のモードが必要な場合は、別々のベクトルサブフィールドを使用します。たとえば、EmbeddingList 検索には `chunks[emb_list_vector]` を、要素レベル検索には `chunks[emb]` を使用します。

StructArray のベクトルサブフィールドは、コレクションスキーマを設計する際にベクトルサブフィールドとしてカウントされます。ベクトルフィールドとベクトルサブフィールドの合計数を、対象バージョンとサービスティアの制限内に収めてください。

サポートされるインデックス種別とメトリクス種別の対応表については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

## 検索の制限\{#search-limits}

| 検索動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList 検索 | `MAX_SIM*` メトリクスでインデックスが作成された StructArray のベクトルサブフィールドでサポートされます。エンティティレベルの結果を返します。 |
| 基本的な要素レベル検索 | 通常のベクトルメトリクスでインデックスが作成された StructArray のベクトルサブフィールドでサポートされます。一致した要素のオフセットを返すことができます。 |
| 範囲検索 | 対象バージョンの検索モードと index/metric のサポート状況に応じてサポートされます。要素レベルの StructArray リクエストにおけるハイブリッド検索の範囲の動作については、対象バージョンを確認してください。 |
| グループ化検索 | 要素レベルのグループ化検索はオフセットを返すことができます。要素レベルの StructArray リクエストにおけるハイブリッド検索のグループ化の動作はバージョンによって制限されます。 |
| ハイブリッド検索 | ハイブリッド検索リクエストには、対象バージョンがその検索の組み合わせをサポートしている場合にのみ、StructArray のベクトルサブフィールドのリクエストを含めることができます。各リクエストは、引き続きインデックスが作成されたベクトルサブフィールドのメトリクスファミリーに従います。 |
| オフセットの出力 | オフセットは要素レベルの検索結果で利用できます。EmbeddingList 検索はエンティティレベルの結果を返し、主要な結果単位として要素のオフセットを使用しません。 |

## フィルターと演算子の制限\{#filter-and-operator-limits}

StructArray のスカラーフィルタリングは、`element_filter` や `MATCH_*` ファミリーなどの StructArray 演算子によって処理されます。詳細な述語のサポート対応表は、[StructArray 演算子](./struct-array-filtering) にあります。

概要は次のとおりです。

- `$[subfield]` は StructArray 演算子の内部でのみ使用します。

- スカラー述語にはスカラーサブフィールドを使用します。

- `$[...]` のスカラー述語入力としてベクトルサブフィールドを使用しないでください。

- JSON パス構文、JSON 関数、配列コンテナ関数、テキストマッチ関数、Geometry / GIS 関数、および Timestamptz 式は、StructArray の要素レベル述語ではサポートされていません。

- 裸の boolean 式ではなく、`$[has_code] == true` のような明示的な boolean 比較を優先してください。

## 関連ページ\{#related-pages}

1. StructArray フィールドを作成するには、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

1. データを挿入するには、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

1. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

1. StructArray のフィルター構文を確認するには、[StructArray 演算子](./struct-array-filtering) を参照してください。


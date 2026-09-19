---
title: "StructArray の制限 | BYOC"
slug: /struct-array-limits
sidebar_label: "StructArray の制限"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、および StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限事項のリファレンスとして使用してください。 | BYOC"
type: origin
token: Q7wIwcnrEiVDofk5G4Fc7vlonPh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray の制限

StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、および StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限事項のリファレンスとして使用してください。

StructArray の制限の多くは、次の 3 つのいずれかに由来します。StructArray のスキーマモデル、ベクトルサブフィールドに対して選択する検索モード、そしてコレクションが実行されている Zilliz Cloud のバージョンです。

## 制限の概要\{#limits-at-a-glance}

| 領域 | 制限 |
| --- | --- |
| スキーマの形状 | Struct は Array フィールドの要素型としてのみ使用できます。Struct はコレクションのトップレベルフィールドとしてはサポートされません。 |
| サブフィールドのスキーマ | 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義された Struct スキーマを共有します。 |
| 容量 | `max_capacity` は必須であり、1 つのエンティティが StructArray フィールドに格納できる Struct 要素数を制限します。 |
| サブフィールドの変更 | StructArray フィールドを作成した後、その既存の StructArray フィールドにサブフィールドを追加することはできません。 |
| サブフィールドのパス | インデックス、検索対象、出力フィールド、フィルターには、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| 挿入の形状 | StructArray フィールドはオブジェクトの配列として挿入します。挿入ペイロード内ではパス構文を使用しないでください。 |
| ベクトルインデックス | ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスしか受け付けません。EmbeddingList 検索と要素レベル検索には、別々のベクトルサブフィールドを使用してください。 |
| 関数 | フィールド関数は、StructArray フィールド内のフィールドまたはサブフィールドではサポートされません。 |
| nullable フィールド | nullable な StructArray フィールドはバージョン制限があります。サポートされる場合、null は個々の Struct 要素に独立して適用されるのではなく、StructArray フィールド全体に適用されます。 |
| フィールドの動的追加 | 既存のコレクションへの StructArray フィールドの追加はバージョン制限があり、追加するフィールドは nullable である必要があります。 |

## スキーマの制限\{#schema-limits}

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベルのフィールド型ではありません。 | StructArray フィールドは、`datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して作成します。 |
| すべての要素が 1 つのスキーマを共有します。 | StructArray フィールド内のすべての Struct 要素は、同じサブフィールドリストとサブフィールドのデータ型に従います。 |
| `max_capacity` は必須です。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドに設定された `max_capacity` を超えてはなりません。 |
| 既存のサブフィールドは固定です。 | 既存の StructArray フィールドに新しいサブフィールドを追加することはできません。サブフィールドのスキーマを変更するには、StructArray フィールドを削除し、更新したスキーマで再度追加します。 |
| ネストされた StructArray はサポートされません。 | StructArray フィールドに、ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` サブフィールドを含めることはできません。 |
| StructArray 内では関数がサポートされません。 | StructArray フィールドまたはそのサブフィールドに対してフィールド関数を定義しないでください。 |

スキーマ作成の例については、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

## サポートされるサブフィールドのデータ型\{#supported-subfield-data-types}

StructArray のサブフィールドは、物理的な配列形式のストレージにマッピングされます。次の表に、サポートされる物理型とサポートされない物理型を示します。

| Struct サブフィールドの物理型 | サポート | 備考 |
| --- | --- | --- |
| `Array<Bool>` | サポートされます | サブフィールドを `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポートされます | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポートされます | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポートされます | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポートされます | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポートされます | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポートされます | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポートされます | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポートされます | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | サポートされません | スパースベクトルサブフィールドは StructArray フィールドではサポートされません。 |
| `Array<String>` | サポートされません | `String` ではなく `VARCHAR` を使用します。 |
| `Array<JSON>` | サポートされません | JSON サブフィールドは StructArray フィールドではサポートされません。 |
| `Array<Geometry>` | サポートされません | Geometry サブフィールドおよび GIS 関数は StructArray フィールドではサポートされません。 |
| `Array<Text>` | サポートされません | Text サブフィールドは StructArray フィールドではサポートされません。 |
| `Array<Timestamptz>` | サポートされません | Timestamptz サブフィールドおよび時刻固有の式は StructArray フィールドではサポートされません。 |
| ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | サポートされません | StructArray フィールドは、ネストされた配列、ベクトル配列、Struct、または Array-of-Struct のサブフィールドをサポートしません。 |

## nullable と動的スキーマの制限\{#nullable-and-dynamic-schema-limits}

nullable な StructArray の動作と、StructArray フィールドの動的追加にはバージョン制限があります。

| 機能 | 制限 |
| --- | --- |
| nullable な StructArray フィールド | 3.0.x 系の Milvus 3.0.0 以降を実行するオンデマンドクラスターでサポートされます。StructArray の親に `nullable=True` を設定してください。Struct のサブフィールドを個別に nullable として構成しないでください。 |
| Python での null 値 | Python で null の StructArray 値を挿入するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| null の適用範囲 | null は StructArray フィールド全体に適用されます。たとえば、`chunks=None` は `chunks` が nullable の場合にのみ有効です。 |
| 部分的に null な StructArray 値 | StructArray フィールドに有効な配列値が含まれる場合、同じ値の中で null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。 |
| StructArray フィールドの動的追加 | 3.0.x 系の Milvus 3.0.0 以降を実行するオンデマンドクラスターでサポートされます。 |
| 動的追加時の nullable 要件 | 既存のコレクションに追加する StructArray フィールドは、既存のエンティティに新しいフィールドの値がないため、nullable である必要があります。 |
| 動的追加後の既存エンティティ | 既存のエンティティは、追加された StructArray フィールドについて、そのすべてのサブフィールドで `null` を返します。 |

Zilliz Cloud では、nullable な StructArray フィールド、nullable なベクトル配列、および StructArray フィールドの動的追加は、3.0.x 系の Milvus 3.0.0 以降を実行するオンデマンドクラスターでサポートされます。Serving クラスターはこれらの機能をサポートしません。

nullable な StructArray フィールドを含む挿入例については、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

## 挿入の制限\{#insert-limits}

| 制限 | 詳細 |
| --- | --- |
| ペイロードの形状 | StructArray フィールドは、`chunks: [{"text": "...", "emb": [...]}]` のような Struct オブジェクトの配列として挿入します。 |
| サブフィールド名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のようなサブフィールド名を使用します。 |
| スキーマとの整合性 | 各 Struct 要素は Struct スキーマに一致している必要があります。 |
| 容量 | 1 つのエンティティ内の Struct 要素数は `max_capacity` を超えてはなりません。 |
| ベクトルの次元 | ベクトル値は、それぞれのベクトルサブフィールドに設定された `dim` に一致している必要があります。 |
| 検索モードの重複 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドにベクトルを書き込んでください。 |

## インデックスとメトリクスの制限\{#index-and-metric-limits}

StructArray のベクトルサブフィールドには、EmbeddingList 検索または要素レベル検索のいずれか用のインデックスを作成できます。各ベクトルフィールドまたはベクトルサブフィールドが受け付けるインデックスは 1 つだけであるため、同じベクトルサブフィールドで両方のメトリクスファミリーを使用することはできません。

| 検索モード | メトリクスファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList 検索 | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2`、またはバイナリ `MAX_SIM_*` メトリクス | エンティティレベルの結果。 |
| 要素レベル検索 | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常のベクトルメトリクス | 一致した要素のオフセットを含められる要素レベルの結果。 |

両方のモードが必要な場合は、別々のベクトルサブフィールドを使用してください。たとえば、EmbeddingList 検索には `chunks[emb_list_vector]` を、要素レベル検索には `chunks[emb]` を使用します。

StructArray のベクトルサブフィールドは、コレクションスキーマを設計する際にベクトルサブフィールドとしてカウントされます。ベクトルフィールドとベクトルサブフィールドの合計数は、対象バージョンとサービスティアの制限内に収めてください。

サポートされるインデックスタイプとメトリクスタイプの対応表については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## 検索の制限\{#search-limits}

| 検索動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList 検索 | `MAX_SIM*` メトリクスでインデックス化された StructArray ベクトルサブフィールドでサポートされます。エンティティレベルの結果を返します。 |
| 基本的な要素レベル検索 | 通常のベクトルメトリクスでインデックス化された StructArray ベクトルサブフィールドでサポートされます。一致した要素のオフセットを返すことができます。 |
| 範囲検索 | 対象バージョンの検索モードおよび index/metric のサポートに応じてサポートされます。要素レベルの StructArray リクエストにおけるハイブリッド検索の範囲動作については、対象バージョンを確認してください。 |
| グループ化検索 | 要素レベルのグループ化検索はオフセットを返すことができます。要素レベルの StructArray リクエストに対するハイブリッド検索の group-by 動作にはバージョン制限があります。 |
| ハイブリッド検索 | ハイブリッド検索リクエストには、対象バージョンがその検索の組み合わせをサポートしている場合にのみ、StructArray のベクトルサブフィールドリクエストを含めることができます。各リクエストは、引き続きインデックス化されたベクトルサブフィールドのメトリクスファミリーに従います。 |
| オフセット出力 | オフセットは要素レベルの検索結果で利用できます。EmbeddingList 検索はエンティティレベルの結果を返し、主要な結果単位として要素のオフセットは使用しません。 |

## フィルターと演算子の制限\{#filter-and-operator-limits}

StructArray のスカラーフィルタリングは、`element_filter` や `MATCH_*` ファミリーなどの StructArray 演算子によって処理されます。詳細な述語のサポートマトリクスについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

大まかには、次のとおりです。

- `$[subfield]` は StructArray 演算子の内部でのみ使用してください。

- スカラー述語にはスカラーサブフィールドを使用してください。

- `$[...]` のスカラー述語入力としてベクトルサブフィールドを使用しないでください。

- JSON パス構文、JSON 関数、配列コンテナ関数、テキスト一致関数、Geometry / GIS 関数、および Timestamptz 式は、StructArray の要素レベル述語ではサポートされません。

- 単独の boolean 式ではなく、`$[has_code] == true` のような明示的な boolean 比較を優先してください。

## 関連ページ\{#related-pages}

1. StructArray フィールドを作成するには、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

1. データを挿入するには、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

1. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. StructArray のフィルター構文を確認するには、[StructArray 演算子](./struct-array-filtering) を参照してください。

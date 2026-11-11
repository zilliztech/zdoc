---
title: "StructArray の制限 | BYOC"
slug: /struct-array-limits
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、および StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限事項のリファレンスとして使用してください。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-struct-array-limits
sidebar_label: "StructArray の制限"
sidebar_position: 5
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/structarray-limits.md"

---

# StructArray の制限

StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、および StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限事項のリファレンスとして使用してください。

StructArray の制限の多くは、次の 3 つのいずれかに由来します。StructArray のスキーマモデル、ベクトルサブフィールドに対して選択する検索モード、そしてコレクションが実行されている Zilliz Cloud のバージョンです。

## 制限の概要\{#limits-at-a-glance}

StructArray の主な制限は次のとおりです。

| 領域 | 制限 |
| --- | --- |
| スキーマの形状 | Struct は Array フィールドの要素型としてのみ使用できます。Struct はコレクションのトップレベルフィールドとしてはサポートされません。 |
| サブフィールドのスキーマ | 同じ StructArray フィールド内のすべての Struct 要素は、1 つの事前定義された Struct スキーマを共有します。 |
| ネストされたサブフィールド | Struct は、ネストが 1 レベルのスカラー `ARRAY` サブフィールドを含めることができます。ネストされた `Struct`、`ArrayOfStruct`、JSON サブフィールドは、どのバージョンでもサポートされません。 |
| 容量 | `max_capacity` は必須であり、1 つのエンティティが StructArray フィールドに格納できる Struct 要素数を制限します。 |
| サブフィールドの変更 | 既存の StructArray フィールドに要素レベルの null を許容するサブフィールドを追加したり、フィールドからサブフィールドを削除したりできます。 |
| サブフィールドのパス | インデックス、検索対象、出力フィールド、フィルターには、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| 挿入の形状 | StructArray フィールドはオブジェクトの配列として挿入します。挿入ペイロード内ではパス構文を使用しないでください。 |
| ベクトルインデックス | ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスしか受け付けません。EmbeddingList 検索と要素レベル検索には、別々のベクトルサブフィールドを使用してください。 |
| 関数 | フィールド関数は、StructArray フィールド内のフィールドまたはサブフィールドではサポートされません。 |
| nullable フィールド | nullable な StructArray フィールドにはバージョン制限があります。行レベルの null は StructArray フィールド全体に適用されます。さらに、サブフィールドでは個々の Struct 要素に null 値を許可できます。スカラーまたはベクトルのサブフィールドでは `nullable=True`、配列サブフィールドでは `element_nullable=True` を指定します。Struct 要素自体は null にできません。 |
| フィールドの動的追加 | 既存のコレクションへの StructArray フィールドの追加はバージョン制限があり、追加するフィールドは nullable である必要があります。 |


## スキーマの制限\{#schema-limits}

StructArray スキーマには次の制限があります。

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベルのフィールド型ではありません。 | StructArray フィールドは、`datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して作成します。 |
| すべての要素が 1 つのスキーマを共有します。 | StructArray フィールド内のすべての Struct 要素は、同じサブフィールドリストとサブフィールドのデータ型に従います。 |
| `max_capacity` は必須です。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドに設定された `max_capacity` を超えてはなりません。 |
| スカラー `ARRAY` サブフィールドにはサブフィールドごとの `max_capacity` があります。 | スカラー `ARRAY` サブフィールドは、内側の配列に `max_capacity` を宣言します。Zilliz Cloud は、内側の配列がそのサブフィールドで宣言された容量を超える Struct 要素を拒否します。値はサブフィールド間で一致する必要はありません。値は 0 より大きく、デフォルト値が 4096 の `proxy.maxArrayCapacity` を超えてはなりません。 |
| サブフィールドは変更できます。 | 要素レベルの null を許容するサブフィールドを追加するか、`chunks[lang]` などのパスでサブフィールドを削除します。StructArray フィールドの最後のサブフィールド、コレクションの最後のベクトルフィールド、または Function で使用されているサブフィールドは削除できません。 |
| ネストされた Struct はサポートされません。 | Struct は、ネストされた `Struct`、`ArrayOfStruct`、JSON サブフィールドを含めることはできません。Struct は、ネストが 1 レベルのスカラー `ARRAY` サブフィールドを含めることができます。`ARRAY` サブフィールドはベクトルを格納できません。 |
| StructArray 内では関数がサポートされません。 | StructArray フィールドまたはそのサブフィールドに対してフィールド関数を定義しないでください。 |
| StructArray フィールドではフィールドプロパティが制限されます。 | StructArray フィールドまたはサブフィールドパスに対する `alter_collection_field()` では、`mmap.enabled`、`field.description`、および `warmup` のみを受け付けます。`max_capacity` や `max_length` などの他のプロパティは拒否されます。 |
| サブフィールドではテキスト分析がサポートされません。 | Struct サブフィールドで `enable_match` または `enable_analyzer` を設定すると拒否されます。テキストインデックスはトップレベルフィールドに対してのみ作成されます。 |


スキーマ作成の例については、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

## サポートされるサブフィールドのデータ型\{#supported-subfield-data-types}

StructArray のサブフィールドは、物理的な配列形式のストレージにマッピングされます。次の表に、サポートされる物理型とサポートされない物理型を示します。

| Struct サブフィールドの物理型 | サポート | 備考 |
| --- | --- | --- |
| Array&lt;Bool&gt; | サポートされます | サブフィールドを `DataType.BOOL` として定義します。 |
| Array&lt;Int8/Int16/Int32/Int64&gt; | サポートされます | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| Array&lt;Float/Double&gt; | サポートされます | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| Array&lt;VarChar&gt; | サポートされます | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| ArrayOfVector&lt;FloatVector&gt; | サポートされます | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Float16Vector&gt; | サポートされます | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BFloat16Vector&gt; | サポートされます | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Int8Vector&gt; | サポートされます | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BinaryVector&gt; | サポートされます | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;SparseFloatVector&gt; | サポートされません | スパースベクトルサブフィールドは StructArray フィールドではサポートされません。 |
| Array&lt;String&gt; | サポートされません | `String` ではなく `VARCHAR` を使用します。 |
| Array&lt;JSON&gt; | サポートされません | JSON サブフィールドは StructArray フィールドではサポートされません。 |
| Array&lt;Geometry&gt; | サポートされません | Geometry サブフィールドおよび GIS 関数は StructArray フィールドではサポートされません。 |
| Array&lt;Text&gt; | サポートされません | Text サブフィールドは StructArray フィールドではサポートされません。 |
| Array&lt;Timestamptz&gt; | サポートされません | Timestamptz サブフィールドおよび時刻固有の式は StructArray フィールドではサポートされません。 |
| Array&lt;Array&gt; | サポートされます | サブフィールドを、スカラーの `element_type` と内側の配列用の `max_capacity` を指定した `DataType.ARRAY` として定義します。各 Struct 要素は、1 つの内側の配列を保持します。サブフィールドで `nullable=True` を設定すると内側の配列に null を許可でき、`element_nullable=True` を設定すると内側の配列内の null 値を許可できます。 |
| `Array` の `Array` の `Array`、ベクトルの `Array`、`Struct`、または `ArrayOfStruct` | サポートされません | Struct 内の配列のネストは 1 レベルまでに限られ、内側の配列はベクトルを格納できず、ネストされた Struct または Array-of-Struct サブフィールドはサポートされません。 |


## nullable と動的スキーマの制限\{#nullable-and-dynamic-schema-limits}

次の表では、後述の可用性に関する記述に従うことを前提として、nullable な StructArray の動作と StructArray フィールドの動的追加について説明します。

| 機能 | 制限 |
| --- | --- |
| nullable な StructArray フィールド | 後述の可用性に関する記述に従い、StructArray の親に `nullable=True` を設定してください。Struct のサブフィールドを個別に nullable として設定しないでください。 |
| Python での NULL 値 | Python で null の StructArray 値を挿入するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| null の適用範囲 | NULL は StructArray フィールド全体に適用されます。たとえば、`chunks=None` は `chunks` が nullable の場合にのみ有効です。 |
| 部分的に null な StructArray 値 | StructArray フィールドに有効な配列値が含まれる場合、同じ値の中で null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。 |
| 要素レベルの null | サポートされます。スカラー、ベクトル、または `ARRAY` サブフィールドでは、個々の Struct 要素に null 値を許可できます。スカラーまたはベクトルサブフィールドでは `nullable=True`、`ARRAY` サブフィールドでは `element_nullable=True` を指定します。行レベルの `nullable` 設定は引き続き StructArray の親から取得されます。サブフィールドで `nullable=True` を設定すると、行レベルの null ではなく、要素レベルの null が有効になります。 |
| null の Struct 要素 | Struct 要素自体は、`[null, {...}]` のように null にできません。代わりに、その要素のサブフィールド値を null に設定してください。 |
| 省略されたサブフィールド | 要素レベルの null を許容するサブフィールドは Struct 要素から省略でき、Zilliz Cloud はそのサブフィールドに null を格納します。要素レベルの null を許容しないサブフィールドは、すべての Struct 要素に存在している必要があります。 |
| StructArray フィールドの動的追加 | 後述の可用性に関する記述に従います。 |
| 動的追加時の nullable 要件 | 既存のコレクションに追加する StructArray フィールドは、既存のエンティティに新しいフィールドの値がないため、nullable である必要があります。 |
| 動的追加後の既存エンティティ | 既存のエンティティは、追加された StructArray フィールドに対して `null` を返します。 |
| サブフィールドの動的追加 | サポートされます。追加するサブフィールドは `nullable=True` を指定して作成する必要があります。追加する `ARRAY` サブフィールドでは、さらに、内側の配列内の null 値用に `element_nullable=True` を指定します。既存のエンティティは、各 Struct 要素内の新しいサブフィールドに対して null を返し、StructArray フィールドが null であるエンティティは null のままです。既存のサブフィールドを後から `element_nullable` に変更することはできません。 |


Zilliz Cloud では、nullable な StructArray フィールドと StructArray フィールドの動的追加は、Dedicated クラスターと On-Demand クラスターでサポートされています。動的に追加する StructArray フィールドは nullable である必要があります。nullable なベクトル配列は、Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされています。後述の追加機能を参照してください。

要素レベルの null 値、スカラー `ARRAY` サブフィールド、および既存の StructArray フィールドのサブフィールドの追加または削除は、Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされています。


これらの機能は、On-Demand クラスターではまだ利用できません。


nullable な StructArray フィールドを含む挿入例については、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

## 挿入の制限\{#insert-limits}

StructArray の挿入ペイロードには次の制限があります。

| 制限 | 詳細 |
| --- | --- |
| ペイロードの形状 | StructArray フィールドは、`chunks: [{"text": "...", "emb": [...]}]` のような Struct オブジェクトの配列として挿入します。 |
| サブフィールド名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のようなサブフィールド名を使用します。 |
| スキーマとの整合性 | 各 Struct 要素は Struct スキーマに一致している必要があります。要素レベルの null を許容するサブフィールドは、Struct 要素内で省略するか、`null` に設定できます。 |
| 容量 | 1 つのエンティティ内の Struct 要素数は `max_capacity` を超えてはなりません。 |
| ベクトルの次元 | ベクトル値は、それぞれのベクトルサブフィールドに設定された `dim` に一致している必要があります。 |
| 検索モードの重複 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドにベクトルを書き込んでください。 |


## インデックスとメトリクスの制限\{#index-and-metric-limits}

StructArray のベクトルサブフィールドは、EmbeddingList 検索または要素レベル検索のいずれかにインデックスを作成できます。各ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスしか受け付けないため、同じベクトルサブフィールドで両方のメトリクスファミリーを使用することはできません。検索モードでは、次のメトリクスファミリーを使用します。

| 検索モード | メトリクスファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList 検索 | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2`、またはバイナリ `MAX_SIM_*` メトリクス | エンティティレベルの結果。 |
| 要素レベル検索 | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常のベクトルメトリクス | 一致した要素のオフセットを含められる要素レベルの結果。 |

両方のモードが必要な場合は、別々のベクトルサブフィールドを使用してください。たとえば、EmbeddingList 検索には `chunks[emb_list_vector]` を、要素レベル検索には `chunks[emb]` を使用します。

StructArray のベクトルサブフィールドは、コレクションレベルの上限 `proxy.maxVectorFieldNum`（デフォルトは 10）に対してベクトルフィールドとしてカウントされます。ベクトルサブフィールドがコレクション内で唯一のベクトルフィールドである StructArray フィールドは有効であり、コレクションにベクトルフィールドが残らなくなる場合、そのようなフィールドの削除は拒否されます。ベクトルフィールドとベクトルサブフィールドの合計数を、対象バージョンとサービスティアの制限内に収めてください。

要素レベルの null を許容するベクトルサブフィールドは、通常のベクトルメトリクスを使用した要素レベル検索のみをサポートします。`MAX_SIM*` メトリクス、EmbeddingList インデックス、および EmbeddingList 検索は、要素レベルの null を許容するベクトルサブフィールドでは拒否され、`AUTOINDEX` はそれらに `MAX_SIM*` メトリクスを選択しません。null ベクトルは検索の対象になりません。スカラーインデックスは、要素レベルの null を許容するサブフィールドまたはスカラー `ARRAY` サブフィールドではサポートされません。


サポートされるインデックスタイプとメトリクスタイプの対応表については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## 検索の制限\{#search-limits}

StructArray の検索動作には次の制限があります。

| 検索動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList 検索 | `MAX_SIM*` メトリクスでインデックス化された StructArray ベクトルサブフィールドでサポートされます。エンティティレベルの結果を返します。 |
| 基本的な要素レベル検索 | 通常のベクトルメトリクスでインデックス化された StructArray ベクトルサブフィールドでサポートされます。一致した要素のオフセットを返すことができます。 |
| 範囲検索 | 対象バージョンの検索モードとインデックス/metric のサポートに応じてサポートされます。要素レベルの StructArray リクエストにおけるハイブリッド検索の範囲検索動作については、対象バージョンを確認してください。 |
| グループ化検索 | 要素レベルのグループ化検索はオフセットを返すことができます。要素レベルの StructArray リクエストに対するハイブリッド検索の group-by 動作にはバージョン制限があります。 |
| ハイブリッド検索 | ハイブリッド検索リクエストには、対象バージョンがその検索の組み合わせをサポートしている場合にのみ、StructArray のベクトルサブフィールドリクエストを含めることができます。各リクエストは、引き続きインデックス化されたベクトルサブフィールドのメトリクスファミリーに従います。 |
| オフセット出力 | オフセットは要素レベルの検索結果で利用できます。EmbeddingList 検索はエンティティレベルの結果を返し、主要な結果単位として要素のオフセットは使用しません。 |

## フィルターと演算子の制限\{#filter-and-operator-limits}

StructArray のスカラーフィルタリングは、`element_filter` や `MATCH_*` ファミリーなどの StructArray 演算子によって処理されます。詳細な述語のサポートマトリクスについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

大まかには、次のとおりです。

- `$[subfield]` は StructArray 演算子の内部でのみ使用してください。

- 行レベルのフィルター式では、StructArray のパスを直接参照することもできます。たとえば、1 つの要素位置には `chunks[0][section]`、要素数には `array_length(chunks)`、複数の要素にわたるサブフィールド値には `array_contains(chunks[section], ...)`、nullable な StructArray フィールドには `chunks is null` を使用します。

- スカラー述語にはスカラーサブフィールドを使用してください。

- `$[...]` のスカラー述語入力としてベクトルサブフィールドを使用しないでください。

- JSON パス構文、JSON 関数、テキストマッチ関数、Geometry / GIS 関数、および Timestamptz 式は、StructArray の要素レベル述語ではサポートされていません。`array_contains`、`array_contains_any`、`array_contains_all`、および `array_length` はスカラー `ARRAY` サブフィールドの `$[subfield]` でサポートされ、`$[subfield] is null` / `is not null` はすべてのサブフィールド型でサポートされています。


- Struct 要素内のサブフィールド値が null の場合、その要素の述語は false ではなく unknown になります。`element_filter` は述語が true の要素のみを保持し、`MATCH_*` は unknown の要素を一致しないものとしてカウントします。詳細については、[StructArray 演算子](./struct-array-filtering) を参照してください。


- 単独の boolean 式ではなく、`$[has_code] == true` のような明示的な boolean 比較を優先してください。

<a id="Import-limits"></a>

## インポートとストレージの制限\{#import-and-storage-limits}

| 制限 | 詳細 |
| --- | --- |
| ソースファイル形式 | JSON、JSONL、CSV、および Parquet ファイルは StructArray フィールドを保持できます。NumPy ファイルはトップレベルフィールドごとに 1 ファイルで構成されるため、StructArray データを提供できません。StructArray フィールドを持つコレクションには、JSON、CSV、または Parquet ファイルを使用してください。ファイルの形状については、[ソースデータを準備する](./import-data-via-sdks#structarray-fields-in-source-files) を参照してください。 |
| バックアップとスナップショットのインポート | バックアップの復元などの Binlog インポート、およびスナップショットソースのインポートは、要素レベルの null を許容するサブフィールドまたはスカラー `ARRAY` サブフィールドを持つコレクションでは拒否されます。 |


## 関連ページ\{#related-pages}

1. StructArray フィールドを作成するには、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

2. データを挿入するには、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

3. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

4. StructArray のフィルター構文を確認するには、[StructArray 演算子](./struct-array-filtering) を参照してください。

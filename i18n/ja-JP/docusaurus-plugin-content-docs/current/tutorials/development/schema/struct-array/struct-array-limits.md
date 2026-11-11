---
title: "StructArray の制限 | Cloud"
slug: /struct-array-limits
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限のリファレンスとして使用してください。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-struct-array-limits
sidebar_label: "StructArray の制限"
sidebar_position: 5
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/structarray-limits.md"

---

# StructArray の制限

StructArray のサポートは、スキーマ定義、挿入ペイロード、インデックス作成、検索モード、StructArray 固有のフィルターに及びます。本番環境で StructArray の動作に依存する前に、このページを制限のリファレンスとして使用してください。

StructArray の制限の多くは、次の 3 つのいずれかに由来します。StructArray のスキーマモデル、ベクトルサブフィールドに選択する検索モード、そしてコレクションが実行されている Zilliz Cloud のバージョンです。

## 制限の概要\{#limits-at-a-glance}

主な StructArray の制限は次のとおりです。

| 領域 | 制限 |
| --- | --- |
| スキーマの形状 | Struct は Array フィールドの要素型としてのみ使用できます。Struct はトップレベルのコレクションフィールドとしてはサポートされていません。 |
| サブフィールドスキーマ | 同じ StructArray フィールド内のすべての Struct 要素は、事前定義された 1 つの Struct スキーマを共有します。 |
| ネストされたサブフィールド | Struct には、1 階層のネストを持つスカラー `ARRAY` サブフィールドを含めることができます。ネストされた `Struct`、`ArrayOfStruct`、および JSON サブフィールドは、どのバージョンでもサポートされていません。 |
| 容量 | `max_capacity` は必須で、1 つのエンティティが StructArray フィールドに格納できる Struct 要素数を制限します。 |
| サブフィールドの変更 | 既存の StructArray フィールドに、要素レベルの null を許可するサブフィールドを追加したり、サブフィールドを削除したりできます。 |
| サブフィールドパス | インデックス、検索対象、出力フィールド、フィルターには、`chunks[emb]` のような `structArray[subfield]` パスを使用します。`chunks.emb` は使用しないでください。 |
| 挿入の形状 | StructArray フィールドはオブジェクトの配列として挿入します。挿入ペイロード内ではパス構文を使用しないでください。 |
| ベクトルインデックス | ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスのみを受け付けます。EmbeddingList 検索と要素レベル検索には別々のベクトルサブフィールドを使用してください。 |
| 関数 | フィールド関数は、StructArray フィールド内のフィールドまたはサブフィールドではサポートされていません。 |
| nullable なフィールド | nullable な StructArray フィールドはバージョンによって制限されます。行レベルの null は StructArray フィールド全体に適用されます。サブフィールドでは、個々の Struct 要素で null 値を追加的に許可できます。スカラーまたはベクトルのサブフィールドでは `nullable=True`、配列のサブフィールドでは `element_nullable=True` を設定します。Struct 要素自体を null にすることはできません。 |
| フィールドの動的追加 | 既存のコレクションへの StructArray フィールドの追加はバージョンによって制限され、追加するフィールドは nullable である必要があります。 |


## スキーマの制限\{#schema-limits}

StructArray スキーマには次の制限があります。

| 制限 | 詳細 |
| --- | --- |
| Struct はトップレベルのフィールド型ではありません。 | StructArray フィールドは、`datatype=DataType.ARRAY`、`element_type=DataType.STRUCT`、および `struct_schema` を指定して作成します。 |
| すべての要素が 1 つのスキーマを共有します。 | StructArray フィールド内のすべての Struct 要素は、同じサブフィールドリストとサブフィールドデータ型に従います。 |
| `max_capacity` は必須です。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドに設定された `max_capacity` を超えてはなりません。 |
| スカラー `ARRAY` サブフィールドには、サブフィールドごとの `max_capacity` があります。 | スカラー `ARRAY` サブフィールドは、内部配列の `max_capacity` を宣言します。Zilliz Cloud は、内部配列がそのサブフィールドで宣言された容量を超える Struct 要素を拒否します。値はサブフィールド間で一致する必要はありません。値は 0 より大きく、`proxy.maxArrayCapacity`（デフォルトは 4096）を超えてはなりません。 |
| サブフィールドは進化できます。 | 要素レベルの null を許可するサブフィールドを追加するか、`chunks[lang]` のようなパスでサブフィールドを削除します。StructArray フィールドの最後のサブフィールド、コレクションの最後のベクトルフィールド、または Function で使用されているサブフィールドは削除できません。 |
| ネストされた Struct はサポートされていません。 | Struct には、ネストされた `Struct`、`ArrayOfStruct`、または JSON サブフィールドを含めることはできません。Struct には、1 階層のネストを持つスカラー `ARRAY` サブフィールドを含めることができます。`ARRAY` サブフィールドはベクトルを保持できません。 |
| StructArray 内では関数はサポートされていません。 | StructArray フィールドまたはそのサブフィールドにフィールド関数を定義しないでください。 |
| StructArray フィールドではフィールドプロパティが制限されます。 | StructArray フィールドまたはサブフィールドパスに対する `alter_collection_field()` は、`mmap.enabled`、`field.description`、および `warmup` のみを受け付けます。`max_capacity` や `max_length` などのその他のプロパティは拒否されます。 |
| サブフィールドではテキスト分析はサポートされていません。 | Struct サブフィールドに `enable_match` または `enable_analyzer` を設定すると拒否されます。テキストインデックスはトップレベルのフィールドにのみ作成されます。 |


スキーマ作成の例については、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

## サポートされるサブフィールドデータ型\{#supported-subfield-data-types}

StructArray のサブフィールドは、物理的な配列形式のストレージにマッピングされます。次の表に、サポートされている物理型とサポートされていない物理型を示します。

| Struct サブフィールドの物理型 | サポート | 備考 |
| --- | --- | --- |
| Array&lt;Bool&gt; | サポート対象 | サブフィールドを `DataType.BOOL` として定義します。 |
| Array&lt;Int8/Int16/Int32/Int64&gt; | サポート対象 | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| Array&lt;Float/Double&gt; | サポート対象 | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| Array&lt;VarChar&gt; | サポート対象 | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| ArrayOfVector&lt;FloatVector&gt; | サポート対象 | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Float16Vector&gt; | サポート対象 | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BFloat16Vector&gt; | サポート対象 | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Int8Vector&gt; | サポート対象 | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BinaryVector&gt; | サポート対象 | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;SparseFloatVector&gt; | サポート対象外 | スパースベクトルのサブフィールドは StructArray フィールドではサポートされていません。 |
| Array&lt;String&gt; | サポート対象外 | `String` ではなく `VARCHAR` を使用してください。 |
| Array&lt;JSON&gt; | サポート対象外 | JSON サブフィールドは StructArray フィールドではサポートされていません。 |
| Array&lt;Geometry&gt; | サポート対象外 | Geometry サブフィールドと GIS 関数は StructArray フィールドではサポートされていません。 |
| Array&lt;Text&gt; | サポート対象外 | Text サブフィールドは StructArray フィールドではサポートされていません。 |
| Array&lt;Timestamptz&gt; | サポート対象外 | Timestamptz サブフィールドと時間固有の式は StructArray フィールドではサポートされていません。 |
| Array&lt;Array&gt; | サポート対象 | サブフィールドを、スカラー `element_type` と内部配列の `max_capacity` を指定した `DataType.ARRAY` として定義します。各 Struct 要素は 1 つの内部配列を保持します。サブフィールドに `nullable=True` を設定すると null の内部配列を許可でき、`element_nullable=True` を設定すると内部配列内の null 値を許可できます。 |
| `Array` の `Array` の `Array`、ベクトルの `Array`、`Struct`、または `ArrayOfStruct` | サポート対象外 | Struct 内での配列のネストは 1 階層に制限され、内部配列はベクトルを保持できず、ネストされた Struct サブフィールドまたは Array-of-Struct サブフィールドはサポートされていません。 |


## Nullable と動的スキーマの制限\{#nullable-and-dynamic-schema-limits}

次の表では、nullable な StructArray の動作と StructArray フィールドの動的追加について、後述の可用性に関する記述を条件として説明します。

| 機能 | 制限 |
| --- | --- |
| nullable な StructArray フィールド | 後述の可用性に関する記述を条件として、StructArray の親に `nullable=True` を設定してください。Struct のサブフィールドを個別に nullable に設定しないでください。 |
| Python での NULL 値 | Python で null の StructArray 値を挿入するには `None` を使用します。`Null` や `null` は使用しないでください。 |
| null の適用範囲 | NULL は StructArray フィールド全体に適用されます。たとえば、`chunks=None` は `chunks` が nullable の場合にのみ有効です。 |
| 部分的に null の StructArray 値 | StructArray フィールドに有効な配列値が含まれている場合、同じ値の中で null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。 |
| 要素レベルの null | サポートされています。スカラー、ベクトル、または `ARRAY` サブフィールドでは、個々の Struct 要素で null 値を許可できます。スカラーまたはベクトルのサブフィールドでは `nullable=True`、`ARRAY` サブフィールドでは `element_nullable=True` を設定します。行レベルの `nullable` 設定は引き続き StructArray の親から取得されます。サブフィールドに `nullable=True` を設定すると、行レベルの null ではなく、要素レベルの null が有効になります。 |
| null の Struct 要素 | Struct 要素自体を null にすることはできません（例: `[null, {...}]`）。代わりに、その要素のサブフィールド値を null に設定してください。 |
| 省略されたサブフィールド | Struct 要素から要素レベルの null を許可するサブフィールドを省略でき、Zilliz Cloud はそのサブフィールドに null を格納します。要素レベルの null を許可しないサブフィールドは、すべての Struct 要素に存在する必要があります。 |
| StructArray フィールドの動的追加 | 後述の可用性に関する記述を条件とします。 |
| 動的追加における nullable の要件 | 既存のコレクションに追加される StructArray フィールドは、既存のエンティティが新しいフィールドの値を持たないため、nullable である必要があります。 |
| 動的追加後の既存エンティティ | 既存のエンティティは、追加された StructArray フィールドに対して `null` を返します。 |
| サブフィールドの動的追加 | サポートされています。追加するサブフィールドは `nullable=True` で作成する必要があります。追加する `ARRAY` サブフィールドでは、内部配列内の null 値のために `element_nullable=True` も指定します。既存のエンティティは、各 Struct 要素内の新しいサブフィールドに対して null を返し、StructArray フィールドが null のエンティティは null のままです。 |


Zilliz Cloud では、nullable な StructArray フィールドと StructArray フィールドの動的追加は On-Demand クラスターでサポートされています。動的に追加される StructArray フィールドは nullable である必要があります。Serving クラスターではこれらの機能はサポートされていません。nullable なベクトル配列は Zilliz Cloud クラスターではまだ利用できません。追加の機能については後述します。

要素レベルの null 値、スカラー `ARRAY` サブフィールド、および既存の StructArray フィールドへのサブフィールドの追加または削除は、Zilliz Cloud クラスターではまだ利用できません。


これらの機能は、Zilliz Cloud クラスターではまだ利用できません。


nullable な StructArray フィールドを使用した挿入例については、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

## 挿入の制限\{#insert-limits}

StructArray の挿入ペイロードには次の制限があります。

| 制限 | 詳細 |
| --- | --- |
| ペイロードの形状 | StructArray フィールドは、`chunks: [{"text": "...", "emb": [...]}]` のような Struct オブジェクトの配列として挿入します。 |
| サブフィールド名 | 各 Struct オブジェクト内では、`chunks[text]` のようなパスではなく、`text` や `emb` のようなサブフィールド名を使用します。 |
| スキーマの整合性 | 各 Struct 要素は Struct スキーマに一致する必要があります。要素レベルの null を許可するサブフィールドは、Struct 要素内で省略するか、`null` に設定できます。 |
| 容量 | 1 つのエンティティ内の Struct 要素数は `max_capacity` を超えてはなりません。 |
| ベクトル次元 | ベクトル値は、それぞれのベクトルサブフィールドに設定された `dim` と一致している必要があります。 |
| 検索モードの重複 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドにベクトルを書き込みます。 |


## インデックスとメトリクスの制限\{#index-and-metric-limits}

StructArray のベクトルサブフィールドには、EmbeddingList 検索または要素レベル検索のいずれか一方で使用するインデックスを作成できます。各ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスのみを受け付けるため、同じベクトルサブフィールドで両方のメトリクスファミリーを使用することはできません。検索モードでは次のメトリクスファミリーを使用します。

| 検索モード | メトリクスファミリー | 結果レベル |
| --- | --- | --- |
| EmbeddingList 検索 | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2`、またはバイナリ `MAX_SIM_*` メトリクス | エンティティレベルの結果。 |
| 要素レベル検索 | `L2`、`IP`、`COSINE`、`HAMMING`、`JACCARD` などの通常のベクトルメトリクス | 一致した要素のオフセットを含めることができる要素レベルの結果。 |

両方のモードが必要な場合は、別々のベクトルサブフィールドを使用します。たとえば、EmbeddingList 検索には `chunks[emb_list_vector]` を、要素レベル検索には `chunks[emb]` を使用します。

StructArray のベクトルサブフィールドは、デフォルトが 10 のコレクションレベルの制限 `proxy.maxVectorFieldNum` に対してベクトルフィールドとしてカウントされます。ベクトルサブフィールドがコレクションの唯一のベクトルフィールドである StructArray フィールドは有効であり、そのようなフィールドを削除するとコレクションにベクトルフィールドがなくなる場合は削除が拒否されます。ベクトルフィールドとベクトルサブフィールドの合計数を、対象バージョンとサービス階層の制限内に保ってください。

要素レベルの null を許可するベクトルサブフィールドは、通常のベクトルメトリクスを使用した要素レベル検索のみをサポートします。要素レベルの null を許可するベクトルサブフィールドでは、`MAX_SIM*` メトリクス、EmbeddingList インデックス、および EmbeddingList 検索は拒否され、`AUTOINDEX` はそれらのために `MAX_SIM*` メトリクスを選択しません。null のベクトルは検索に参加しません。スカラーインデックスは、要素レベルの null を許可するサブフィールドまたはスカラー `ARRAY` サブフィールドではサポートされていません。


サポートされるインデックス種別とメトリクス種別の対応表については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

## 検索の制限\{#search-limits}

StructArray の検索動作には次の制限があります。

| 検索動作 | サポートと制限 |
| --- | --- |
| 基本的な EmbeddingList 検索 | `MAX_SIM*` メトリクスでインデックスが作成された StructArray のベクトルサブフィールドでサポートされます。エンティティレベルの結果を返します。 |
| 基本的な要素レベル検索 | 通常のベクトルメトリクスでインデックスが作成された StructArray のベクトルサブフィールドでサポートされます。一致した要素のオフセットを返すことができます。 |
| 範囲検索 | 対象バージョンの検索モードおよびインデックス/metric のサポート状況に応じてサポートされます。要素レベルの StructArray リクエストにおけるハイブリッド検索の範囲検索動作については、対象バージョンを確認してください。 |
| グループ化検索 | 要素レベルのグループ化検索はオフセットを返すことができます。要素レベルの StructArray リクエストにおけるハイブリッド検索のグループ化の動作はバージョンによって制限されます。 |
| ハイブリッド検索 | ハイブリッド検索リクエストには、対象バージョンがその検索の組み合わせをサポートしている場合にのみ、StructArray のベクトルサブフィールドのリクエストを含めることができます。各リクエストは、引き続きインデックスが作成されたベクトルサブフィールドのメトリクスファミリーに従います。 |
| オフセットの出力 | オフセットは要素レベルの検索結果で利用できます。EmbeddingList 検索はエンティティレベルの結果を返し、主要な結果単位として要素のオフセットを使用しません。 |

## フィルターと演算子の制限\{#filter-and-operator-limits}

StructArray のスカラーフィルタリングは、`element_filter` や `MATCH_*` ファミリーなどの StructArray 演算子によって処理されます。詳細な述語のサポート対応表は、[StructArray 演算子](./struct-array-filtering) にあります。

概要は次のとおりです。

- `$[subfield]` は StructArray 演算子の内部でのみ使用します。

- 行レベルのフィルター式では、StructArray のパスを直接参照することもできます。1 つの要素位置には `chunks[0][section]`、要素数には `array_length(chunks)`、要素全体にわたるサブフィールド値には `array_contains(chunks[section], ...)`、nullable な StructArray フィールドには `chunks is null` を使用できます。

- スカラー述語にはスカラーサブフィールドを使用します。

- `$[...]` のスカラー述語入力としてベクトルサブフィールドを使用しないでください。

- JSON パス構文、JSON 関数、テキストマッチ関数、Geometry / GIS 関数、および Timestamptz 式は、StructArray の要素レベルの述語ではサポートされていません。`array_contains`、`array_contains_any`、`array_contains_all`、および `array_length` は、スカラー `ARRAY` サブフィールドの `$[subfield]` でサポートされ、`$[subfield] is null` / `is not null` はすべてのサブフィールド型でサポートされています。


- Struct 要素内のサブフィールド値が null の場合、要素の述語は false ではなく不明になります。`element_filter` は述語が true の要素のみを保持し、`MATCH_*` は不明な要素をミスとしてカウントします。詳細については、[StructArray 演算子](./struct-array-filtering) を参照してください。


- 裸の boolean 式ではなく、`$[has_code] == true` のような明示的な boolean 比較を優先してください。

<a id="Import-limits"></a>

## インポートとストレージの制限\{#import-and-storage-limits}

| 制限 | 詳細 |
| --- | --- |
| ソースファイルの形式 | JSON、JSONL、CSV、および Parquet ファイルは StructArray フィールドを格納できます。NumPy ファイルはトップレベルのフィールドごとに 1 ファイルを保持し、StructArray データを提供できません。StructArray フィールドを持つコレクションには、JSON、CSV、または Parquet ファイルを使用してください。ファイルの形状については、[ソースデータを準備する](./import-data-via-sdks#structarray-fields-in-source-files) を参照してください。 |
| バックアップとスナップショットのインポート | バックアップの復元などの Binlog インポート、およびスナップショットソースのインポートは、要素レベルの null を許可するサブフィールドまたはスカラー `ARRAY` サブフィールドを持つコレクションでは拒否されます。 |


## 関連ページ\{#related-pages}

1. StructArray フィールドを作成するには、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

2. データを挿入するには、[StructArray フィールドにデータを挿入する](./insert-struct-array) を参照してください。

3. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

4. StructArray のフィルター構文を確認するには、[StructArray 演算子](./struct-array-filtering) を参照してください。

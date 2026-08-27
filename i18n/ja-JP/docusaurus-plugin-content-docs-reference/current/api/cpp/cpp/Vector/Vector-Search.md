---
title: "Search() | Cloud"
slug: /cpp/cpp/Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "指定されたパラメータに基づいてコレクションを検索し、結果を返します。 | Cloud"
type: docx
token: QAA0daStropumHxwdk2cN4LUnPg
sidebar_position: 8
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - cloud
  - Search()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Search()

指定されたパラメータに基づいてコレクションを検索し、結果を返します。

```c++
Status Search(const SearchRequest& request, SearchResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = SearchRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .AddPartitionName(partition_name)
    .WithOutputFields(output_field_names)
    .AddOutputField(output_field)
    .WithConsistencyLevel(consistency_level)
    .AddBinaryVector(vector)
    .AddFloatVector(vector)
    .AddSparseVector(vector)
    .AddFloat16Vector(vector)
    .AddBFloat16Vector(vector)
    .AddEmbeddedText(text)
    .AddInt8Vector(vector)
    .AddEmbeddingList(emb_list)
    .WithBinaryVectors(vectors)
    .WithFloatVectors(vectors)
    .WithSparseVectors(vectors)
    .WithFloat16Vectors(vectors)
    .WithBFloat16Vectors(vectors)
    .WithEmbeddedTexts(texts)
    .WithInt8Vectors(vectors)
    .WithEmbeddingLists(emb_lists)
    .WithIDs(id_array)
    .WithMetricType(metric_type)
    .AddExtraParam(key, value)
    .WithExtraParams(params)
    .WithLimit(limit)
    .WithFilter(filter)
    .WithAnnsField(ann_field)
    .AddFilterTemplate(key, filter_template)
    .WithFilterTemplates(filter_templates)
    .WithOffset(offset)
    .WithRoundDecimal(round_decimal)
    .WithIgnoreGrowing(ignore_growing)
    .WithGroupByField(field_name)
    .WithGroupSize(group_size)
    .WithStrictGroupSize(strict_group_size)
    .WithRadius(radius)
    .WithRangeFilter(filter)
    .WithRerank(ranker)
    .WithTimezone(timezone)
    .WithHighlighter(highlighter)
    .WithSearchAggregation(aggregation)
    .WithOrderByFields(order_by_fields)
    .AddOrderByField(order_by_field);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。パーティション名が空の場合、コレクション全体に対して検索が実行されます。

- `AddPartitionName(const std::string& partition_name)`

    パーティション名を追加します。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    出力フィールド名を設定します。

- `AddOutputField(const std::string& output_field)`

    出力フィールドを追加します。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    整合性レベルを設定します。詳細はドキュメントを参照してください: https://milvus.io/docs/consistency.md#Consistency-Level.

- `AddBinaryVector(const std::string& vector)`

    検索リクエストにバイナリベクトルを追加します。このメソッドは文字列配列を uint8 配列に自動変換します。

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    検索リクエストに float ベクトルを追加します。

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    検索リクエストにスパースベクトルを追加します。

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    検索リクエストに float16 ベクトルを追加します。

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    検索リクエストに bfloat16 ベクトルを追加します。

- `AddEmbeddedText(const std::string& text)`

    検索リクエストにテキストを追加します。BM25 関数でのみ有効です。

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    検索リクエストに int8 ベクトルを追加します。

- `AddEmbeddingList(EmbeddingList&& emb_list)`

    構造体フィールドに対する検索リクエストに埋め込みリストを追加します。

- `WithBinaryVectors(const std::vector<std::string>& vectors)`

    検索リクエストにバイナリベクトルを設定します。このメソッドは文字列配列を uint8 配列に自動変換します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    検索リクエストに float ベクトルを設定します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    検索リクエストにスパースベクトルを設定します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    検索リクエストに float16 ベクトルを設定します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    検索リクエストに bfloat16 ベクトルを設定します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithEmbeddedTexts(std::vector<std::string>&& texts)`

    検索リクエストにテキストを設定します。BM25 関数でのみ有効です。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    検索リクエストに int8 ベクトルを設定します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithEmbeddingLists(std::vector<EmbeddingList>&& emb_lists)`

    構造体フィールドに対する検索リクエストに埋め込みリストを設定します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithIDs(std::vector<int64_t>&& id_array)`

    検索対象とするベクトルに対応する整数プライマリキーを設定します。注意: ID と対象ベクトルを同時に指定することはできません。

- `WithMetricType(::milvus::MetricType metric_type)`

    メトリックタイプを指定します。

- `AddExtraParam(const std::string& key, const std::string& value)`

    "nlist" や "ef" などの追加パラメータを設定します。

- `WithExtraParams(const std::unordered_map<std::string, std::string>& params)`

    "nlist" や "ef" などの追加パラメータを設定します。

- `WithLimit(int64_t limit)`

    検索上限 (topk) を設定します。注意: この値は ExtraParams に格納されます。

- `WithFilter(std::string filter)`

    フィルタ式を設定します。

- `WithAnnsField(const std::string& ann_field)`

    ANN 検索の対象フィールドを設定します。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    フィルタ式内のプレースホルダに値を 1 つ追加します。これはリクエストに空でないフィルタが含まれる場合にのみ使用され、大きなリテラル値の繰り返しパースを回避するために利用します。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルタ式で使用されるすべてのプレースホルダ値を置き換えます。キーは \{age\} や \{city\} などのプレースホルダに対応し、値にはブール値、数値、文字列、または配列データを指定できます。

- `WithOffset(int64_t offset)`

    オフセット値を設定します。注意: この値は ExtraParams に格納されます。

- `WithRoundDecimal(int64_t round_decimal)`

    小数点以下の丸め桁数を設定します。

- `WithIgnoreGrowing(bool ignore_growing)`

    成長無視フラグを設定します。

- `WithGroupByField(const std::string& field_name)`

    グループ化フィールド値を設定します。

- `WithGroupSize(int64_t group_size)`

    グループサイズ値を設定します。

- `WithStrictGroupSize(bool strict_group_size)`

    厳密なグループサイズフラグを設定します。

- `WithRadius(double radius)`

    範囲半径を設定します。注意: この値は ExtraParams に格納されます。

- `WithRangeFilter(double filter)`

    範囲フィルタを設定します。注意: この値は ExtraParams に格納されます。

- `WithRerank(const FunctionScorePtr& ranker)`

    リランカーを設定します。Boost/Decay/Model, など、複数のリランク関数を指定できます。詳細はドキュメントを参照してください: https://milvus.io/docs/boost-ranker.md.

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに対して有効です。詳細はドキュメントを参照してください: https://milvus.io/docs/single-vector-search.md#Temporarily-set-a-timezone-for-a-search.

- `WithHighlighter(const HighlighterPtr& highlighter)`

    ハイライターを設定します。

- `WithSearchAggregation(const SearchAggregationPtr& aggregation)`

    検索集計設定を行います。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    検索結果のソートに使用するフィールドを設定します。

- `AddOrderByField(OrderByField order_by_field)`

    検索結果のソートに使用するフィールドを追加します。

### クエリベクトルの型\{#query-vector-types}

リクエストでは、対象フィールドの [DataType](./Collections-DataType) に一致するクエリベクトル表現を 1 つ受け入れます。対応する add メソッドまたはバッチビルダーメソッドを使用してください。これらはクエリ入力であり、コレクションのカラムペイロードではありません。

| スキーマ DataType | リクエストメソッド | C++ での表現 | 備考 |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | `AddFloatVector()`, `WithFloatVectors()` | `std::vector<float>` | 密な float ベクトル。 |
| `BINARY_VECTOR` | `AddBinaryVector()`, `WithBinaryVectors()` | バイナリバイトまたは文字列による簡易入力 | 専用のバイナリベクトル表現を使用します。 |
| `SPARSE_FLOAT_VECTOR` | `AddSparseVector()`, `WithSparseVectors()` | `std::map<uint32_t, float>` またはサポートされている JSON 形式 | スパースなインデックスと値のペア。 |
| `FLOAT16_VECTOR` | `AddFloat16Vector()`, `WithFloat16Vectors()` | `std::vector<uint16_t>` または変換可能な float ベクトル | float オーバーロードにより変換が実行されます。 |
| `BFLOAT16_VECTOR` | `AddBFloat16Vector()`, `WithBFloat16Vectors()` | `std::vector<uint16_t>` または変換可能な float ベクトル | float オーバーロードにより変換が実行されます。 |
| `INT8_VECTOR` | `AddInt8Vector()`, `WithInt8Vectors()` | `std::vector<int8_t>` | 密な符号付きバイトベクトル。 |
| 関数または構造体フィールドの入力 | `AddEmbeddedText()` / `WithEmbeddedTexts()`; `AddEmbeddingList()` / `WithEmbeddingLists()` | `std::string` または `EmbeddingList` | サポートされている関数には埋め込みテキストを、構造体フィールドの ANN 検索には埋め込みリストを使用します。 |

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドのカラムベースデータを表すテンプレートクラスです。具体的なエイリアスがサポート対象のすべてのデータ型に対応しています。`InsertRequest::WithRowsData()` を使用してデータを挿入する場合や、`QueryResults::OutputField()` および `SingleResult::OutputField()` を使用してクエリ/search結果を読み取る際に、これらの具象型のインスタンスが使用されます。

```c++
// Base abstract interface (not instantiated directly)
class Field {
    const std::string& Name() const;
    DataType Type() const;
    DataType ElementType() const;   // for ARRAY fields only
    virtual size_t Count() const = 0;
    virtual void Reserve(size_t count) = 0;
};

using FieldDataPtr = std::shared_ptr<Field>;

// Template class
template <typename T, DataType Dt>
class FieldData : public Field {
    explicit FieldData(std::string name);
    FieldData(std::string name, const std::vector<T>& data);
    FieldData(std::string name, const std::vector<T>& data, const std::vector<bool>& valid_data);

    StatusCode Add(const T& element);
    StatusCode AddNull();
    StatusCode Append(const std::vector<T>& elements);
    size_t Count() const;
    void Reserve(size_t count);
    virtual const std::vector<T>& Data() const;
    virtual T Value(size_t i) const;
    virtual bool IsNull(size_t i) const;
    virtual const std::vector<bool>& ValidData() const;
};
```

### EmbeddingList\{#embeddinglist}

このクラスは同じ型の 1 つ以上のクエリベクトルを保持し、`SearchRequest`、`SubSearchRequest`、または `AddEmbeddingList()` を介した構造体フィールド ANN 検索の対象ベクトルとして使用されます。Add*/Set* メソッドを呼び出して `EmbeddingList` を構築し、それを `SearchRequestBase::AddEmbeddingList()` に渡します。

```c++
EmbeddingList list;
```

**メソッド:**

**読み取りメソッド:**

- `FieldDataPtr TargetVectors() const`

    すべてのベクトルを含む基盤となるフィールドデータを返します。

- `size_t Count() const`

    追加されたベクトルの数を返します。

- `int64_t Dim() const`

    ベクトルの次元数を返します。埋め込みテキストモードの場合、値は `0` となります。

**単一ベクトル追加メソッド:**

- `Status AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    密な float ベクトルを 1 つ追加します。

- `Status AddBinaryVector(const std::string& vector)`

    バイナリベクトルを 1 つ追加します。文字列オーバーロードは文字列をバイナリバイトに変換します。

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    バイナリベクトルを 1 つ追加します。文字列オーバーロードは文字列をバイナリバイトに変換します。

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパースベクトルを 1 つ追加します。

- `Status AddSparseVector(const nlohmann::json& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパースベクトルを 1 つ追加します。

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを 1 つ追加します。float ベクトルオーバーロードは値を float16 に変換します。

- `Status AddFloat16Vector(const std::vector<float>& vector)` — float から float16 への自動変換

    float16 ベクトルを 1 つ追加します。float ベクトルオーバーロードは値を float16 に変換します。

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを 1 つ追加します。float ベクトルオーバーロードは値を bfloat16 に変換します。

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — float から bfloat16 への自動変換

    bfloat16 ベクトルを 1 つ追加します。float ベクトルオーバーロードは値を bfloat16 に変換します。

- `Status AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    密な int8 ベクトルを 1 つ追加します。

- `Status AddEmbeddedText(const std::string& text)` — BM25 テキスト埋め込み用

    BM25 など、サポートされているテキスト埋め込み関数用のテキストを追加します。

**バッチ設定メソッド（リストのリセット）:**

- `Status SetFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    現在のリストを密な float ベクトルで置き換えます。

- `Status SetBinaryVectors(const std::vector<std::string>& vectors)`

    現在のリストをバイナリベクトルで置き換えます。

- `Status SetBinaryVectors(std::vector<BinaryVecFieldData::ElementT>&& vectors)`

    現在のリストをバイナリベクトルで置き換えます。

- `Status SetSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    現在のリストをスパースベクトルで置き換えます。

- `Status SetSparseVectors(const std::vector<nlohmann::json>& vectors)`

    現在のリストをスパースベクトルで置き換えます。

- `Status SetFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    現在のリストを float16 ベクトルで置き換えます。該当する場合、float 入力は自動的に変換されます。

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを float16 ベクトルで置き換えます。該当する場合、float 入力は自動的に変換されます。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    現在のリストを bfloat16 ベクトルで置き換えます。該当する場合、float 入力は自動的に変換されます。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを bfloat16 ベクトルで置き換えます。該当する場合、float 入力は自動的に変換されます。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    現在のリストを密な int8 ベクトルで置き換えます。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — BM25 テキスト埋め込み用

    現在のリストをサポートされている埋め込み関数用のテキスト入力で置き換えます。

### SearchResults\{#searchresults}

`SearchResponse::Results()` は、検索呼び出し全体に対して 1 つの `SearchResults` オブジェクトを返します。`SearchResults` には各クエリベクトルに対応する `SingleResult` が含まれており、クエリベクトルの順序が維持されます。

このクラスは、`SearchResponse` または `HybridSearchResponse` に対して `Results()` を呼び出すことで取得できます。

```c++
SearchResults();
explicit SearchResults(std::vector<SingleResult>&& results);
```

**メソッド:**

- `const std::vector<SingleResult>& Results() const`

    リクエストにベクトルが追加された順序と同じ順序で、クエリベクトルごとに 1 つの `SingleResult` を返します。

- `const std::vector<float>& Recalls() const`

    クエリベクトルごとの再現率値です。Zilliz Cloud インスタンス上で `enable_recall_calculation` が `true` に設定された状態で検索が実行された場合にのみ値が設定されます。それ以外の場合、ベクトルは空になります。

#### SingleResult\{#singleresult}

`SingleResult` には、1つのクエリベクトルに対するトップk件のヒット結果が、スコア、プライマリキー、および要求された出力フィールドとともに格納されます。`SearchResults` は、これらのクエリごとの結果を保持する外側のコレクションです。

```c++
struct SingleResult {
    SingleResult(const std::string& pk_name, const std::string& score_name,
                 std::vector<FieldDataPtr>&& output_fields,
                 const std::set<std::string>& output_names);
};

using SingleResultPtr = std::shared_ptr<SingleResult>;
```

**メソッド:**

- `const std::vector<float>& Scores() const`

    このクエリベクトルに対する類似度スコアまたは距離を返します。

- `IDArray Ids() const`

    ヒットした結果のプライマリキー値を返します。プライマリキーフィールドの型を維持する必要がある場合は、OutputField() の使用を推奨します。

- `const std::string& PrimaryKeyName() const`

    サーバーから報告されたプライマリキーフィールド名を返します。

- `const std::string& ScoreName() const`

    衝突回避用のプレフィックスを含む、結果のスコアフィールド名を返します。

- `FieldDataPtr OutputField(const std::string& name) const`

    指定された名前の出力フィールドを1つ返します。テンプレートオーバーロードにより、要求された具体的な FieldData 型にキャストされます。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    要求されたすべての出力フィールドを FieldDataPtr 値として返します。

- `const std::set<std::string>& OutputFieldNames() const`

    要求された出力フィールドの名前一覧を返します。

- `Status OutputRows(EntityRows& rows) const`

    すべてのヒット結果を行指向のエンティティデータとして実体化します。

- `Status OutputRow(int i, EntityRow& row) const`

    0始まりのインデックスを指定して、単一のヒット結果を実体化します。

- `uint64_t GetRowCount() const`

    この結果に含まれるヒット数を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、通信、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

#### 出力フィールドの型\{#output-field-types}

要求されたエンティティフィールドは `FieldDataPtr` を通じて返されます。具体的な `XxxFieldData` の型は、フィールドのスキーマ [DataType](./Collections-DataType) に依存します。ベースポインタとして使用する場合は `OutputField(name)` を、型チェック付きの共有ポインタキャストを行う場合は `OutputField<T>(name)` を使用してください。

ポインタの規約は `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>` です。この結果表現形式は検索インターフェースとクエリインターフェースで共通であり、ポインタエイリアスが個別のAPIページとして分離されることはありません。

### FunctionScore\{#functionscore}

このクラスは、リランキング関数オブジェクトのリストと、オプションの追加パラメータを保持します。`FunctionScorePtr`（`std::shared_ptr<FunctionScore>`）を `SearchArguments::WithFunctionScore()` または `HybridSearchRequest::WithFunctionScore()` に渡してください。`HybridSearch` の場合は RRF または Weighted 関数を、`Search` の場合は Boost、Decay、または Model 関数を使用します。関数サブクラスの詳細については、Function を参照してください。

```c++
using FunctionScorePtr = std::shared_ptr<FunctionScore>;

auto score = FunctionScore()
    .WithFunctions(functions)
    .AddFunction(function_ptr)
    .WithParams(params)
    .AddParam(key, value);
```

**メソッド:**

- `FunctionScore& WithFunctions(std::vector<FunctionPtr>&& functions)`

    リランキング関数のリストを置き換えます。

- `FunctionScore& AddFunction(const FunctionPtr& function)`

    リランキング関数を1つ追加します。

- `FunctionScore& WithParams(std::unordered_map<std::string, nlohmann::json>&& params)`

    リランキング関数で使用される追加パラメータマップを置き換えます。

- `FunctionScore& AddParam(const std::string& key, nlohmann::json&& param)`

    リランキングパラメータを1つ追加または更新します。

- `const std::vector<FunctionPtr>& Functions() const`

    設定されているリランキング関数を返します。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const`

    設定されているリランキングパラメータを返します。

## 例\{#example}

C++ SDK を使用した Search() の実行例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::SearchRequest();
milvus::SearchResponse response;
util::CheckStatus(client->Search(request, response));
```

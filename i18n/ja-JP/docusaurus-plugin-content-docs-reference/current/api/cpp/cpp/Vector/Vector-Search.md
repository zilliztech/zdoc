---
title: "Search() | クラウド"
slug: /cpp/cpp/Vector-Search
sidebar_label: "Search()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "指定されたパラメーターに基づいてコレクションを検索し、結果を返します。 | クラウド"
type: docx
token: QAA0daStropumHxwdk2cN4LUnPg
sidebar_position: 8
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - クラウド
  - Search()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Search()

指定されたパラメーターに基づいてコレクションを検索し、結果を返します。

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
    .WithFunctionChains(function_chains)
    .AddFunctionChain(function_chain)
    .WithTimezone(timezone)
    .WithHighlighter(highlighter)
    .WithSearchAggregation(aggregation)
    .WithOrderByFields(order_by_fields)
    .AddOrderByField(order_by_field);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースを使用します。

- `WithCollectionName(const std::string& collection_name)`

    コレクションの名前を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。パーティション名が空の場合は、コレクション全体をクエリします。

- `AddPartitionName(const std::string& partition_name)`

    パーティション名を追加します。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    出力フィールド名を設定します。

- `AddOutputField(const std::string& output_field)`

    出力フィールドを追加します。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    整合性レベルを設定します。詳細は、[整合性レベル](/docs/consistency-level) を参照してください。

- `AddBinaryVector(const std::string& vector)`

    検索リクエストにバイナリベクトルを追加します。このメソッドは、文字列配列を uint8 配列に自動変換します。

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    検索リクエストに float ベクトルを追加します。

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    検索リクエストにスパースベクトルを追加します。

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    検索リクエストに float16 ベクトルを追加します。

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    検索リクエストに bfloat16 ベクトルを追加します。

- `AddEmbeddedText(const std::string& text)`

    検索リクエストにテキストを追加します。BM25 関数でのみ機能します。

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    検索リクエストに int8 ベクトルを追加します。

- `AddEmbeddingList(EmbeddingList&& emb_list)`

    構造体フィールドの検索リクエストに埋め込みリストを追加します。

- `WithBinaryVectors(const std::vector<std::string>& vectors)`

    検索リクエストにバイナリベクトルを割り当てます。このメソッドは、文字列配列を uint8 配列に自動変換します。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    検索リクエストに float ベクトルを割り当てます。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    検索リクエストにスパースベクトルを割り当てます。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    検索リクエストに float16 ベクトルを割り当てます。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    検索リクエストに bfloat16 ベクトルを割り当てます。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithEmbeddedTexts(std::vector<std::string>&& texts)`

    検索リクエストにテキストを割り当てます。BM25 関数でのみ機能します。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    検索リクエストに int8 ベクトルを割り当てます。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithEmbeddingLists(std::vector<EmbeddingList>&& emb_lists)`

    構造体フィールドの検索リクエストに埋め込みリストを割り当てます。注：このメソッドはリクエストのベクトルリストをリセットします。

- `WithIDs(std::vector<int64_t>&& id_array)`

    ベクトルが検索対象として使用される整数の主キーを設定します。注：ID と対象ベクトルは同時に指定できません。

- `WithMetricType(::milvus::MetricType metric_type)`

    メトリクスタイプを指定します。

- `AddExtraParam(const std::string& key, const std::string& value)`

    "nlist"、"ef" などの追加パラメーターを追加します。

- `WithExtraParams(const std::unordered_map<std::string, std::string>& params)`

    "nlist"、"ef" などの追加パラメーターを追加します。

- `WithLimit(int64_t limit)`

    検索制限（topk）を設定します。注：この値は ExtraParams に格納されます。

- `WithFilter(std::string filter)`

    フィルター式を設定します。

- `WithAnnsField(const std::string& ann_field)`

    ANN 検索の対象フィールドを設定します。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    フィルター式内のプレースホルダーに1つの値を追加します。これは、リクエストに空でないフィルターがある場合にのみ使用され、大きなリテラル値の繰り返し解析を回避します。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルター式で使用されるすべてのプレースホルダー値を置き換えます。キーは \{age\} や \{city\} などのプレースホルダーに対応し、値はブール値、数値、文字列、または配列データにできます。

- `WithOffset(int64_t offset)`

    オフセット値を設定します。注：この値は ExtraParams に格納されます。

- `WithRoundDecimal(int64_t round_decimal)`

    小数の丸め値を設定します。

- `WithIgnoreGrowing(bool ignore_growing)`

    growing を無視するフラグを設定します。

- `WithGroupByField(const std::string& field_name)`

    グループ化するフィールド値を設定します。

- `WithGroupSize(int64_t group_size)`

    グループサイズ値を設定します。

- `WithStrictGroupSize(bool strict_group_size)`

    厳密なグループサイズフラグを設定します。

- `WithRadius(double radius)`

    範囲の半径を設定します。注：この値は ExtraParams に格納されます。

- `WithRangeFilter(double filter)`

    範囲フィルターを設定します。注：この値は ExtraParams に格納されます。

- `WithRerank(const FunctionScorePtr& ranker)`

    リランカーを設定します。Boost/Decay/Model, などの複数のリランク関数を使用できます。詳細は、[Boost Ranker](/docs/boost-ranker) と関連ページを参照してください。

- `WithFunctionChains(std::vector<FunctionChain>&& function_chains)`

    検索結果の後処理に使用する関数チェーンを設定します。関数チェーンとリランクは同時に使用できません。詳細は、[FunctionChain](./Vector-FunctionChain) を参照してください。

- `AddFunctionChain(const FunctionChain& function_chain)`

    検索結果の後処理に使用する関数チェーンを追加します。関数チェーンとリランクは同時に使用できません。

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに有効です。検索の詳細は、[タイムゾーンを一時的に設定する](/docs/single-vector-search#temporarily-set-a-timezone-for-a-search) を参照してください。

- `WithHighlighter(const HighlighterPtr& highlighter)`

    ハイライターを設定します。

- `WithSearchAggregation(const SearchAggregationPtr& aggregation)`

    検索集計設定を指定します。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    検索結果の並べ替えに使用するフィールドを設定します。

- `AddOrderByField(OrderByField order_by_field)`

    検索結果の並べ替えに使用するフィールドを追加します。

### クエリベクトルの型\{#query-vector-types}

リクエストは、対象フィールドの [DataType](./Collections-DataType) に一致するクエリベクトル表現を1つ受け入れます。対応する追加メソッドまたはバッチビルダーメソッドを使用してください。これらはクエリ入力であり、コレクションの列ペイロードではありません。

| スキーマ DataType | リクエストメソッド | C++ 表現 | 注記 |
| --- | --- | --- | --- |
| FLOAT_VECTOR | AddFloatVector(), WithFloatVectors() | std::ベクトル&lt;float&gt; | 密な float ベクトル。 |
| BINARY_VECTOR | AddBinaryVector(), WithBinaryVectors() | Binary bytes or string convenience input | 専用のバイナリベクトル表現を使用します。 |
| SPARSE_FLOAT_VECTOR | AddSparseVector(), WithSparseVectors() | std::map\<uint32_t, float> or supported JSON form | スパースなインデックスと値のペア。 |
| FLOAT16_VECTOR | AddFloat16Vector(), WithFloat16Vectors() | std::ベクトル&lt;uint16_t&gt; or convertible float ベクトル | float オーバーロードは変換を実行します。 |
| BFLOAT16_VECTOR | AddBFloat16Vector(), WithBFloat16Vectors() | std::ベクトル&lt;uint16_t&gt; or convertible float ベクトル | float オーバーロードは変換を実行します。 |
| INT8_VECTOR | AddInt8Vector(), WithInt8Vectors() | std::ベクトル&lt;int8_t&gt; | 密な符号付きバイトベクトル。 |
| 関数または構造体フィールドの入力 | AddEmbeddedText() / WithEmbeddedTexts(); AddEmbeddingList() / WithEmbeddingLists() | std::string or EmbeddingList | サポートされている関数には埋め込みテキストを、構造体フィールドの ANN 検索には埋め込みリストを使用します。 |

**戻り値：**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

これは、単一フィールドの列ベースデータを表すテンプレートクラスです。具象エイリアスは、サポートされているすべてのデータ型をカバーします。具象型のインスタンスは、`InsertRequest::WithRowsData()` を介してデータを挿入するとき、または `QueryResults::OutputField()` と `SingleResult::OutputField()` を介して query/search 結果を読み取るときに使用されます。

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

このクラスは、同じ型の1つ以上のクエリベクトルを保持し、`SearchRequest`、`SubSearchRequest`、または `AddEmbeddingList()` を介した構造体フィールドの ANN 検索の対象ベクトルとして使用されます。Add*/Set* メソッドを呼び出して `EmbeddingList` を作成し、それを `SearchRequestBase::AddEmbeddingList()` に渡します。

```c++
EmbeddingList list;
```

**メソッド：**

**読み取りメソッド：**

- `FieldDataPtr TargetVectors() const`

    すべてのベクトルを含む基になるフィールドデータを返します。

- `size_t Count() const`

    追加されたベクトルの数を返します。

- `int64_t Dim() const`

    ベクトルの次元を返します。埋め込みテキストモードでは、値は `0` です。

**単一ベクトル追加メソッド：**

- `Status AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    密な float ベクトルを1つ追加します。

- `Status AddBinaryVector(const std::string& vector)`

    バイナリベクトルを1つ追加します。文字列オーバーロードは、文字列をバイナリバイトに変換します。

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    バイナリベクトルを1つ追加します。文字列オーバーロードは、文字列をバイナリバイトに変換します。

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパースベクトルを1つ追加します。

- `Status AddSparseVector(const nlohmann::json& vector)`

    インデックスと値のデータ、またはサポートされている JSON 表現からスパースベクトルを1つ追加します。

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを1つ追加します。float ベクトルのオーバーロードは、値を float16 に変換します。

- `Status AddFloat16Vector(const std::vector<float>& vector)` — auto-converts float to float16

    float16 ベクトルを1つ追加します。float ベクトルのオーバーロードは、値を float16 に変換します。

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを1つ追加します。float ベクトルのオーバーロードは、値を bfloat16 に変換します。

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — auto-converts float to bfloat16

    bfloat16 ベクトルを1つ追加します。float ベクトルのオーバーロードは、値を bfloat16 に変換します。

- `Status AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    密な int8 ベクトルを1つ追加します。

- `Status AddEmbeddedText(const std::string& text)` — for BM25 text-embedding

    BM25 などのサポートされているテキスト埋め込み関数のテキストを追加します。

**バッチ設定メソッド（リストをリセット）：**

- `Status SetFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    現在のリストを密な float ベクトルに置き換えます。

- `Status SetBinaryVectors(const std::vector<std::string>& vectors)`

    現在のリストをバイナリベクトルに置き換えます。

- `Status SetBinaryVectors(std::vector<BinaryVecFieldData::ElementT>&& vectors)`

    現在のリストをバイナリベクトルに置き換えます。

- `Status SetSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    現在のリストをスパースベクトルに置き換えます。

- `Status SetSparseVectors(const std::vector<nlohmann::json>& vectors)`

    現在のリストをスパースベクトルに置き換えます。

- `Status SetFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    現在のリストを float16 ベクトルに置き換えます。該当する場合、float 入力は変換されます。

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — auto-converts

    現在のリストを float16 ベクトルに置き換えます。該当する場合、float 入力は変換されます。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    現在のリストを bfloat16 ベクトルに置き換えます。該当する場合、float 入力は変換されます。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — auto-converts

    現在のリストを bfloat16 ベクトルに置き換えます。該当する場合、float 入力は変換されます。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    現在のリストを密な int8 ベクトルに置き換えます。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — for BM25 text-embedding

    現在のリストを、サポートされている埋め込み関数のテキスト入力に置き換えます。

### SearchResults\{#searchresults}

`SearchResponse::Results()` は、検索呼び出し全体に対して1つの `SearchResults` オブジェクトを返します。`SearchResults` は、クエリベクトルの順序を維持しながら、クエリベクトルごとに1つの `SingleResult` を含みます。

このクラスは、`SearchResponse` または `HybridSearchResponse` で `Results()` を呼び出すことによって返されます。

```c++
SearchResults();
explicit SearchResults(std::vector<SingleResult>&& results);
```

**メソッド：**

- `const std::vector<SingleResult>& Results() const`

    リクエストにベクトルが追加された順序と同じ順序で、クエリベクトルごとに1つの `SingleResult` を返します。

- `const std::vector<float>& Recalls() const`

    クエリベクトルごとの再現率の値。`enable_recall_calculation` が `true` に設定された Zilliz Cloud インスタンスで検索が実行された場合にのみ設定されます。それ以外の場合、ベクトルは空です。

#### SearchResponse の統計情報\{#searchresponse-statistics}

`SearchResponse` オブジェクトは、検索のコストを表す実行統計を公開します。

**メソッド：**

- `int64_t Cost() const`

    検索のコストをミリ秒単位で返します。

- `int64_t ScannedRemoteBytes() const`

    リモートストレージからスキャンされたバイト数を返します。

- `int64_t ScannedTotalBytes() const`

    スキャンされた合計バイト数を返します。

- `float CacheHitRatio() const`

    キャッシュヒット率を 0.0 から 1.0 までの値として返します。

#### SingleResult\{#singleresult}

`SingleResult` は、スコア、主キー、および要求された出力フィールドを含む、1つのクエリベクトルの上位 k 件のヒットを含みます。`SearchResults` は、これらのクエリごとの結果を含む外側のコレクションです。

```c++
struct SingleResult {
    SingleResult(const std::string& pk_name, const std::string& score_name,
                 std::vector<FieldDataPtr>&& output_fields,
                 const std::set<std::string>& output_names);
};

using SingleResultPtr = std::shared_ptr<SingleResult>;
```

**メソッド：**

- `const std::vector<float>& Scores() const`

    このクエリベクトルの類似度スコアまたは距離を返します。

- `IDArray Ids() const`

    ヒットの主キー値を返します。主キーフィールドの型を保持する必要がある場合は、OutputField() を優先してください。

- `const std::string& PrimaryKeyName() const`

    サーバーによって報告された主キーフィールド名を返します。

- `const std::string& ScoreName() const`

    衝突回避のプレフィックスを含む、結果のスコアフィールド名を返します。

- `FieldDataPtr OutputField(const std::string& name) const`

    指定された名前の要求済み出力フィールドを1つ返します。テンプレートオーバーロードは、要求された具象 FieldData 型にキャストします。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    要求されたすべての出力フィールドを FieldDataPtr 値として返します。

- `const std::set<std::string>& OutputFieldNames() const`

    要求された出力フィールドの名前を返します。

- `Status OutputRows(EntityRows& rows) const`

    すべてのヒットを行指向のエンティティデータとして具体化します。

- `Status OutputRow(int i, EntityRow& row) const`

    0 ベースのインデックスで1つのヒットを具体化します。

- `uint64_t GetRowCount() const`

    この結果内のヒット数を返します。

**エラー処理：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

#### 出力フィールドの型\{#output-field-types}

要求されたエンティティフィールドは、`FieldDataPtr` を介して返されます。具象 `XxxFieldData` 型は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベースポインターには `OutputField(name)` を、チェック付きの共有ポインターキャストには `OutputField<T>(name)` を使用してください。

ポインターの規則は `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>` です。この結果表現は検索インターフェイスとクエリインターフェイスで共有され、ポインターエイリアスが個別の API ページになるわけではありません。

### FunctionScore\{#functionscore}

このクラスは、リランク関数オブジェクトのリストとオプションの追加パラメーターを保持します。`FunctionScorePtr`（`std::shared_ptr<FunctionScore>`）を `SearchArguments::WithFunctionScore()` または `HybridSearchRequest::WithFunctionScore()` に渡します。`HybridSearch` では RRF または Weighted 関数を使用し、`Search` では Boost、Decay、または Model 関数を使用します。関数サブクラスの詳細は、Function を参照してください。

```c++
using FunctionScorePtr = std::shared_ptr<FunctionScore>;

auto score = FunctionScore()
    .WithFunctions(functions)
    .AddFunction(function_ptr)
    .WithParams(params)
    .AddParam(key, value);
```

**メソッド：**

- `FunctionScore& WithFunctions(std::vector<FunctionPtr>&& functions)`

    リランク関数のリストを置き換えます。

- `FunctionScore& AddFunction(const FunctionPtr& function)`

    リランク関数を1つ追加します。

- `FunctionScore& WithParams(std::unordered_map<std::string, nlohmann::json>&& params)`

    リランク関数で使用される追加パラメーターのマップを置き換えます。

- `FunctionScore& AddParam(const std::string& key, nlohmann::json&& param)`

    リランクパラメーターを1つ追加または置き換えます。

- `const std::vector<FunctionPtr>& Functions() const`

    設定されているリランク関数を返します。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const`

    設定されているリランクパラメーターを返します。

## 例\{#example}

C++ SDK で Search() を使用する例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::SearchRequest();
milvus::SearchResponse response;
util::CheckStatus(client->Search(request, response));
```

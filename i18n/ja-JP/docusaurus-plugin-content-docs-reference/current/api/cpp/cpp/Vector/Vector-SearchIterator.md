---
title: "SearchIterator() | Cloud"
slug: /cpp/cpp/Vector-SearchIterator
sidebar_label: "SearchIterator()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "バッチ単位でベクトル検索結果を返すイテレーターを作成します。イテレーターの使用中は MilvusClientV2 の接続を維持してください。結果の順序は保証されません。SDK が内部的に主キーフィールド名を割り当てるため、リクエストは可変です。 | Cloud"
type: docx
token: UJArdNCrIoKR78xBrKqcwtgUnQc
sidebar_position: 9
keywords: 
  - Serverless ベクトルデータベース
  - milvus オープンソース
  - milvus の仕組み
  - Zilliz ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - SearchIterator()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# SearchIterator()

バッチ単位でベクトル検索結果を返すイテレーターを作成します。イテレーターの使用中は MilvusClientV2 の接続を維持してください。結果の順序は保証されません。SDK が内部的に主キーフィールド名を割り当てるため、リクエストは可変です。

```c++
Status SearchIterator(SearchIteratorRequest& request, SearchIteratorPtr& response)
```

<Admonition type="info" title="Notes">

イテレーターの使用中は MilvusClientV2 の接続を解除しないでください。返されるエンティティの順序は保証されません。詳細については、 を参照してください。

</Admonition>

## Request Syntax\{#request-syntax}

```c++
auto request = SearchIteratorRequest()
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

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースを使用します。

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

    整合性レベルを設定します。[Consistency Level](/docs/consistency-level)。

- `AddBinaryVector(const std::string& vector)`

    バイナリベクトルを検索リクエストに追加します。このメソッドは、文字列配列を自動的に uint8 配列に変換します。

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    float ベクトルを検索リクエストに追加します。

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    スパースベクトルを検索リクエストに追加します。

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを検索リクエストに追加します。

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを検索リクエストに追加します。

- `AddEmbeddedText(const std::string& text)`

    テキストを検索リクエストに追加します。BM25 関数でのみ機能します。

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    int8 ベクトルを検索リクエストに追加します。

- `AddEmbeddingList(EmbeddingList&& emb_list)`

    構造体フィールドの埋め込みリストを検索リクエストに追加します。

- `WithBinaryVectors(const std::vector<std::string>& vectors)`

    バイナリベクトルを検索リクエストに割り当てます。このメソッドは、文字列配列を自動的に uint8 配列に変換します。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    float ベクトルを検索リクエストに割り当てます。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    スパースベクトルを検索リクエストに割り当てます。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    float16 ベクトルを検索リクエストに割り当てます。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    bfloat16 ベクトルを検索リクエストに割り当てます。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithEmbeddedTexts(std::vector<std::string>&& texts)`

    テキストを検索リクエストに割り当てます。BM25 関数でのみ機能します。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    int8 ベクトルを検索リクエストに割り当てます。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithEmbeddingLists(std::vector<EmbeddingList>&& emb_lists)`

    構造体フィールドの埋め込みリストを検索リクエストに割り当てます。注記：このメソッドはリクエストのベクトルリストをリセットします。

- `WithMetricType(::milvus::MetricType metric_type)`

    メトリックタイプを指定します。

- `AddExtraParam(const std::string& key, const std::string& value)`

    "nlist"、"ef" などの追加パラメーターを追加します。

- `WithExtraParams(const std::unordered_map<std::string, std::string>& params)`

    "nlist"、"ef" などの追加パラメーターを追加します。

- `WithLimit(int64_t limit)`

    検索の上限（topk）を設定します。注記：この値は ExtraParams に格納されます。

- `WithFilter(std::string filter)`

    フィルター式を設定します。

- `WithAnnsField(const std::string& ann_field)`

    ANN 検索の対象フィールドを設定します。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    フィルター式内のプレースホルダーに 1 つの値を追加します。これは、リクエストに空でないフィルターがある場合にのみ使用され、大きなリテラル値の繰り返し解析を回避します。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルター式で使用されるすべてのプレースホルダー値を置き換えます。キーは \{age\} や \{city\} などのプレースホルダーに対応し、値には boolean、数値、文字列、または配列データを指定できます。

- `WithOffset(int64_t offset)`

    オフセット値を設定します。注記：この値は ExtraParams に格納されます。

- `WithRoundDecimal(int64_t round_decimal)`

    小数点以下の丸め値を設定します。

- `WithIgnoreGrowing(bool ignore_growing)`

    growing を無視するフラグを設定します。

- `WithGroupByField(const std::string& field_name)`

    group by のフィールド値を設定します。

- `WithGroupSize(int64_t group_size)`

    グループサイズ値を設定します。

- `WithStrictGroupSize(bool strict_group_size)`

    厳密なグループサイズのフラグを設定します。

- `WithRadius(double radius)`

    範囲の半径を設定します。注記：この値は ExtraParams に格納されます。

- `WithRangeFilter(double filter)`

    範囲フィルターを設定します。注記：この値は ExtraParams に格納されます。

- `WithRerank(const FunctionScorePtr& ranker)`

    リランカーを設定します。Boost/Decay/Model, などの複数のリランク関数を使用できます。[Boost Ranker](/docs/boost-ranker) とその関連ページを参照してください。

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに有効です。検索の詳細については、[検索のタイムゾーンを一時的に設定する](/docs/single-vector-search#temporarily-set-a-timezone-for-a-search)を参照してください。

- `WithHighlighter(const HighlighterPtr& highlighter)`

    ハイライターを設定します。

- `WithSearchAggregation(const SearchAggregationPtr& aggregation)`

    検索集計設定を設定します。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    検索結果の並べ替えに使用するフィールドを設定します。

- `AddOrderByField(OrderByField order_by_field)`

    検索結果の並べ替えに使用するフィールドを追加します。

### Query ベクトル types\{#query-vector-types}

リクエストは、対象フィールドの [DataType](./Collections-DataType) に一致する 1 つのクエリベクトル表現を受け入れます。対応する追加メソッドまたは一括ビルダーメソッドを使用してください。これらはクエリ入力であり、コレクションの列ペイロードではありません。

| スキーマ DataType | リクエストメソッド | C++ 表現 | 注記 |
| --- | --- | --- | --- |
| FLOAT_VECTOR | AddFloatVector(), WithFloatVectors() | std::ベクトル&lt;float&gt; | 密な float ベクトルです。 |
| BINARY_VECTOR | AddBinaryVector(), WithBinaryVectors() | Binary bytes or string convenience input | 専用のバイナリベクトル表現を使用します。 |
| SPARSE_FLOAT_VECTOR | AddSparseVector(), WithSparseVectors() | std::map\<uint32_t, float> or supported JSON form | スパースなインデックスと値のペアです。 |
| FLOAT16_VECTOR | AddFloat16Vector(), WithFloat16Vectors() | std::ベクトル&lt;uint16_t&gt; or convertible float ベクトル | float のオーバーロードでは変換が実行されます。 |
| BFLOAT16_VECTOR | AddBFloat16Vector(), WithBFloat16Vectors() | std::ベクトル&lt;uint16_t&gt; or convertible float ベクトル | float のオーバーロードでは変換が実行されます。 |
| INT8_VECTOR | AddInt8Vector(), WithInt8Vectors() | std::ベクトル&lt;int8_t&gt; | 密な符号付きバイトベクトルです。 |
| Function or struct-field input | AddEmbeddedText() / WithEmbeddedTexts(); AddEmbeddingList() / WithEmbeddingLists() | std::string or EmbeddingList | サポートされる関数には埋め込みテキストを、構造体フィールドの ANN 検索には埋め込みリストを使用します。 |

**戻り値：**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

これは、単一フィールドの列ベースのデータを表すテンプレートクラスです。具象エイリアスは、サポートされるすべてのデータ型をカバーします。具象型のインスタンスは、`InsertRequest::WithRowsData()` を介してデータを挿入する場合、または `QueryResults::OutputField()` と `SingleResult::OutputField()` を介してクエリ/search 結果を読み取る場合に使用されます。

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

このクラスは、同じ型の 1 つ以上のクエリベクトルを保持し、`SearchRequest`、`SubSearchRequest`、または `AddEmbeddingList()` を介した構造体フィールドの ANN 検索のターゲットベクトルとして使用されます。Add*/Set* メソッドを呼び出して `EmbeddingList` を構築し、`SearchRequestBase::AddEmbeddingList()` に渡します。

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

    密な float ベクトルを 1 つ追加します。

- `Status AddBinaryVector(const std::string& vector)`

    バイナリベクトルを 1 つ追加します。string オーバーロードでは、文字列がバイナリバイトに変換されます。

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    バイナリベクトルを 1 つ追加します。string オーバーロードでは、文字列がバイナリバイトに変換されます。

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    インデックスと値のデータ、またはサポートされる JSON 表現から、スパースベクトルを 1 つ追加します。

- `Status AddSparseVector(const nlohmann::json& vector)`

    インデックスと値のデータ、またはサポートされる JSON 表現から、スパースベクトルを 1 つ追加します。

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを 1 つ追加します。float ベクトルのオーバーロードでは、値が float16 に変換されます。

- `Status AddFloat16Vector(const std::vector<float>& vector)` — float から float16 への自動変換

    float16 ベクトルを 1 つ追加します。float ベクトルのオーバーロードでは、値が float16 に変換されます。

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを 1 つ追加します。float ベクトルのオーバーロードでは、値が bfloat16 に変換されます。

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — float から bfloat16 への自動変換

    bfloat16 ベクトルを 1 つ追加します。float ベクトルのオーバーロードでは、値が bfloat16 に変換されます。

- `Status AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    密な int8 ベクトルを 1 つ追加します。

- `Status AddEmbeddedText(const std::string& text)` — BM25 テキスト埋め込み用

    BM25 などのサポートされるテキスト埋め込み関数のテキストを追加します。

**一括設定メソッド（リストをリセット）：**

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

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを float16 ベクトルに置き換えます。該当する場合、float 入力は変換されます。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    現在のリストを bfloat16 ベクトルに置き換えます。該当する場合、float 入力は変換されます。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを bfloat16 ベクトルに置き換えます。該当する場合、float 入力は変換されます。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    現在のリストを密な int8 ベクトルに置き換えます。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — BM25 テキスト埋め込み用

    現在のリストを、サポートされる埋め込み関数のテキスト入力に置き換えます。

### FunctionScore\{#functionscore}

このクラスは、リランク関数オブジェクトのリストとオプションの追加パラメーターを保持します。`FunctionScorePtr`（`std::shared_ptr<FunctionScore>`）を `SearchArguments::WithFunctionScore()` または `HybridSearchRequest::WithFunctionScore()` に渡します。`HybridSearch` では RRF または Weighted 関数を使用し、`Search` では Boost、Decay、または Model 関数を使用します。関数のサブクラスの詳細については、Function を参照してください。

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

    リランク関数を 1 つ追加します。

- `FunctionScore& WithParams(std::unordered_map<std::string, nlohmann::json>&& params)`

    リランク関数で使用される追加パラメーターのマップを置き換えます。

- `FunctionScore& AddParam(const std::string& key, nlohmann::json&& param)`

    リランクパラメーターを 1 つ追加または置き換えます。

- `const std::vector<FunctionPtr>& Functions() const`

    設定されたリランク関数を返します。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const`

    設定されたリランクパラメーターを返します。

### Iterator\{#iterator}

SearchIterator は Iterator&lt;SingleResult&gt; のエイリアスです。完全な結果セットが 1 回のリクエストの上限より大きい場合に、検索ヒットをバッチ単位で取得するために使用します。

### Output field types\{#output-field-types}

要求したエンティティフィールドは、`FieldDataPtr` を介して返されます。具象 `XxxFieldData` 型は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベースポインターには `OutputField(name)` を、チェック済みの共有ポインターキャストには `OutputField<T>(name)` を使用します。

ポインターの規則は XxxFieldDataPtr = std::shared_ptr&lt;XxxFieldData&gt; です。この結果表現は検索インターフェイスで使用され、ポインターエイリアスが別々の API ページになるわけではありません。

### Iterator\{#iterator}

抽象基底クラスです。直接インスタンス化しないでください。以下の SearchIterator エイリアスを使用してください。

```c++
template <typename T>
class Iterator {
 public:
    virtual Status Next(T& results) = 0;
};
```

- `virtual Status Next(T& results) = 0`

### SearchIterator\{#searchiterator}

`SearchIterator()` 呼び出しからの `SingleResult` バッチを反復処理します。`Next()` を呼び出すたびに、`SingleResult` に次のヒットバッチが格納されます。

```c++
using SearchIterator    = Iterator<SingleResult>;
using SearchIteratorPtr = std::shared_ptr<SearchIterator>;
```

`MilvusClientV2::SearchIterator(IteratorArguments, SearchIteratorPtr&)` を介して取得します。

**エラーハンドリング：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## Example\{#example}

C++ SDK で SearchIterator() を使用する方法を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::SearchIteratorRequest();
milvus::SearchIteratorPtr response;
util::CheckStatus(client->SearchIterator(request, response));
```

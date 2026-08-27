---
title: "SearchIterator() | Cloud"
slug: /cpp/cpp/Vector-SearchIterator
sidebar_label: "SearchIterator()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ベクトル検索結果をバッチで返すイテレーターを作成します。イテレーターの使用中は MilvusClientV2 を接続したままにしてください。結果の順序は保証されません。SDK が主キーフィールド名を内部的に割り当てるため、リクエストは可変です。 | Cloud"
type: docx
token: UJArdNCrIoKR78xBrKqcwtgUnQc
sidebar_position: 9
keywords: 
  - Serverless ベクトルデータベース
  - milvus open source
  - how does milvus work
  - Zilliz ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - SearchIterator()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# SearchIterator()

ベクトル検索結果をバッチで返すイテレーターを作成します。イテレーターの使用中は MilvusClientV2 を接続したままにしてください。結果の順序は保証されません。SDK が主キーフィールド名を内部的に割り当てるため、リクエストは可変です。

```c++
Status SearchIterator(SearchIteratorRequest& request, SearchIteratorPtr& response)
```

<Admonition type="info" icon="📘" title="Notes">

イテレーターの使用中は MilvusClientV2 を切断しないでください。返されるエンティティの順序は保証されません。詳細については[このドキュメント](https://milvus.io/docs/with-iterators.md)を参照してください。

</Admonition>

## リクエスト構文\{#request-syntax}

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

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。パーティション名が空の場合、コレクション全体に対してクエリが実行されます。

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

    構造体フィールドの検索リクエストに埋め込みリストを追加します。

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

    構造体フィールドの検索リクエストに埋め込みリストを設定します。注意: このメソッドを呼び出すと、リクエストのベクトルリストがリセットされます。

- `WithMetricType(::milvus::MetricType metric_type)`

    メトリックタイプを指定します。

- `AddExtraParam(const std::string& key, const std::string& value)`

    "nlist" や "ef" などの追加パラメーターを設定します。

- `WithExtraParams(const std::unordered_map<std::string, std::string>& params)`

    "nlist" や "ef" などの追加パラメーターを設定します。

- `WithLimit(int64_t limit)`

    検索の上限数 (topk) を設定します。注意: この値は ExtraParams に格納されます。

- `WithFilter(std::string filter)`

    フィルター式を設定します。

- `WithAnnsField(const std::string& ann_field)`

    ANN 検索の対象フィールドを設定します。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    フィルター式内のプレースホルダーに値を 1 つ追加します。この機能は、リクエストに空でないフィルターが含まれる場合にのみ使用され、大きなリテラル値の繰り返しパースを回避するために利用します。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    フィルター式で使用されるすべてのプレースホルダー値を置き換えます。キーは \{age\} や \{city\} などのプレースホルダーに対応し、値にはブール値、数値、文字列、または配列データを指定できます。

- `WithOffset(int64_t offset)`

    オフセット値を設定します。注意: この値は ExtraParams に格納されます。

- `WithRoundDecimal(int64_t round_decimal)`

    小数点以下の丸め桁数を設定します。

- `WithIgnoreGrowing(bool ignore_growing)`

    データ挿入中のセグメントを無視するフラグを設定します。

- `WithGroupByField(const std::string& field_name)`

    グループ化に使用するフィールド値を設定します。

- `WithGroupSize(int64_t group_size)`

    グループサイズを設定します。

- `WithStrictGroupSize(bool strict_group_size)`

    厳密なグループサイズ適用フラグを設定します。

- `WithRadius(double radius)`

    範囲検索の半径を設定します。注意: この値は ExtraParams に格納されます。

- `WithRangeFilter(double filter)`

    範囲フィルターを設定します。注意: この値は ExtraParams に格納されます。

- `WithRerank(const FunctionScorePtr& ranker)`

    リランカーを設定します。Boost/Decay/Model, など、複数のリランク関数を利用できます。詳細はドキュメントを参照してください: https://milvus.io/docs/boost-ranker.md.

- `WithTimezone(const std::string& timezone)`

    タイムゾーンを設定します。Timestamptz フィールドに対して有効です。詳細はドキュメントを参照してください: https://milvus.io/docs/single-vector-search.md#Temporarily-set-a-timezone-for-a-search.

- `WithHighlighter(const HighlighterPtr& highlighter)`

    ハイライターを設定します。

- `WithSearchAggregation(const SearchAggregationPtr& aggregation)`

    検索集計の設定を行います。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    検索結果のソートに使用するフィールドを設定します。

- `AddOrderByField(OrderByField order_by_field)`

    検索結果のソートに使用するフィールドを追加します。

### クエリベクトルの型\{#query-vector-types}

リクエストでは、対象フィールドの [DataType](./Collections-DataType) に一致するクエリベクトル表現を 1 つ指定できます。対応する add メソッドまたはバッチビルダーメソッドを使用してください。これらはクエリ入力として用いられるものであり、コレクションのカラムペイロードではありません。

| スキーマ DataType | リクエストメソッド | C++ での表現 | 備考 |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | `AddFloatVector()`, `WithFloatVectors()` | `std::vector<float>` | 密な float ベクトル。 |
| `BINARY_VECTOR` | `AddBinaryVector()`, `WithBinaryVectors()` | バイナリバイトまたは文字列による簡易入力 | 専用のバイナリベクトル表現を使用します。 |
| `SPARSE_FLOAT_VECTOR` | `AddSparseVector()`, `WithSparseVectors()` | `std::map<uint32_t, float>` またはサポートされている JSON 形式 | スパースインデックスと値のペア。 |
| `FLOAT16_VECTOR` | `AddFloat16Vector()`, `WithFloat16Vectors()` | `std::vector<uint16_t>` または変換可能な float ベクトル | float オーバーロードにより変換が実行されます。 |
| `BFLOAT16_VECTOR` | `AddBFloat16Vector()`, `WithBFloat16Vectors()` | `std::vector<uint16_t>` または変換可能な float ベクトル | float オーバーロードにより変換が実行されます。 |
| `INT8_VECTOR` | `AddInt8Vector()`, `WithInt8Vectors()` | `std::vector<int8_t>` | 密な符号付きバイトベクトル。 |
| 関数または構造体フィールドの入力 | `AddEmbeddedText()` / `WithEmbeddedTexts()`; `AddEmbeddingList()` / `WithEmbeddingLists()` | `std::string` または `EmbeddingList` | 対応する関数には埋め込みテキストを、構造体フィールドの ANN 検索には埋め込みリストを使用します。 |

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドのカラムベースデータを表すテンプレートクラスです。具体的なエイリアスがサポート対象のすべてのデータ型に対応しています。`InsertRequest::WithRowsData()` を使ったデータ挿入や、`QueryResults::OutputField()` および `SingleResult::OutputField()` を使ったクエリ/search結果の読み取り時に、これらの具象型のインスタンスを使用します。

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

同じ型のクエリベクトルを 1 つ以上保持するクラスで、`SearchRequest`、`SubSearchRequest`、または `AddEmbeddingList()` を通じた構造体フィールド ANN 検索のターゲットベクトルとして使用されます。Add*/Set* メソッドを呼び出して `EmbeddingList` を構築し、それを `SearchRequestBase::AddEmbeddingList()` に渡してください。

```c++
EmbeddingList list;
```

**メソッド:**

**読み取りメソッド:**

- `FieldDataPtr TargetVectors() const`

    すべてのベクトルを含む基盤のフィールドデータを返します。

- `size_t Count() const`

    追加済みのベクトル数を返します。

- `int64_t Dim() const`

    ベクトルの次元数を返します。埋め込みテキストモードの場合、値は `0` となります。

**単一ベクトル追加メソッド:**

- `Status AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    密な float ベクトルを 1 つ追加します。

- `Status AddBinaryVector(const std::string& vector)`

    バイナリベクトルを 1 つ追加します。文字列オーバーロードの場合は、文字列がバイナリバイトに変換されます。

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    バイナリベクトルを 1 つ追加します。文字列オーバーロードの場合は、文字列がバイナリバイトに変換されます。

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    インデックスと値のデータ、またはサポートされている JSON 形式からスパースベクトルを 1 つ追加します。

- `Status AddSparseVector(const nlohmann::json& vector)`

    インデックスと値のデータ、またはサポートされている JSON 形式からスパースベクトルを 1 つ追加します。

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    float16 ベクトルを 1 つ追加します。float ベクトルオーバーロードの場合は、値が float16 に変換されます。

- `Status AddFloat16Vector(const std::vector<float>& vector)` — float から float16 への自動変換

    float16 ベクトルを 1 つ追加します。float ベクトルオーバーロードの場合は、値が float16 に変換されます。

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    bfloat16 ベクトルを 1 つ追加します。float ベクトルオーバーロードの場合は、値が bfloat16 に変換されます。

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — float から bfloat16 への自動変換

    bfloat16 ベクトルを 1 つ追加します。float ベクトルオーバーロードの場合は、値が bfloat16 に変換されます。

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

    現在のリストを float16 ベクトルで置き換えます。float 入力は必要に応じて変換されます。

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを float16 ベクトルで置き換えます。float 入力は必要に応じて変換されます。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    現在のリストを bfloat16 ベクトルで置き換えます。float 入力は必要に応じて変換されます。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自動変換

    現在のリストを bfloat16 ベクトルで置き換えます。float 入力は必要に応じて変換されます。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    現在のリストを密な int8 ベクトルで置き換えます。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — BM25 テキスト埋め込み用

    現在のリストをサポートされている埋め込み関数用のテキスト入力で置き換えます。

### FunctionScore\{#functionscore}

このクラスは、リランク関数オブジェクトのリストとオプションの追加パラメーターを保持します。`FunctionScorePtr`（`std::shared_ptr<FunctionScore>`）を `SearchArguments::WithFunctionScore()` または `HybridSearchRequest::WithFunctionScore()` に渡してください。`HybridSearch` の場合は RRF または Weighted 関数を、`Search` の場合は Boost、Decay、または Model 関数を使用します。関数サブクラスの詳細については Function を参照してください。

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

    リランク関数のリストを置き換えます。

- `FunctionScore& AddFunction(const FunctionPtr& function)`

    リランク関数を 1 つ追加します。

- `FunctionScore& WithParams(std::unordered_map<std::string, nlohmann::json>&& params)`

    リランク関数で使用される追加パラメーターマップを置き換えます。

- `FunctionScore& AddParam(const std::string& key, nlohmann::json&& param)`

    リランクパラメーターを 1 つ追加または置き換えます。

- `const std::vector<FunctionPtr>& Functions() const`

    設定済みのリランク関数を返します。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const`

    設定済みのリランクパラメーターを返します。

### Iterator\{#iterator}

SearchIterator は Iterator&lt;SingleResult&gt; のエイリアスです。結果セット全体が単一リクエストの上限を超える場合に、検索ヒットをバッチ単位で取得するために使用します。

### 出力フィールドの型\{#output-field-types}

要求したエンティティフィールドは `FieldDataPtr` を通じて返されます。具体的な `XxxFieldData` 型は、フィールドのスキーマ [DataType](./Collections-DataType) に従います。ベースポインターには `OutputField(name)` を、チェック付き shared-pointer キャストには `OutputField<T>(name)` を使用してください。

ポインターの命名規則は XxxFieldDataPtr = std::shared_ptr&lt;XxxFieldData&gt; です。この結果表現は検索インターフェースで使用されるものであり、ポインターエイリアスが個別の API ページとして定義されることはありません。

### Iterator\{#iterator}

抽象基底クラスです。直接インスタンス化せず、後述の SearchIterator エイリアスを使用してください。

```c++
template <typename T>
class Iterator {
 public:
    virtual Status Next(T& results) = 0;
};
```

- `virtual Status Next(T& results) = 0`

### SearchIterator\{#searchiterator}

`SearchIterator()` 呼び出しから返される `SingleResult` バッチを順に処理します。`Next()` を呼び出すたびに、次のヒットバッチが `SingleResult` に格納されます。

```c++
using SearchIterator    = Iterator<SingleResult>;
using SearchIteratorPtr = std::shared_ptr<SearchIterator>;
```

`MilvusClientV2::SearchIterator(IteratorArguments, SearchIteratorPtr&)` を通じて取得します。

**エラー処理:**

- **std::exception**

    リクエストの構築、通信、またはレスポンス処理に失敗した場合にスローされます。障害の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK で SearchIterator() を使用する例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::SearchIteratorRequest();
milvus::SearchIteratorPtr response;
util::CheckStatus(client->SearchIterator(request, response));
```

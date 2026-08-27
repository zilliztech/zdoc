---
title: "SearchIterator() | Cloud"
slug: /cpp/cpp/Vector-SearchIterator
sidebar_label: "SearchIterator()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "创建一个迭代器，用于分批返回向量搜索结果。使用迭代器期间，请保持 MilvusClientV2 处于连接状态。结果顺序不作保证。由于 SDK 会在内部分配主键字段名，因此请求对象是可变的。 | Cloud"
type: docx
token: UJArdNCrIoKR78xBrKqcwtgUnQc
sidebar_position: 9
keywords: 
  - Serverless vector Database
  - milvus 开源
  - milvus 工作原理
  - Zilliz vector Database
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

创建一个迭代器，用于分批返回向量搜索结果。使用迭代器期间，请保持 MilvusClientV2 处于连接状态。结果顺序不作保证。由于 SDK 会在内部分配主键字段名，因此请求对象是可变的。

```c++
Status SearchIterator(SearchIteratorRequest& request, SearchIteratorPtr& response)
```

<Admonition type="info" icon="📘" title="Notes">

使用迭代器时，请勿断开 MilvusClientV2 的连接。返回的 Entity 顺序无法保证。详情请参阅[此文档](https://milvus.io/docs/with-iterators.md)。

</Admonition>

## 请求语法\{#request-syntax}

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

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；若为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称列表。若未指定 Partition 名称，将在整个 Collection 中进行查询。

- `AddPartitionName(const std::string& partition_name)`

    添加一个 Partition 名称。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    设置输出字段名称。

- `AddOutputField(const std::string& output_field)`

    添加一个输出字段。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    设置一致性级别。更多信息请参阅文档：https://milvus.io/docs/consistency.md#Consistency-Level.

- `AddBinaryVector(const std::string& vector)`

    向搜索请求中添加一个二进制向量。该方法会自动将字符串数组转换为 uint8 数组。

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    向搜索请求中添加一个浮点向量。

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    向搜索请求中添加一个稀疏向量。

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    向搜索请求中添加一个 float16 向量。

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    向搜索请求中添加一个 bfloat16 向量。

- `AddEmbeddedText(const std::string& text)`

    向搜索请求中添加文本。仅适用于 BM25 函数。

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    向搜索请求中添加一个 int8 向量。

- `AddEmbeddingList(EmbeddingList&& emb_list)`

    向结构体字段的搜索请求中添加一个嵌入列表。

- `WithBinaryVectors(const std::vector<std::string>& vectors)`

    设置搜索请求的二进制向量。该方法会自动将字符串数组转换为 uint8 数组。注意：此操作会重置请求中的向量列表。

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    设置搜索请求的浮点向量。注意：此操作会重置请求中的向量列表。

- `WithSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    设置搜索请求的稀疏向量。注意：此操作会重置请求中的向量列表。

- `WithFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    设置搜索请求的 float16 向量。注意：此操作会重置请求中的向量列表。

- `WithBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    设置搜索请求的 bfloat16 向量。注意：此操作会重置请求中的向量列表。

- `WithEmbeddedTexts(std::vector<std::string>&& texts)`

    设置搜索请求的文本。仅适用于 BM25 函数。注意：此操作会重置请求中的向量列表。

- `WithInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    设置搜索请求的 int8 向量。注意：此操作会重置请求中的向量列表。

- `WithEmbeddingLists(std::vector<EmbeddingList>&& emb_lists)`

    设置结构体字段搜索请求的嵌入列表。注意：此操作会重置请求中的向量列表。

- `WithMetricType(::milvus::MetricType metric_type)`

    指定度量类型。

- `AddExtraParam(const std::string& key, const std::string& value)`

    添加额外参数，如 "nlist"、"ef" 等。

- `WithExtraParams(const std::unordered_map<std::string, std::string>& params)`

    添加额外参数，如 "nlist"、"ef" 等。

- `WithLimit(int64_t limit)`

    设置搜索限制（topk）。注意：该值存储在 ExtraParams 中。

- `WithFilter(std::string filter)`

    设置过滤表达式。

- `WithAnnsField(const std::string& ann_field)`

    设置 ANN 搜索的目标字段。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    为过滤表达式中的占位符添加单个值。仅在请求包含非空过滤条件时使用，可避免重复解析大型字面量。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    替换过滤表达式中使用的所有占位符值。键对应于 \{age\} 或 \{city\} 等占位符；值可以是布尔值、数值、字符串或数组数据。

- `WithOffset(int64_t offset)`

    设置偏移量。注意：该值存储在 ExtraParams 中。

- `WithRoundDecimal(int64_t round_decimal)`

    设置小数舍入位数。

- `WithIgnoreGrowing(bool ignore_growing)`

    设置忽略新增数据标志。

- `WithGroupByField(const std::string& field_name)`

    设置分组字段。

- `WithGroupSize(int64_t group_size)`

    设置分组大小。

- `WithStrictGroupSize(bool strict_group_size)`

    设置严格分组大小标志。

- `WithRadius(double radius)`

    设置范围半径。注意：该值存储在 ExtraParams 中。

- `WithRangeFilter(double filter)`

    设置范围过滤阈值。注意：该值存储在 ExtraParams 中。

- `WithRerank(const FunctionScorePtr& ranker)`

    设置重排序器。支持多种重排序函数，如 Boost/Decay/Model, 等。更多信息请参阅文档：https://milvus.io/docs/boost-ranker.md.

- `WithTimezone(const std::string& timezone)`

    设置时区，对 Timestamptz 字段生效。更多信息请参阅文档：https://milvus.io/docs/single-vector-search.md#Temporarily-set-a-timezone-for-a-search.

- `WithHighlighter(const HighlighterPtr& highlighter)`

    设置高亮器。

- `WithSearchAggregation(const SearchAggregationPtr& aggregation)`

    设置搜索聚合配置。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    设置用于搜索结果排序的字段。

- `AddOrderByField(OrderByField order_by_field)`

    添加一个用于搜索结果排序的字段。

### 查询向量类型\{#query-vector-types}

请求接受一种与目标字段 [DataType](./Collections-DataType) 相匹配的查询向量表示形式。请使用对应的添加方法或批量构建方法；这些属于查询输入，而非 Collection 列数据载荷。

| Schema DataType | 请求方法 | C++ 表示形式 | 备注 |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | `AddFloatVector()`, `WithFloatVectors()` | `std::vector<float>` | 稠密浮点向量。 |
| `BINARY_VECTOR` | `AddBinaryVector()`, `WithBinaryVectors()` | 二进制字节或字符串便捷输入 | 使用专用的二进制向量表示形式。 |
| `SPARSE_FLOAT_VECTOR` | `AddSparseVector()`, `WithSparseVectors()` | `std::map<uint32_t, float>` 或支持的 JSON 格式 | 稀疏索引-值对。 |
| `FLOAT16_VECTOR` | `AddFloat16Vector()`, `WithFloat16Vectors()` | `std::vector<uint16_t>` 或可转换的浮点向量 | 浮点重载方法会自动执行转换。 |
| `BFLOAT16_VECTOR` | `AddBFloat16Vector()`, `WithBFloat16Vectors()` | `std::vector<uint16_t>` 或可转换的浮点向量 | 浮点重载方法会自动执行转换。 |
| `INT8_VECTOR` | `AddInt8Vector()`, `WithInt8Vectors()` | `std::vector<int8_t>` | 稠密有符号字节向量。 |
| 函数或结构体字段输入 | `AddEmbeddedText()` / `WithEmbeddedTexts()`; `AddEmbeddingList()` / `WithEmbeddingLists()` | `std::string` 或 `EmbeddingList` | 对支持的函数使用嵌入文本，对结构体字段 ANN 搜索使用嵌入列表。 |

**返回值：**

*Status*

返回一个状态对象，指示操作是否成功。

### FieldData\{#fielddata}

这是一个模板类，用于表示单个字段的列式数据。具体的类型别名涵盖了所有支持的数据类型。在通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search结果时，均需使用具体类型的实例。

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

此类包含一个或多个同类型的查询向量，用作 `SearchRequest`、`SubSearchRequest` 或通过 `AddEmbeddingList()` 进行的结构体字段 ANN 搜索的目标向量。通过调用 Add*/Set* 方法构建 `EmbeddingList`，然后将其传递给 `SearchRequestBase::AddEmbeddingList()`。

```c++
EmbeddingList list;
```

**方法：**

**读取方法：**

- `FieldDataPtr TargetVectors() const`

    返回包含所有向量的底层字段数据。

- `size_t Count() const`

    返回已添加的向量数量。

- `int64_t Dim() const`

    返回向量维度。对于嵌入文本模式，该值为 `0`。

**单向量添加方法：**

- `Status AddFloatVector(const FloatVecFieldData::ElementT& vector)`

    追加一个稠密浮点向量。

- `Status AddBinaryVector(const std::string& vector)`

    追加一个二进制向量。字符串重载会将字符串转换为二进制字节。

- `Status AddBinaryVector(const BinaryVecFieldData::ElementT& vector)`

    追加一个二进制向量。字符串重载会将字符串转换为二进制字节。

- `Status AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

    从索引-值数据或支持的 JSON 格式追加一个稀疏向量。

- `Status AddSparseVector(const nlohmann::json& vector)`

    从索引-值数据或支持的 JSON 格式追加一个稀疏向量。

- `Status AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

    追加一个 float16 向量。浮点向量重载会将数值转换为 float16。

- `Status AddFloat16Vector(const std::vector<float>& vector)` — 自动将 float 转换为 float16

    追加一个 float16 向量。浮点向量重载会将数值转换为 float16。

- `Status AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

    追加一个 bfloat16 向量。浮点向量重载会将数值转换为 bfloat16。

- `Status AddBFloat16Vector(const std::vector<float>& vector)` — 自动将 float 转换为 bfloat16

    追加一个 bfloat16 向量。浮点向量重载会将数值转换为 bfloat16。

- `Status AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

    追加一个稠密 int8 向量。

- `Status AddEmbeddedText(const std::string& text)` — 用于 BM25 文本嵌入

    为支持的文本嵌入函数（如 BM25）追加文本。

**批量设置方法（重置列表）：**

- `Status SetFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)`

    使用稠密浮点向量替换当前列表。

- `Status SetBinaryVectors(const std::vector<std::string>& vectors)`

    使用二进制向量替换当前列表。

- `Status SetBinaryVectors(std::vector<BinaryVecFieldData::ElementT>&& vectors)`

    使用二进制向量替换当前列表。

- `Status SetSparseVectors(std::vector<SparseFloatVecFieldData::ElementT>&& vectors)`

    使用稀疏向量替换当前列表。

- `Status SetSparseVectors(const std::vector<nlohmann::json>& vectors)`

    使用稀疏向量替换当前列表。

- `Status SetFloat16Vectors(std::vector<Float16VecFieldData::ElementT>&& vectors)`

    使用 float16 向量替换当前列表；适用时会自动转换浮点输入。

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自动转换

    使用 float16 向量替换当前列表；适用时会自动转换浮点输入。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    使用 bfloat16 向量替换当前列表；适用时会自动转换浮点输入。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自动转换

    使用 bfloat16 向量替换当前列表；适用时会自动转换浮点输入。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    使用稠密 int8 向量替换当前列表。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — 用于 BM25 文本嵌入

    使用受支持嵌入函数的文本输入替换当前列表。

### FunctionScore\{#functionscore}

此类包含重排序函数对象列表及可选的额外参数。请将 `FunctionScorePtr`（即 `std::shared_ptr<FunctionScore>`）传递给 `SearchArguments::WithFunctionScore()` 或 `HybridSearchRequest::WithFunctionScore()`。对于 `HybridSearch`，请使用 RRF 或 Weighted 函数；对于 `Search`，请使用 Boost、Decay 或 Model 函数。有关函数子类的详细信息，请参阅 Function。

```c++
using FunctionScorePtr = std::shared_ptr<FunctionScore>;

auto score = FunctionScore()
    .WithFunctions(functions)
    .AddFunction(function_ptr)
    .WithParams(params)
    .AddParam(key, value);
```

**方法：**

- `FunctionScore& WithFunctions(std::vector<FunctionPtr>&& functions)`

    替换重排序函数列表。

- `FunctionScore& AddFunction(const FunctionPtr& function)`

    追加一个重排序函数。

- `FunctionScore& WithParams(std::unordered_map<std::string, nlohmann::json>&& params)`

    替换重排序函数使用的额外参数映射。

- `FunctionScore& AddParam(const std::string& key, nlohmann::json&& param)`

    添加或替换单个重排序参数。

- `const std::vector<FunctionPtr>& Functions() const`

    返回已配置的重排序函数。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const`

    返回已配置的重排序参数。

### Iterator\{#iterator}

SearchIterator 是 Iterator&lt;SingleResult&gt; 的别名。当完整结果集超出单次请求限制时，您可以使用它分批检索搜索命中结果。

### 输出字段类型\{#output-field-types}

请求的 Entity 字段通过 `FieldDataPtr` 返回。具体的 `XxxFieldData` 类型取决于字段的 Schema [DataType](./Collections-DataType)；您可以使用 `OutputField(name)` 获取基础指针，或使用 `OutputField<T>(name)` 执行带检查的共享指针转换。

指针命名约定为 XxxFieldDataPtr = std::shared_ptr&lt;XxxFieldData&gt;。该结果表示形式用于搜索接口，指针别名不会作为独立的 API 页面列出。

### Iterator\{#iterator}

抽象基类。请勿直接实例化，请使用下方的 SearchIterator 别名。

```c++
template <typename T>
class Iterator {
 public:
    virtual Status Next(T& results) = 0;
};
```

- `virtual Status Next(T& results) = 0`

### SearchIterator\{#searchiterator}

用于遍历 `SearchIterator()` 调用返回的 `SingleResult` 批次。每次调用 `Next()` 都会将下一批命中结果填充到一个 `SingleResult` 中。

```c++
using SearchIterator    = Iterator<SingleResult>;
using SearchIteratorPtr = std::shared_ptr<SearchIterator>;
```

通过 `MilvusClientV2::SearchIterator(IteratorArguments, SearchIteratorPtr&)` 获取。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出此异常。请检查异常消息或返回的 Status 以了解故障详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 SearchIterator()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::SearchIteratorRequest();
milvus::SearchIteratorPtr response;
util::CheckStatus(client->SearchIterator(request, response));
```

---
title: "HybridSearch() | Cloud"
slug: /cpp/cpp/Vector-HybridSearch
sidebar_label: "HybridSearch()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "根据指定参数对 Collection 执行混合搜索并返回结果。| Cloud"
type: docx
token: EHmkdGRrlooizbxSZ8wc9CYgnAb
sidebar_position: 3
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - HybridSearch()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# HybridSearch()

根据指定参数对 Collection 执行混合搜索并返回结果。

```c++
Status HybridSearch(const HybridSearchRequest& request, HybridSearchResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = HybridSearchRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .AddPartitionName(partition_name)
    .WithOutputFields(output_field_names)
    .AddOutputField(output_field)
    .WithConsistencyLevel(consistency_level)
    .WithSubRequests(requests)
    .AddSubRequest(request)
    .WithRerank(rerank)
    .WithLimit(limit)
    .WithOffset(offset)
    .WithRoundDecimal(round_decimal)
    .WithIgnoreGrowing(ignore_growing)
    .AddExtraParam(key, value)
    .WithGroupByField(field_name)
    .WithGroupSize(group_size)
    .WithStrictGroupSize(strict_group_size);
```

### HybridSearchRequest\{#hybridsearchrequest}

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称。若未指定 Partition 名称，将在整个 Collection 范围内进行查询。

- `AddPartitionName(const std::string& partition_name)`

    添加一个 Partition 名称。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    设置输出字段名称。

- `AddOutputField(const std::string& output_field)`

    添加一个输出字段。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    设置一致性级别。详情请参阅文档：https://milvus.io/docs/consistency.md#Consistency-Level.

- `WithSubRequests(std::vector<SubSearchRequestPtr>&& requests)`

    设置子搜索请求。

- `AddSubRequest(const SubSearchRequestPtr& request)`

    添加一个子搜索请求。

- `WithRerank(const FunctionPtr& rerank)`

    设置重排序策略，例如 RRF/Weighted 函数。详情请参阅文档：https://milvus.io/docs/reranking.md.

- `WithLimit(int64_t limit)`

    设置搜索返回数量上限（topk）。

- `WithOffset(int64_t offset)`

    设置偏移量。注意：该值存储在 ExtraParams 中。

- `WithRoundDecimal(int64_t round_decimal)`

    设置小数位舍入精度。

- `WithIgnoreGrowing(bool ignore_growing)`

    设置是否忽略正在写入的数据（growing）标志。

- `AddExtraParam(const std::string& key, const std::string& value)`

    添加额外参数，如 "nlist"、"ef" 等。

- `WithGroupByField(const std::string& field_name)`

    设置分组字段。

- `WithGroupSize(int64_t group_size)`

    设置分组大小。

- `WithStrictGroupSize(bool strict_group_size)`

    设置严格分组大小标志。

### SubSearchRequest\{#subsearchrequest}

```c++
SubSearchRequest()
    .WithAnnsField(field_name)
    .WithLimit(limit)
    .WithFilter(filter)
    .WithMetricType(metric_type)
    .WithTimezone(tz)
    .AddFloatVector(vector)       // or any Add*/With* vector method
    .WithFloatVectors(vectors);   // batch assignment
```

**请求方法：**

- `SubSearchRequest& WithAnnsField(const std::string& ann_field)`

- `SubSearchRequest& WithLimit(int64_t limit)`

- `SubSearchRequest& WithFilter(std::string filter)`

- `SubSearchRequest& WithMetricType(milvus::MetricType metric_type)`

- `SubSearchRequest& WithTimezone(const std::string& timezone)`

**继承的向量方法**（均返回 `SubSearchRequest&` 以支持链式调用）：

- `AddFloatVector(const FloatVecFieldData::ElementT& vector)`

- `AddBinaryVector(const std::string& vector)`

- `AddSparseVector(const SparseFloatVecFieldData::ElementT& vector)`

- `AddFloat16Vector(const Float16VecFieldData::ElementT& vector)`

- `AddBFloat16Vector(const BFloat16VecFieldData::ElementT& vector)`

- `AddInt8Vector(const Int8VecFieldData::ElementT& vector)`

- `AddEmbeddedText(const std::string& text)`

- `AddEmbeddingList(EmbeddingList&& emb_list)` — 用于结构字段 ANN 搜索

- `WithFloatVectors(std::vector<FloatVecFieldData::ElementT>&& vectors)` — 批量设置

- `WithSparseVectors(...)`、`WithFloat16Vectors(...)` 等 — 批量设置变体

### 查询向量类型\{#query-vector-types}

每个 `SubSearchRequest` 接受一种与目标字段 [DataType](./Collections-DataType) 相匹配的查询向量表示形式。请使用对应的单个添加或批量构建方法；这些属于查询输入，而非 Collection 的列数据负载。

| Schema DataType | 请求方法 | C++ 表示形式 | 说明 |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | `AddFloatVector()`、`WithFloatVectors()` | `std::vector<float>` | 稠密浮点向量。 |
| `BINARY_VECTOR` | `AddBinaryVector()`、`WithBinaryVectors()` | 二进制字节或字符串便捷输入 | 使用专用的二进制向量表示形式。 |
| `SPARSE_FLOAT_VECTOR` | `AddSparseVector()`、`WithSparseVectors()` | `std::map<uint32_t, float>` 或支持的 JSON 格式 | 稀疏索引-值对。 |
| `FLOAT16_VECTOR` | `AddFloat16Vector()`、`WithFloat16Vectors()` | `std::vector<uint16_t>` 或可转换的浮点向量 | 浮点重载会自动执行类型转换。 |
| `BFLOAT16_VECTOR` | `AddBFloat16Vector()`、`WithBFloat16Vectors()` | `std::vector<uint16_t>` 或可转换的浮点向量 | 浮点重载会自动执行类型转换。 |
| `INT8_VECTOR` | `AddInt8Vector()`、`WithInt8Vectors()` | `std::vector<int8_t>` | 稠密有符号字节向量。 |
| 函数或结构字段输入 | `AddEmbeddedText()` / `WithEmbeddedTexts()`；`AddEmbeddingList()` / `WithEmbeddingLists()` | `std::string` 或 `EmbeddingList` | 对于支持的函数请使用嵌入文本，对于结构字段 ANN 搜索请使用嵌入列表。 |

**返回值：**

*Status*

返回一个状态对象，指示操作是否成功。

### FieldData\{#fielddata}

这是一个模板类，用于表示单个字段的列式数据。具体的类型别名涵盖了所有支持的数据类型。在通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search结果时，需使用具体类型的实例。

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

此类包含一个或多个相同类型的查询向量，用作 `SearchRequest`、`SubSearchRequest` 或通过 `AddEmbeddingList()` 进行的结构字段 ANN 搜索的目标向量。请调用 Add*/Set* 系列方法构建 `EmbeddingList`，然后将其传递给 `SearchRequestBase::AddEmbeddingList()`。

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

    为支持的文本嵌入函数（如 BM25）追加文本内容。

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

    使用 float16 向量替换当前列表；适用时会自动转换 float 输入。

- `Status SetFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自动转换

    使用 float16 向量替换当前列表；适用时会自动转换 float 输入。

- `Status SetBFloat16Vectors(std::vector<BFloat16VecFieldData::ElementT>&& vectors)`

    使用 bfloat16 向量替换当前列表；适用时会自动转换 float 输入。

- `Status SetBFloat16Vectors(const std::vector<std::vector<float>>& vectors)` — 自动转换

    使用 bfloat16 向量替换当前列表；适用时会自动转换 float 输入。

- `Status SetInt8Vectors(std::vector<Int8VecFieldData::ElementT>&& vectors)`

    使用稠密 int8 向量替换当前列表。

- `Status SetEmbeddedTexts(std::vector<std::string>&& texts)` — 用于 BM25 文本嵌入

    使用受支持嵌入函数的文本输入替换当前列表。

### SearchResults\{#searchresults}

`SearchResponse::Results()` 针对完整的搜索调用返回一个 `SearchResults` 对象。`SearchResults` 为每个查询向量包含一个 `SingleResult`，并保持与查询向量相同的顺序。

此类通过在 `SearchResponse` 或 `HybridSearchResponse` 上调用 `Results()` 获取。

```c++
SearchResults();
explicit SearchResults(std::vector<SingleResult>&& results);
```

**方法：**

- `const std::vector<SingleResult>& Results() const`

    为每个查询向量返回一个 `SingleResult`，顺序与向量添加到请求中的顺序一致。

- `const std::vector<float>& Recalls() const`

    每个查询向量的召回率值。仅当在 Zilliz Cloud 实例上执行搜索且 `enable_recall_calculation` 设置为 `true` 时才会填充此数据，否则该向量为空。

#### SingleResult\{#singleresult}

`SingleResult` 包含一个查询向量的 top-k 命中结果，包括分数、主键和请求的输出字段。`SearchResults` 是包含这些按查询结果的外部 Collection。

```c++
struct SingleResult {
    SingleResult(const std::string& pk_name, const std::string& score_name,
                 std::vector<FieldDataPtr>&& output_fields,
                 const std::set<std::string>& output_names);
};

using SingleResultPtr = std::shared_ptr<SingleResult>;
```

**方法：**

- `const std::vector<float>& Scores() const`

    返回该查询向量的相似度分数或距离。

- `IDArray Ids() const`

    返回命中结果的主键值。若需保留主键字段的原始类型，建议优先使用 OutputField()。

- `const std::string& PrimaryKeyName() const`

    返回服务端报告的主键字段名称。

- `const std::string& ScoreName() const`

    返回结果中的分数字段名称，包含为避免冲突而添加的前缀（如有）。

- `FieldDataPtr OutputField(const std::string& name) const`

    按名称返回指定的输出字段；模板重载会将其转换为请求的具体 FieldData 类型。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    以 FieldDataPtr 形式返回所有请求的输出字段。

- `const std::set<std::string>& OutputFieldNames() const`

    返回请求的输出字段名称列表。

- `Status OutputRows(EntityRows& rows) const`

    将所有命中结果实体化为面向行的 Entity 数据。

- `Status OutputRow(int i, EntityRow& row) const`

    按从零开始的索引实体化单个命中结果。

- `uint64_t GetRowCount() const`

    返回此结果集中的命中数量。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取详细的错误信息。

#### 输出字段类型\{#output-field-types}

请求的 Entity 字段通过 `FieldDataPtr` 返回。具体的 `XxxFieldData` 类型取决于字段的 Schema [DataType](./Collections-DataType)；可使用 `OutputField(name)` 获取基类指针，或使用 `OutputField<T>(name)` 进行带类型检查的共享指针转换。

指针约定为 `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>`。该结果表示形式由搜索和查询接口共用，指针别名不会作为独立的 API 页面列出。

## 示例\{#example}

演示如何使用 C++ SDK 调用 HybridSearch()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::HybridSearchRequest();
milvus::HybridSearchResponse response;
util::CheckStatus(client->HybridSearch(request, response));
```

---
title: "Query() | Cloud"
slug: /cpp/cpp/Vector-Query
sidebar_label: "Query()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "根据一组条件进行查询，返回与查询条件完全匹配的记录列表。| Cloud"
type: docx
token: LtZhdRryBo4vAwxHJmDcbsKvnhK
sidebar_position: 5
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - Query()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Query()

根据一组条件进行查询，返回与查询条件完全匹配的记录列表。

```c++
Status Query(const QueryRequest& request, QueryResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = QueryRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .AddPartitionName(partition_name)
    .WithOutputFields(output_field_names)
    .AddOutputField(output_field)
    .WithConsistencyLevel(consistency_level)
    .WithFilter(filter)
    .AddFilterTemplate(key, filter_template)
    .WithFilterTemplates(filter_templates)
    .WithLimit(limit)
    .WithOffset(offset)
    .WithIgnoreGrowing(ignore_growing)
    .AddExtraParam(key, value)
    .WithTimezone(timezone)
    .WithOrderByFields(order_by_fields)
    .AddOrderByField(order_by_field);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称，若为空则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称列表。若未指定 Partition 名称，将在整个 Collection 中进行查询。

- `AddPartitionName(const std::string& partition_name)`

    添加一个 Partition 名称。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    设置输出字段名称列表。

- `AddOutputField(const std::string& output_field)`

    添加一个输出字段。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    设置一致性级别。详情请参阅文档：https://milvus.io/docs/consistency.md#Consistency-Level.

- `WithFilter(std::string filter)`

    设置过滤表达式。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    为过滤表达式中的占位符添加一个值。仅在请求包含非空过滤条件时使用，可避免重复解析较大的字面量值。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    替换过滤表达式中使用的所有占位符值。键对应于 \{age\} 或 \{city\} 等占位符；值可以是布尔值、数值、字符串或数组数据。

- `WithLimit(int64_t limit)`

    设置 limit 值，仅在表达式为空时可用。\n 注意：此值存储在 ExtraParams 中。

- `WithOffset(int64_t offset)`

    设置 offset 值，仅在表达式为空时可用。\n 注意：此值存储在 ExtraParams 中。

- `WithIgnoreGrowing(bool ignore_growing)`

    设置是否忽略正在增长的 Segment。注意：此值存储在 ExtraParams 中。

- `AddExtraParam(const std::string& key, const std::string& value)`

    添加额外参数。

- `WithTimezone(const std::string& timezone)`

    设置时区，对 Timestamptz 字段生效。注意：此值存储在 ExtraParams 中。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    设置用于对查询结果排序的字段。

- `AddOrderByField(OrderByField order_by_field)`

    添加一个用于对查询结果排序的字段。

**返回值：**

*Status*

返回一个状态对象，指示操作是否成功。

### FieldData\{#fielddata}

这是一个表示单个字段列式数据的模板类。具体的类型别名涵盖了所有支持的数据类型。在通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search结果时，需使用具体类型的实例。

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

### QueryResults\{#queryresults}

此类保存由 `Query()` 调用返回的列式结果数据。您可以通过 `QueryResponse` 对象上的 `Results()` 访问该数据。

```c++
const QueryResults& results = response.Results();
```

**方法：**

- `FieldDataPtr OutputField(const std::string& name) const`

    以 `FieldDataPtr` 形式返回指定名称的输出字段。可使用 `std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` 将其转换为具体类型。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    按服务端返回的顺序返回所有输出字段。

- `const std::set<std::string>& OutputFieldNames() const`

    返回查询中请求的输出字段名称集合。

- `Status OutputRows(EntityRows& rows) const`

    将所有结果行转换为类 JSON 的行映射向量，并将其存储在 `rows` 中。

- `Status OutputRow(int i, EntityRow& row) const`

    将索引为 `i` 的行转换为类 JSON 的行映射。

- `uint64_t GetRowCount() const`

    返回的行数。当查询使用 `count(*)` 时，此方法返回聚合计数。

#### 输出字段类型\{#output-field-types}

请求的 Entity 字段通过 `FieldDataPtr` 返回。具体的 `XxxFieldData` 类型取决于字段的 Schema [DataType](./Collections-DataType)；请使用 `OutputField(name)` 获取基类指针，或使用 `OutputField<T>(name)` 进行带检查的共享指针转换。

指针命名约定为 `XxxFieldDataPtr = std::shared_ptr<XxxFieldData>`。这种结果表示形式由搜索和查询接口共用，指针别名不会作为单独的 API 页面列出。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取故障详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 Query()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::QueryRequest();
milvus::QueryResponse response;
util::CheckStatus(client->Query(request, response));
```

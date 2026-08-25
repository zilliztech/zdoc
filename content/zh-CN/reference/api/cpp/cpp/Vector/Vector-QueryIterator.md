---
title: "QueryIterator() | Cloud"
slug: /cpp/cpp/Vector-QueryIterator
sidebar_label: "QueryIterator()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "根据过滤表达式获取基于标量字段的 QueryIterator 对象。迭代器使用期间请勿断开 MilvusClientV2 连接，并需在请求中指定主键字段名。 | Cloud"
type: docx
token: T4HRdSHCboHtR4xmvxqcekTvnX7
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - QueryIterator()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# QueryIterator()

根据过滤表达式获取基于标量字段的 QueryIterator 对象。迭代器使用期间请勿断开 MilvusClientV2 连接，并需在请求中指定主键字段名。

```c++
Status QueryIterator(QueryIteratorRequest& request, QueryIteratorPtr& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = QueryIteratorRequest()
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
    .AddOrderByField(order_by_field)
    .WithReduceStopForBest(reduce_stop_for_best);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称列表。若未指定 Partition，将在整个 Collection 范围内进行查询。

- `AddPartitionName(const std::string& partition_name)`

    添加单个 Partition 名称。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    设置输出字段名称列表。

- `AddOutputField(const std::string& output_field)`

    添加单个输出字段。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    设置一致性级别。详情请参阅文档：https://milvus.io/docs/consistency.md#Consistency-Level.

- `WithFilter(std::string filter)`

    设置过滤表达式。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    为过滤表达式中的占位符绑定一个值。该功能仅在请求包含非空过滤条件时有效，可避免重复解析较大的字面量。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    批量替换过滤表达式中使用的所有占位符值。键对应诸如 \{age\} 或 \{city\} 等占位符；值支持布尔型、数值型、字符串或数组类型。

- `WithLimit(int64_t limit)`

    设置 limit 值，仅在表达式为空时生效。\n 注意：此值存储在 ExtraParams 中。

- `WithOffset(int64_t offset)`

    设置 offset 值，仅在表达式为空时生效。\n 注意：此值存储在 ExtraParams 中。

- `WithIgnoreGrowing(bool ignore_growing)`

    设置是否忽略正在增长的 Segment。注意：此值存储在 ExtraParams 中。

- `AddExtraParam(const std::string& key, const std::string& value)`

    添加额外参数。

- `WithTimezone(const std::string& timezone)`

    设置时区，仅对 Timestamptz 类型字段生效。注意：此值存储在 ExtraParams 中。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    设置用于查询结果排序的字段列表。

- `AddOrderByField(OrderByField order_by_field)`

    添加单个用于查询结果排序的字段。

- `WithReduceStopForBest(bool reduce_stop_for_best)`

    设置内部检索策略标志位。

**返回值：**

*Status*

返回表示操作是否成功的状态对象。

### FieldData\{#fielddata}

这是一个表示单字段列式数据的模板类，其具体别名覆盖了所有支持的数据类型。在通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search结果时，均需使用对应具体类型的实例。

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

此类封装了由 `Query()` 调用返回的列式结果数据。您可以通过 `QueryResponse` 对象的 `Results()` 方法来访问这些数据。

```c++
const QueryResults& results = response.Results();
```

**方法：**

- `FieldDataPtr OutputField(const std::string& name) const`

    以 `FieldDataPtr` 形式返回指定名称的输出字段。可使用 `std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` 将其转换为具体类型。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    按照服务端返回的顺序获取所有输出字段。

- `const std::set<std::string>& OutputFieldNames() const`

    返回本次查询请求中指定的输出字段名称集合。

- `Status OutputRows(EntityRows& rows) const`

    将所有结果行转换为类 JSON 的行映射向量，并存入 `rows` 中。

- `Status OutputRow(int i, EntityRow& row) const`

    将索引为 `i` 的行转换为类 JSON 的行映射。

- `uint64_t GetRowCount() const`

    返回的结果行数。若查询使用了 `count(*)`，则返回聚合后的总数。

### Iterator\{#iterator}

QueryIterator 是 Iterator&lt;QueryResults&gt; 的类型别名。当完整结果集超出单次请求限制时，可使用它分批检索查询数据。

### 输出字段类型\{#output-field-types}

请求的 Entity 字段通过 `FieldDataPtr` 返回。具体的 `XxxFieldData` 类型取决于字段的 Schema [DataType](./Collections-DataType)；您可以使用 `OutputField(name)` 获取基类指针，或使用 `OutputField<T>(name)` 进行带检查的共享指针转换。

指针命名约定为 XxxFieldDataPtr = std::shared_ptr&lt;XxxFieldData&gt;。这种结果表示方式专供查询接口使用，各指针别名不会作为独立的 API 页面展示。

### Iterator\{#iterator}

抽象基类。请勿直接实例化此类，应使用下文所述的 QueryIterator 别名。

```c++
template <typename T>
class Iterator {
 public:
    virtual Status Next(T& results) = 0;
};
```

- `virtual Status Next(T& results) = 0`

### QueryIterator\{#queryiterator}

用于遍历 `QueryIterator()` 调用产生的 `QueryResults` 批次数据。每次调用 `Next()` 都会将下一批行数据填充至 `QueryResults` 中。

```c++
using QueryIterator    = Iterator<QueryResults>;
using QueryIteratorPtr = std::shared_ptr<QueryIterator>;
```

通过 `MilvusClientV2::QueryIterator(IteratorArguments, QueryIteratorPtr&)` 获取。

**错误处理：**

- **std::exception**

    当请求构建、网络传输或响应处理失败时抛出。请检查异常消息或返回的 Status 对象以获取详细错误信息。

## 示例\{#example}

演示如何使用 C++ SDK 调用 QueryIterator()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::QueryIteratorRequest();
milvus::QueryIteratorPtr response;
util::CheckStatus(client->QueryIterator(request, response));
```

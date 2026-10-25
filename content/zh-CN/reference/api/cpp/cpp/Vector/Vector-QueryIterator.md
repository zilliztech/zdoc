---
title: "QueryIterator() | Cloud"
slug: /cpp/cpp/Vector-QueryIterator
sidebar_label: "QueryIterator()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "根据过滤表达式获取基于一个或多个标量字段的 QueryIterator 对象。迭代器使用期间请勿断开 MilvusClientV2 连接。请在请求中指定主键字段名。 | Cloud"
type: docx
token: T4HRdSHCboHtR4xmvxqcekTvnX7
sidebar_position: 6
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - QueryIterator()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# QueryIterator()

根据过滤表达式获取基于一个或多个标量字段的 QueryIterator 对象。迭代器使用期间请勿断开 MilvusClientV2 连接。请在请求中指定主键字段名。

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

    设置目标 Database 名称；若其为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称。如果 Partition 名称为空，则会在整个 Collection 中查询。

- `AddPartitionName(const std::string& partition_name)`

    添加 Partition 名称。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    设置输出字段名。

- `AddOutputField(const std::string& output_field)`

    添加输出字段。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    设置一致性级别。请参见 [一致性级别](/docs/consistency-level)。

- `WithFilter(std::string filter)`

    设置过滤表达式。

- `AddFilterTemplate(std::string key, const nlohmann::json& filter_template)`

    为过滤表达式中的占位符添加一个值。仅当请求包含非空过滤器时才会使用，可避免重复解析较大的字面量值。

- `WithFilterTemplates(std::unordered_map<std::string, nlohmann::json>&& filter_templates)`

    替换过滤表达式使用的所有占位符值。键对应 \{age\} 或 \{city\} 等占位符；值可以是布尔值、数值、字符串或数组数据。

- `WithLimit(int64_t limit)`

    设置 limit 值，仅在表达式为空时可用。\n 注意：此值存储在 ExtraParams 中。

- `WithOffset(int64_t offset)`

    设置 offset 值，仅在表达式为空时可用。\n 注意：此值存储在 ExtraParams 中。

- `WithIgnoreGrowing(bool ignore_growing)`

    设置是否忽略正在增长的 Segment。注意：此值存储在 ExtraParams 中。

- `AddExtraParam(const std::string& key, const std::string& value)`

    添加额外参数。

- `WithTimezone(const std::string& timezone)`

    设置时区，仅对 Timestamptz 字段生效。注意：此值存储在 ExtraParams 中。

- `WithOrderByFields(std::vector<OrderByField>&& order_by_fields)`

    设置用于对查询结果排序的字段。

- `AddOrderByField(OrderByField order_by_field)`

    添加用于对查询结果排序的字段。

- `WithReduceStopForBest(bool reduce_stop_for_best)`

    设置内部检索策略的标志。

**返回值：**

*Status*

返回一个状态，指示操作是否成功。

### FieldData\{#fielddata}

这是一个表示单个字段列式数据的模板类。具体别名覆盖所有支持的数据类型。通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search结果时，会使用具体类型的实例。

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

此类保存由 `Query()` 调用返回的列式结果数据。可通过 `QueryResponse` 对象的 `Results()` 访问。

```c++
const QueryResults& results = response.Results();
```

**方法：**

- `FieldDataPtr OutputField(const std::string& name) const`

    以 `FieldDataPtr` 形式返回指定名称的输出字段。使用 `std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` 转换为具体类型。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    按服务器返回的顺序返回所有输出字段。

- `const std::set<std::string>& OutputFieldNames() const`

    返回查询中请求的输出字段名集合。

- `Status OutputRows(EntityRows& rows) const`

    将所有结果行转换为类似 JSON 的行映射向量，并将其存储在 `rows` 中。

- `Status OutputRow(int i, EntityRow& row) const`

    将索引 `i` 处的行转换为类似 JSON 的行映射。

- `uint64_t GetRowCount() const`

    返回的行数。当查询使用 `count(*)` 时，返回聚合计数。

### Iterator\{#iterator}

QueryIterator 是 Iterator&lt;QueryResults&gt; 的别名。当完整结果集大于单次请求限制时，可使用它分批检索查询行。

### 输出字段类型\{#output-field-types}

请求的 Entity 字段通过 `FieldDataPtr` 返回。具体的 `XxxFieldData` 类型遵循字段的 Schema [DataType](./Collections-DataType)；使用 `OutputField(name)` 获取基础指针，或使用 `OutputField<T>(name)` 进行带检查的共享指针转换。

指针约定为 XxxFieldDataPtr = std::shared_ptr&lt;XxxFieldData&gt;。此结果表示形式由查询接口使用，不会使这些指针别名单独成为 API 页面。

### Iterator\{#iterator}

抽象基类。请勿直接实例化；请使用下方的 QueryIterator 别名。

```c++
template <typename T>
class Iterator {
 public:
    virtual Status Next(T& results) = 0;
};
```

- `virtual Status Next(T& results) = 0`

### QueryIterator\{#queryiterator}

遍历 `QueryIterator()` 调用产生的 `QueryResults` 批次。每次调用 `Next()` 都会用下一批行填充 `QueryResults`。

```c++
using QueryIterator    = Iterator<QueryResults>;
using QueryIteratorPtr = std::shared_ptr<QueryIterator>;
```

通过 `MilvusClientV2::QueryIterator(IteratorArguments, QueryIteratorPtr&)` 获取。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

演示如何通过 C++ SDK 使用 QueryIterator()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::QueryIteratorRequest();
milvus::QueryIteratorPtr response;
util::CheckStatus(client->QueryIterator(request, response));
```

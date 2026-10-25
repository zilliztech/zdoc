---
title: "Get() | Cloud"
slug: /cpp/cpp/Vector-Get
sidebar_label: "Get()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过主键发起查询，并返回记录列表。 | Cloud"
type: docx
token: Ve9xdWGNYobA52xfC7kcD4wMnkh
sidebar_position: 2
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - zilliz cloud
  - cloud
  - Get()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Get()

此操作通过主键发起查询，并返回记录列表。

```c++
Status Get(const GetRequest& request, GetResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .WithOutputFields(output_field_names)
    .WithConsistencyLevel(consistency_level)
    .WithIDs(id_array);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称。若未指定，则使用默认 Partition。

- `AddPartitionName(const std::string& partition_name)`

    添加一个 Partition 名称。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    设置输出字段名称。

- `AddOutputField(const std::string& output_field)`

    添加一个输出字段。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    设置一致性级别。

- `WithIDs(std::vector<int64_t>&& id_array)`

    设置 ID 数组。

**返回值：**

包含 *GetResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作是否成功。

### FieldData\{#fielddata}

这是一个表示单个字段列式数据的模板类。具体别名涵盖所有支持的数据类型。通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search 结果时，会使用这些具体类型的实例。

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

此类保存 `Query()` 调用返回的列式结果数据。可通过 `QueryResponse` 对象上的 `Results()` 访问。

```c++
const QueryResults& results = response.Results();
```

**方法：**

- `FieldDataPtr OutputField(const std::string& name) const`

    以 `FieldDataPtr` 形式返回指定名称的输出字段。可使用 `std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` 转换为具体类型。

- `const std::vector<FieldDataPtr>& OutputFields() const`

    按服务器返回的顺序返回所有输出字段。

- `const std::set<std::string>& OutputFieldNames() const`

    返回查询中请求的输出字段名称集合。

- `Status OutputRows(EntityRows& rows) const`

    将所有结果行转换为类 JSON 的行映射向量，并将其存储在 `rows` 中。

- `Status OutputRow(int i, EntityRow& row) const`

    将索引 `i` 处的行转换为类 JSON 的行映射。

- `uint64_t GetRowCount() const`

    返回的行数。当查询使用 `count(*)` 时，返回聚合计数。

#### GetResponse 统计信息\{#getresponse-statistics}

`GetResponse` 对象提供用于说明操作开销的执行统计信息。

**方法：**

- `int64_t Cost() const`

    返回操作开销，单位为毫秒。

- `int64_t ScannedRemoteBytes() const`

    返回从远程存储扫描的字节数。

- `int64_t ScannedTotalBytes() const`

    返回扫描的总字节数。

- `float CacheHitRatio() const`

    返回缓存命中率，值为 0.0 到 1.0。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 字段数据类型别名\{#field-data-type-aliases}

| 类别 | 具体类型 | 表示形式和说明 |
| --- | --- | --- |
| 标量 | BoolFieldData, Int8FieldData, Int16FieldData, Int32FieldData, Int64FieldData, FloatFieldData, DoubleFieldData, VarCharFieldData, JSONFieldData, GeometryFieldData, TimestamptzFieldData | FieldData&lt;T, DataType::...&gt; 的别名。Geometry 使用 WKT 字符串；timestamptz 使用 ISO-8601 字符串。 |
| 向量 | FloatVecFieldData, Float16VecFieldData, BFloat16VecFieldData, Int8VecFieldData, SparseFloatVecFieldData, BinaryVecFieldData | 稠密和稀疏向量容器。BinaryVecFieldData 是带有字符串转换辅助方法的派生类。 |
| 数组和结构体 | ArrayBoolFieldData, ArrayInt8FieldData, ArrayInt16FieldData, ArrayInt32FieldData, ArrayInt64FieldData, ArrayFloatFieldData, ArrayDoubleFieldData, ArrayVarCharFieldData, StructFieldData | ArrayFieldData&lt;T, Et&gt; 的别名；每个 Entity 行都是一个向量。结构体值使用 JSON 存储。 |
| 共享指针 | XxxFieldDataPtr | 每种具体字段数据类型都有一个对应的 std::shared_ptr&lt;XxxFieldData&gt; 别名。 |

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<int64_t> ids = {5, 1, 10, 8};
auto request = milvus::GetRequest()
                   .WithCollectionName(collection_name)
                   .WithIDs(std::move(ids))
                   .AddOutputField(field_vector);

milvus::GetResponse response;
status = client->Get(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto query_results = response.Results();
milvus::EntityRows output_rows;
status = query_results.OutputRows(output_rows);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Get results:" << std::endl;
for (const auto& row : output_rows) {
    std::cout << "\t" << row << std::endl;
}
```

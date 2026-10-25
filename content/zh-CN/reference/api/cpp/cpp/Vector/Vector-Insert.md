---
title: "Insert() | Cloud"
slug: /cpp/cpp/Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "向 Collection 中插入数据。您可以输入基于列的数据或基于行的数据。 | Cloud"
type: docx
token: MI1HdCRUbo7J60xbMsic3P9qnIb
sidebar_position: 4
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - Zilliz
  - Zilliz Cloud
  - 云
  - Insert()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Insert()

向 Collection 中插入数据。您可以输入基于列的数据或基于行的数据。

```c++
Status Insert(const InsertRequest& request, InsertResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = InsertRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name)
    .WithColumnsData(columns_data)
    .AddColumnData(column_data)
    .WithRowsData(rows_data)
    .AddRowData(row_data);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；如果该名称为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithPartitionName(const std::string& partition_name)`

    设置 Partition 名称。如果 Partition 名称为空，将使用默认 Partition。

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    通过流式接口设置字段数据。不可同时设置 ColumnsData 和 RowsData。

- `AddColumnData(const FieldDataPtr& column_data)`

    通过流式接口设置单个字段的数据。不可同时设置 ColumnsData 和 RowsData。

- `WithRowsData(EntityRows&& rows_data)`

    通过流式接口设置 Entity 行数据。不可同时设置 ColumnsData 和 RowsData。

- `AddRowData(EntityRow&& row_data)`

    通过流式接口添加 Entity 行数据。不可同时设置 ColumnsData 和 RowsData。

### 列负载类型\{#column-payload-types}

Collection Schema 使用 [DataType](./Collections-DataType) 声明每个字段的逻辑类型。对于 `Insert()` 和 `Upsert()`，请通过公共基指针 `FieldDataPtr` 传入对应的列容器。

| Schema DataType | 列负载类型 | C++ 表示 | 说明 |
| --- | --- | --- | --- |
| BOOL | BoolFieldData | bool | 布尔标量值。 |
| INT8, INT16, INT32, INT64 | 匹配的 Int&ast;FieldData | 匹配的定宽整数 | 请选择与 Schema 类型匹配的容器。 |
| FLOAT, DOUBLE | FloatFieldData, DoubleFieldData | float, double | 浮点标量值。 |
| VARCHAR, JSON, GEOMETRY, TIMESTAMPTZ | VarCharFieldData 或 JSONFieldData | std::string 或 nlohmann::json | Geometry 和 timestamptz 通过字符串负载别名传输。 |
| FLOAT_VECTOR, FLOAT16_VECTOR, BFLOAT16_VECTOR, INT8_VECTOR | 匹配的稠密向量 FieldData 类 | std::vector&lt;float&gt;、std::vector&lt;uint16_t&gt; 或 std::vector&lt;int8_t&gt; | 请选择与向量编码匹配的容器。 |
| SPARSE_FLOAT_VECTOR, BINARY_VECTOR | SparseFloatVecFieldData, BinaryVecFieldData | std::map\<uint32_t, float> 或专用的二进制存储 | 二进制向量使用专用类。 |
| ARRAY, STRUCT | 专用的 Array&ast;FieldData 或 StructFieldData | 特定元素的容器或数组形式的 nlohmann::json 存储 | ARRAY 声明元素类型；STRUCT 使用带有 DataType::STRUCT 的数组模板。 |
| UNKNOWN | None | None | 无插入负载。 |

对于具体容器 `XxxFieldData`，其指针别名 `XxxFieldDataPtr` 为 `std::shared_ptr<XxxFieldData>`。DML 请求通过 `FieldDataPtr` 接收这些值。

**返回：**

*Status*

返回一个状态，指示操作是否成功。

### FieldData\{#fielddata}

该模板类表示单个字段的列式数据。具体别名覆盖所有支持的数据类型。通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search 结果时，会使用这些具体类型的实例。

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

### DmlResults\{#dmlresults}

该类承载数据变更操作（插入、Upsert 或删除）的结果。可通过 `InsertResponse`、`UpsertResponse` 或 `DeleteResponse` 上的 `Results()` 访问。

```c++
const DmlResults& results = response.Results();
```

**方法：**

- `const IDArray& IdArray() const`

    已插入、Upsert 或删除的 Entity ID。对于自动 ID Collection，服务端会在插入后填充此字段。有关如何读取整型 ID 或字符串 ID，请参阅 IDArray。

- `uint64_t Timestamp() const`

    服务端操作时间戳。可在后续的搜索或查询调用中将其作为 `guarantee_timestamp` 传入，以确保读己之写一致性。

- `uint64_t InsertCount() const`

    已插入的行数。在 `InsertResponse` 和 `UpsertResponse` 中填充此值。

- `uint64_t DeleteCount() const`

    已删除的行数。在 `DeleteResponse` 和 `UpsertResponse` 中填充此值。

- `uint64_t UpsertCount() const`

    已 Upsert 的行数（作为新行插入或替换现有行）。在 `UpsertResponse` 中填充此值。

- `int64_t Cost() const`

    返回操作的成本，单位为毫秒。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 调用 Insert()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::InsertRequest();
milvus::InsertResponse response;
util::CheckStatus(client->Insert(request, response));
```

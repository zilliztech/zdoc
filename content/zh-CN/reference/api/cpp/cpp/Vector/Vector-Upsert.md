---
title: "Upsert() | Cloud"
slug: /cpp/cpp/Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "对 Collection 中的 Entity 执行 Upsert 操作。支持按列或按行输入数据。| Cloud"
type: docx
token: ZOzKddUzaoED8mxB0znc6njxngR
sidebar_position: 10
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - Upsert()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Upsert()

对 Collection 中的 Entity 执行 Upsert 操作。支持按列或按行输入数据。

```c++
Status Upsert(const UpsertRequest& request, UpsertResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = UpsertRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name)
    .WithColumnsData(columns_data)
    .AddColumnData(column_data)
    .WithRowsData(rows_data)
    .AddRowData(row_data)
    .WithPartialUpdate(partial_update)
    .WithFieldOps(field_ops)
    .AddFieldOp(field_op);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    Set database name. If database name is empty, will list collections of the default database.

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionName(const std::string& partition_name)`

    Set new name of the partition. If partition name is empty, it will insert data into the default partition.

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    通过流式接口设置字段数据。不可同时设置 ColumnsData 和 RowsData。

- `AddColumnData(const FieldDataPtr& column_data)`

    通过流式接口设置单个字段的数据。不可同时设置 ColumnsData 和 RowsData。

- `WithRowsData(EntityRows&& rows_data)`

    通过流式接口设置 Entity 行数据。不可同时设置 ColumnsData 和 RowsData。

- `AddRowData(EntityRow&& row_data)`

    通过流式接口添加一行 Entity 数据。不可同时设置 ColumnsData 和 RowsData。

- `WithPartialUpdate(bool partial_update)`

    Set database name. If True, only the specified fields will be updated while others remain unchanged. Default is False.

- `WithFieldOps(std::vector<FieldPartialUpdateOp>&& field_ops)`

    通过流式接口设置按字段的部分更新操作。

- `AddFieldOp(FieldPartialUpdateOp field_op)`

    添加一个按字段的部分更新操作。

### 列数据类型\{#column-payload-types}

Collection Schema 使用 [DataType](./Collections-DataType) 声明各字段的逻辑类型。对于 `Insert()` 和 `Upsert()`，请通过通用的 `FieldDataPtr` 基指针传入对应的列容器。

| Schema DataType | 列数据类型 | C++ 表示 | 说明 |
| --- | --- | --- | --- |
| `BOOL` | `BoolFieldData` | `bool` | 布尔标量值。 |
| `INT8`、`INT16`、`INT32`、`INT64` | 匹配的 `Int*FieldData` | 匹配的定长整数类型 | 请选择与 Schema 类型匹配的容器。 |
| `FLOAT`、`DOUBLE` | `FloatFieldData`、`DoubleFieldData` | `float`、`double` | 浮点标量值。 |
| `VARCHAR`、`JSON`、`GEOMETRY`、`TIMESTAMPTZ` | `VarCharFieldData` 或 `JSONFieldData` | `std::string` 或 `nlohmann::json` | Geometry 和 timestamptz 通过字符串载荷别名传输。 |
| `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` | 匹配的稠密向量 `FieldData` 类 | `std::vector<float>`、`std::vector<uint16_t>` 或 `std::vector<int8_t>` | 请选择与向量编码方式匹配的容器。 |
| `SPARSE_FLOAT_VECTOR`、`BINARY_VECTOR` | `SparseFloatVecFieldData`、`BinaryVecFieldData` | `std::map<uint32_t, float>` 或专用二进制存储 | 二值向量使用专用类。 |
| `ARRAY`、`STRUCT` | 专用的 `Array*FieldData` 或 `StructFieldData` | 特定元素类型的容器或数组形式的 `nlohmann::json` 存储 | Array 需声明元素类型；Struct 使用带有 `DataType::STRUCT` 的数组模板。 |
| `UNKNOWN` | 无 | 无 | 无插入载荷。 |

对于具体容器 `XxxFieldData`，其指针别名 `XxxFieldDataPtr` 为 `std::shared_ptr<XxxFieldData>`。DML 请求通过 `FieldDataPtr` 接收这些值。

**返回值：**

*Status*

返回一个状态对象，指示操作是否成功。

### FieldData\{#fielddata}

这是一个表示单字段列数据的模板类，其具体别名覆盖了所有支持的数据类型。在通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取查询/search结果时，均使用具体类型的实例。

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

此类承载数据变更操作（Insert、Upsert 或 Delete）的结果。可通过 `InsertResponse`、`UpsertResponse` 或 `DeleteResponse` 上的 `Results()` 访问。

```c++
const DmlResults& results = response.Results();
```

**方法：**

- `const IDArray& IdArray() const`

    已插入、Upsert 或删除的 Entity ID。对于自动 ID 的 Collection，服务端会在插入后自动填充此字段。关于如何读取整型或字符串 ID，请参阅 IDArray。

- `uint64_t Timestamp() const`

    服务端操作时间戳。可将其作为后续 Search 或 Query 调用中的 `guarantee_timestamp` 参数传入，以确保“读己之写”一致性。

- `uint64_t InsertCount() const`

    已插入的行数。适用于 `InsertResponse` 和 `UpsertResponse`。

- `uint64_t DeleteCount() const`

    已删除的行数。适用于 `DeleteResponse` 和 `UpsertResponse`。

- `uint64_t UpsertCount() const`

    已 Upsert 的行数（包括新插入和替换已有记录）。适用于 `UpsertResponse`。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取详细的失败原因。

## 示例\{#example}

演示如何使用 C++ SDK 调用 Upsert()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::UpsertRequest();
milvus::UpsertResponse response;
util::CheckStatus(client->Upsert(request, response));
```

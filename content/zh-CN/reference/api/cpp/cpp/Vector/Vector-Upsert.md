---
title: "Upsert() | Cloud"
slug: /cpp/cpp/Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Upsert Collection 中的 Entity。您可以输入列式数据或行式数据。 | Cloud"
type: docx
token: ZOzKddUzaoED8mxB0znc6njxngR
sidebar_position: 10
keywords: 
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Milvus 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - Upsert()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Upsert()

Upsert Collection 中的 Entity。您可以输入列式数据或行式数据。

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

    设置 Database 名称。如果 Database 名称为空，将列出默认 Database 中的 Collection。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithPartitionName(const std::string& partition_name)`

    设置 Partition 的新名称。如果 Partition 名称为空，则会将数据插入默认 Partition。

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    使用链式接口设置字段数据。不允许同时设置 ColumnsData 和 RowsData。

- `AddColumnData(const FieldDataPtr& column_data)`

    使用链式接口设置一个字段的数据。不允许同时设置 ColumnsData 和 RowsData。

- `WithRowsData(EntityRows&& rows_data)`

    使用链式接口设置 Entity 行。不允许同时设置 ColumnsData 和 RowsData。

- `AddRowData(EntityRow&& row_data)`

    使用链式接口添加 Entity 行。不允许同时设置 ColumnsData 和 RowsData。

- `WithPartialUpdate(bool partial_update)`

    设置 Database 名称。如果为 True，则仅更新指定的字段，其他字段保持不变。该值默认为 False。

- `WithFieldOps(std::vector<FieldPartialUpdateOp>&& field_ops)`

    使用链式接口设置逐字段的部分更新操作。

- `AddFieldOp(FieldPartialUpdateOp field_op)`

    添加逐字段的部分更新操作。

### 列载荷类型\{#column-payload-types}

Collection 的 Schema 使用 [DataType](./Collections-DataType) 声明每个字段的逻辑类型。对于 `Insert()` 和 `Upsert()`，请通过通用的 `FieldDataPtr` 基类指针提供相应的列容器。

| Schema DataType | 列载荷类型 | C++ 表示 | 说明 |
| --- | --- | --- | --- |
| BOOL | BoolFieldData | bool | 布尔标量值。 |
| INT8, INT16, INT32, INT64 | Matching Int&ast;FieldData | Matching fixed-width integer | 选择与 Schema 类型匹配的容器。 |
| FLOAT, DOUBLE | FloatFieldData, DoubleFieldData | float, double | 浮点标量值。 |
| VARCHAR, JSON, GEOMETRY, TIMESTAMPTZ | VarCharFieldData or JSONFieldData | std::string or nlohmann::json | Geometry 和 timestamptz 通过字符串载荷别名传输。 |
| FLOAT_VECTOR, FLOAT16_VECTOR, BFLOAT16_VECTOR, INT8_VECTOR | Matching dense-vector FieldData class | std::vector&lt;float&gt;, std::vector&lt;uint16_t&gt;, or std::vector&lt;int8_t&gt; | 选择与向量编码匹配的容器。 |
| SPARSE_FLOAT_VECTOR, BINARY_VECTOR | SparseFloatVecFieldData, BinaryVecFieldData | std::map\<uint32_t, float> or dedicated binary storage | 二进制向量使用专用类。 |
| ARRAY, STRUCT | Specialized Array&ast;FieldData or StructFieldData | Element-specific container or array-style nlohmann::json storage | 数组会声明元素类型；结构体使用带有 DataType::STRUCT 的数组模板。 |
| UNKNOWN | None | None | 没有插入载荷。 |

对于具体容器 `XxxFieldData`，指针别名 `XxxFieldDataPtr` 为 `std::shared_ptr<XxxFieldData>`。DML 请求通过 `FieldDataPtr` 接受这些值。

**返回：**

*Status*

返回一个状态，指示操作是否成功。

### FieldData\{#fielddata}

这是用于表示单个字段列式数据的模板类。具体别名涵盖所有受支持的数据类型。通过 `InsertRequest::WithRowsData()` 插入数据，或通过 `QueryResults::OutputField()` 和 `SingleResult::OutputField()` 读取 query/search 结果时，将使用这些具体类型的实例。

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

此类承载数据变更操作（插入、Upsert 或删除）的结果。可通过 `InsertResponse`、`UpsertResponse` 或 `DeleteResponse` 上的 `Results()` 访问。

```c++
const DmlResults& results = response.Results();
```

**方法：**

- `const IDArray& IdArray() const`

    已插入、Upsert 或删除的 Entity 的 ID。对于 auto-ID Collection，服务器会在插入后填充此值。有关如何读取整数或字符串 ID，请参见 IDArray。

- `uint64_t Timestamp() const`

    服务器端的操作时间戳。可在后续搜索或查询调用中将其作为 `guarantee_timestamp` 传入，以确保读己之写一致性。

- `uint64_t InsertCount() const`

    已插入的行数。`InsertResponse` 和 `UpsertResponse` 会填充此值。

- `uint64_t DeleteCount() const`

    已删除的行数。`DeleteResponse` 和 `UpsertResponse` 会填充此值。

- `uint64_t UpsertCount() const`

    已 Upsert 的行数（作为新行插入或替换现有行）。`UpsertResponse` 会填充此值。

- `int64_t Cost() const`

    返回操作的开销，以毫秒为单位。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

演示如何使用 C++ SDK 执行 Upsert()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::UpsertRequest();
milvus::UpsertResponse response;
util::CheckStatus(client->Upsert(request, response));
```

---
title: "Insert() | Cloud"
slug: /cpp/cpp/Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Insert data into a collection. You can input column-based data or row-based data. | Cloud"
type: docx
token: MI1HdCRUbo7J60xbMsic3P9qnIb
sidebar_position: 4
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - Insert()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Insert()

Insert data into a collection. You can input column-based data or row-based data.

```c++
Status Insert(const InsertRequest& request, InsertResponse& response)
```

## Request Syntax\{#request-syntax}

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

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithPartitionName(const std::string& partition_name)`

    Set the partition name. If partition name is empty, will use the default partition.

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    Set fields data with fluent interface. Not allow to set ColumnsData and RowsData both.

- `AddColumnData(const FieldDataPtr& column_data)`

    Set a field data with fluent interface. Not allow to set ColumnsData and RowsData both.

- `WithRowsData(EntityRows&& rows_data)`

    Set entity rows with fluent interface. Not allow to set ColumnsData and RowsData both.

- `AddRowData(EntityRow&& row_data)`

    Add en entity rows with fluent interface. Not allow to set ColumnsData and RowsData both.

### Column payload types\{#column-payload-types}

The collection schema uses [DataType](./Collections-DataType) to declare each field's logical type. For `Insert()` and `Upsert()`, supply the corresponding column container through the common `FieldDataPtr` base pointer.

| Schema DataType | Column payload type | C++ representation | Notes |
| --- | --- | --- | --- |
| `BOOL` | `BoolFieldData` | `bool` | Boolean scalar values. |
| `INT8`, `INT16`, `INT32`, `INT64` | Matching `Int*FieldData` | Matching fixed-width integer | Choose the container matching the schema type. |
| `FLOAT`, `DOUBLE` | `FloatFieldData`, `DoubleFieldData` | `float`, `double` | Floating-point scalar values. |
| `VARCHAR`, `JSON`, `GEOMETRY`, `TIMESTAMPTZ` | `VarCharFieldData` or `JSONFieldData` | `std::string` or `nlohmann::json` | Geometry and timestamptz are transported through string payload aliases. |
| `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | Matching dense-vector `FieldData` class | `std::vector<float>`, `std::vector<uint16_t>`, or `std::vector<int8_t>` | Choose the container matching the vector encoding. |
| `SPARSE_FLOAT_VECTOR`, `BINARY_VECTOR` | `SparseFloatVecFieldData`, `BinaryVecFieldData` | `std::map<uint32_t, float>` or dedicated binary storage | Binary vectors use a dedicated class. |
| `ARRAY`, `STRUCT` | Specialized `Array*FieldData` or `StructFieldData` | Element-specific container or array-style `nlohmann::json` storage | Arrays declare an element type; structs use the array template with `DataType::STRUCT`. |
| `UNKNOWN` | None | None | Has no insertion payload. |

For a concrete container `XxxFieldData`, the pointer alias `XxxFieldDataPtr` is `std::shared_ptr<XxxFieldData>`. DML requests accept these values through `FieldDataPtr`.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

### FieldData\{#fielddata}

This is the template class that represents column-based data for a single field. Concrete aliases cover every supported data type. Instances of the concrete types are used when inserting data via `InsertRequest::WithRowsData()` or reading query/search results via `QueryResults::OutputField()` and `SingleResult::OutputField()`.

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

This class carries the outcome of a data-mutation operation (insert, upsert, or delete). It is accessed via `Results()` on `InsertResponse`, `UpsertResponse`, or `DeleteResponse`.

```c++
const DmlResults& results = response.Results();
```

**METHODS:**

- `const IDArray& IdArray() const`

    The IDs of the entities that were inserted, upserted, or deleted. For auto-ID collections the server fills this in after insert. See IDArray for how to read integer or string IDs.

- `uint64_t Timestamp() const`

    Server-side operation timestamp. Can be passed as the `guarantee_timestamp` in subsequent search or query calls to ensure read-your-writes consistency.

- `uint64_t InsertCount() const`

    Number of rows that were inserted. Populated for `InsertResponse` and `UpsertResponse`.

- `uint64_t DeleteCount() const`

    Number of rows that were deleted. Populated for `DeleteResponse` and `UpsertResponse`.

- `uint64_t UpsertCount() const`

    Number of rows that were upserted (inserted as new or replaced existing). Populated for `UpsertResponse`.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates Insert() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::InsertRequest();
milvus::InsertResponse response;
util::CheckStatus(client->Insert(request, response));
```

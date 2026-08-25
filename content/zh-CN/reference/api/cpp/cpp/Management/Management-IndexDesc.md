---
title: "IndexDesc | Cloud"
slug: /cpp/cpp/Management-IndexDesc
sidebar_label: "IndexDesc"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此类包含构建向量或标量索引所需的参数。您可以将一个或多个 `IndexDesc` 对象传递给 `CreateIndexRequest:AddIndex()`。`DescribeIndex()` 还会通过 `DescribeIndexResponse::Descs()` 返回包含构建进度和状态信息的 `IndexDesc` 对象。 | Cloud"
type: docx
token: C4kSd9x2GobYZGxDTkacZsX2nlc
sidebar_position: 11
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - IndexDesc
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# IndexDesc

此类包含构建向量或标量索引所需的参数。您可以将一个或多个 `IndexDesc` 对象传递给 `CreateIndexRequest::AddIndex()`。`DescribeIndex()` 还会通过 `DescribeIndexResponse::Descs()` 返回包含构建进度和状态信息的 `IndexDesc` 对象。

```c++
IndexDesc();
IndexDesc(std::string field_name, std::string index_name,
          milvus::IndexType index_type,
          milvus::MetricType metric_type = milvus::MetricType::INVALID);
```

**参数：**

- **field_name** (*std::string*)

    需要创建索引的 Collection 字段名称。

- **index_name** (*std::string*)

    索引的可选名称。如果为空，服务器将使用 `field_name` 作为索引名称。该名称在 Collection 内必须唯一。

- **index_type** (*milvus::IndexType*)

    用于构建索引的算法。可用值请参阅 `IndexType`。

- **metric_type** (*milvus::MetricType*)

    用于比较向量的距离度量。标量字段索引无需指定此参数。默认值：`MetricType::INVALID`（由服务器自动确定）。可用值请参阅 `MetricType`。

## 方法\{#methods}

**输入方法（创建索引时使用）：**

- `Status SetFieldName(std::string field_name)` / `const std::string& FieldName() const`

    设置或获取该索引对应的字段。

- `Status SetIndexName(std::string index_name)` / `const std::string& IndexName() const`

    设置或获取索引名称。创建后该名称不能为空。

- `Status SetIndexType(milvus::IndexType index_type)` / `milvus::IndexType IndexType() const`

    设置或获取索引算法。

- `Status SetMetricType(milvus::MetricType metric_type)` / `milvus::MetricType MetricType() const`

    设置或获取向量距离度量。对于标量字段索引，请保持未设置状态（或使用 `INVALID`）。

- `Status AddExtraParam(const std::string& key, const std::string& value)`

    添加特定于算法的调优参数（例如 IVF 索引的 `milvus::NLIST` / `"nlist"`，以及 HNSW 的 `"M"` 和 `"efConstruction"`）。

- `const std::unordered_map<std::string, std::string>& ExtraParams() const`

    以键值对映射的形式返回所有额外参数。

- `Status ExtraParamsFromJson(std::string json)`

    通过解析 JSON 字符串来填充额外参数。

**输出方法（由 DescribeIndex 填充）：**

- `int64_t IndexId() const`

    由服务器分配的索引标识符。

- `milvus::IndexStateCode StateCode() const`

    当前构建状态：`NONE`、`UNISSUED`、`IN_PROGRESS`、`FINISHED` 或 `FAILED`。

- `std::string FailReason() const`

    当 `StateCode()` 为 `FAILED` 时显示的失败信息。

- `int64_t IndexedRows() const`

    已完成索引的行数。如果 Compaction 触发了重建索引，该数值可能会超过 `TotalRows()`。

- `int64_t TotalRows() const`

    Collection 中的总行数。

- `int64_t PendingRows() const`

    尚未建立索引的行数。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// Create an HNSW vector index and a scalar TRIE index together
IndexDesc index_vec("vec", "vec_idx", IndexType::HNSW, MetricType::COSINE);
index_vec.AddExtraParam("M", "16");
index_vec.AddExtraParam("efConstruction", "200");

IndexDesc index_name("name", "", IndexType::TRIE);

auto status = client->CreateIndex(
    CreateIndexRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .AddIndex(std::move(index_vec))
        .AddIndex(std::move(index_name)));

// Inspect build progress via DescribeIndex
DescribeIndexResponse resp;
client->DescribeIndex(
    DescribeIndexRequest()
        .WithCollectionName("my_collection")
        .WithIndexName("vec_idx"),
    resp);

for (const auto& desc : resp.Descs()) {
    std::cout << "IndexName:   " << desc.IndexName()   << "\n"
              << "IndexType:   " << std::to_string(desc.IndexType())  << "\n"
              << "State:       " << std::to_string(desc.StateCode())  << "\n"
              << "IndexedRows: " << desc.IndexedRows() << "\n"
              << "TotalRows:   " << desc.TotalRows()   << "\n";
}
```

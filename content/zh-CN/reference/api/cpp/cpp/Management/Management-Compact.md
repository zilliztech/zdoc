---
title: "Compact() | Cloud"
slug: /cpp/cpp/Management-Compact
sidebar_label: "Compact()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会手动触发 Compaction 操作。通常情况下，用户无需执行此操作，因为 Milvus 会在内部自动触发 Compaction。该操作主要用于维护或调试目的。 | Cloud"
type: docx
token: A1ePdfCEZo4ZX1xqZtVcKUcxnfE
sidebar_position: 2
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 的工作原理
  - 向量 Database 对比
  - Zilliz
  - Zilliz Cloud
  - 云
  - Compact()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Compact()

此操作会手动触发 Compaction 操作。通常情况下，用户无需执行此操作，因为 Milvus 会在内部自动触发 Compaction。该操作主要用于维护或调试目的。

```c++
Status Compact(const CompactRequest& request, CompactResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = CompactRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithClusteringCompaction(clustering_compaction)
    .WithTargetSize(target_size)
    .WithTargetSizeUnit(unit)
    .WithIsL0(is_l0);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果为空，则应用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithClusteringCompaction(bool clustering_compaction)`

    设置聚类 Compaction 标志。

    - **True**：执行聚类 Compaction，如果不存在聚类键，则报告错误。

    - **False**：执行常规 Compaction。

- `WithTargetSize(int64_t target_size)`

    设置用于 Compaction 规划的目标 Segment 大小（单位为字节）。请使用大于 0 的值来指导输出 Segment 的大小设置。

- `WithTargetSizeUnit(const std::string& unit)`

    设置目标 Segment 大小的单位。支持的值包括：`"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"` 和 `"pb"`。该值默认为 `"mb"`。

- `WithIsL0(bool is_l0)`

    设置 L0 Compaction 标志。当值为 `true` 时，仅对 L0 Segment 执行 Compaction；当值为 `false` 时，执行常规 Compaction。

**返回值：**

包含 *CompactResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CompactResponse response;
status = client->Compact(
    milvus::CompactRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Compaction ID: " << response.CompactionID() << std::endl;
```

---
title: "Compact() | Cloud"
slug: /cpp/cpp/Management-Compact
sidebar_label: "Compact()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于手动触发 Compaction。通常无需执行此操作，因为 Milvus 会在内部自动触发 Compaction。该操作主要用于维护或调试场景。 | Cloud"
type: docx
token: ZidndgXjGoLam3xqLOOcmFTYnBh
sidebar_position: 2
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - Compact()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Compact()

此操作用于手动触发 Compaction。通常无需执行此操作，因为 Milvus 会在内部自动触发 Compaction。该操作主要用于维护或调试场景。

```c++
Status Compact(const CompactRequest& request, CompactResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = CompactRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithClusteringCompaction(clustering_compaction)
    .WithTargetSize(target_size);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithClusteringCompaction(bool clustering_compaction)`

    设置聚类 Compaction 标志。

    - **True**：执行聚类 Compaction；若不存在聚类键，则报错。

    - **False**：执行常规 Compaction。

- `WithTargetSize(int64_t target_size)`

    设置 Compaction 规划的目标 Segment 大小（单位：字节）。请设置大于 0 的值以控制输出 Segment 的大小。

**返回值：**

包含 *CompactResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作是否成功。

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

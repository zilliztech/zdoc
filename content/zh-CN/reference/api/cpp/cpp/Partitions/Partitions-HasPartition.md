---
title: "HasPartition() | Cloud"
slug: /cpp/cpp/Partitions-HasPartition
sidebar_label: "HasPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查 Partition 是否存在。 | Cloud"
type: docx
token: M7O7df6KLoqRS2x6ls0cuSwlnNh
sidebar_position: 4
keywords: 
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - RAG 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - HasPartition()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# HasPartition()

此操作检查 Partition 是否存在。

```c++
Status HasPartition(const HasPartitionRequest& request, HasPartitionResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = HasPartitionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果该值为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithPartitionName(const std::string& partition_name)`

    设置 Partition 的名称。

**返回值：**

包含 *HasPartitionResponse* 的 *Status*。

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

milvus::HasPartitionResponse response;
status = client->HasPartition(
    milvus::HasPartitionRequest()
        .WithCollectionName("my_collection")
        .WithPartitionName("my_partition"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Partition exists: " << response.HasPartition() << std::endl;
```

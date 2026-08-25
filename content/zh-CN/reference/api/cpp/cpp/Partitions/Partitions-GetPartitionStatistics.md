---
title: "GetPartitionStatistics() | Cloud"
slug: /cpp/cpp/Partitions-GetPartitionStatistics
sidebar_label: "GetPartitionStatistics()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取 Partition 统计信息。 | Cloud"
type: docx
token: LaPcdArhDo6aGnxpX8Oc5azCnCe
sidebar_position: 3
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GetPartitionStatistics()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStatistics()

此操作用于获取 Partition 统计信息。

```c++
Status GetPartitionStatistics(const GetPartitionStatsRequest& request, GetPartitionStatsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetPartitionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionName(const std::string& partition_name)`

    设置 Partition 名称。

**返回值：**

包含 *GetPartitionStatsResponse* 的 *Status*

请检查 `status.IsOk()` 以确认操作是否成功。当前响应仅包含行数。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetPartitionStatsResponse response;
status = client->GetPartitionStatistics(
    milvus::GetPartitionStatsRequest()
        .WithCollectionName("my_collection")
        .WithPartitionName("my_partition"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Row count: " << response.RowCount() << std::endl;
```

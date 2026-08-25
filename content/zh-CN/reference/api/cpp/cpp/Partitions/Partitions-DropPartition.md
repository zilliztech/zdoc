---
title: "DropPartition() | Cloud"
slug: /cpp/cpp/Partitions-DropPartition
sidebar_label: "DropPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将删除 Partition 及其索引和 Segment。 | Cloud"
type: docx
token: SBLUdI6Wworo1oxrfAOcnH7jnFd
sidebar_position: 2
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - DropPartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropPartition()

此操作将删除 Partition 及其索引和 Segment。

```c++
Status DropPartition(const DropPartitionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropPartitionRequest()
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

*Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->DropPartition(
    milvus::DropPartitionRequest()
        .WithCollectionName(collection_name)
        .WithPartitionName(partition_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

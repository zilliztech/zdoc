---
title: "ReleasePartitions() | Cloud"
slug: /cpp/cpp/Partitions-ReleasePartitions
sidebar_label: "ReleasePartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将特定 Partition 的数据从查询节点中释放。 | Cloud"
type: docx
token: JJ28dtdEQo6J3Yx3HXkcnn7OnWh
sidebar_position: 7
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - LLM 幻觉
  - zilliz
  - zilliz cloud
  - cloud
  - ReleasePartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ReleasePartitions()

此操作将特定 Partition 的数据从查询节点中释放。

```c++
Status ReleasePartitions(const ReleasePartitionsRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = ReleasePartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(const std::set<std::string>& partition_names)`

    设置 Partition 名称。

- `AddPartitionName(const std::string& partition_name)`

    添加待加载的 Partition。

**返回值：**

*Status*

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

status = client->ReleasePartitions(
    milvus::ReleasePartitionsRequest()
        .WithCollectionName("my_collection")
        .AddPartitionName("partition_1")
        .AddPartitionName("partition_2"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

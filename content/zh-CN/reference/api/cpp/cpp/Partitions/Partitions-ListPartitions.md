---
title: "ListPartitions() | Cloud"
slug: /cpp/cpp/Partitions-ListPartitions
sidebar_label: "ListPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于列出 Collection 中的所有 Partition。 | Cloud"
type: docx
token: PwncdGtEvoxsajxmubhc5O6anqc
sidebar_position: 5
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - ListPartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPartitions()

此操作用于列出 Collection 中的所有 Partition。

```c++
Status ListPartitions(const ListPartitionsRequest& request, ListPartitionsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = ListPartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

**返回值：**

包含 *ListPartitionsResponse* 的 *Status*

请检查 `status.IsOk()` 以确认操作是否成功。

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

milvus::ListPartitionsResponse resp_list_part;
status = client->ListPartitions(
    milvus::ListPartitionsRequest().WithDatabaseName(db_name).WithCollectionName(collection_name), resp_list_part);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\nPartitions of " << collection_name << ":" << std::endl;
for (auto& info : resp_list_part.PartitionInfos()) {
    std::cout << "\t" << info.Name() << std::endl;
}
```

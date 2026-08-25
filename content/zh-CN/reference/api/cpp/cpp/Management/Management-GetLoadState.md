---
title: "GetLoadState() | Cloud"
slug: /cpp/cpp/Management-GetLoadState
sidebar_label: "GetLoadState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取 Collection 或 Partition 的加载状态。 | Cloud"
type: docx
token: Vs0rdbqzcoC2ODxjnR3cN1imnPd
sidebar_position: 10
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GetLoadState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetLoadState()

此操作用于获取 Collection 或 Partition 的加载状态。

```c++
Status GetLoadState(const GetLoadStateRequest& request, GetLoadStateResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetLoadStateRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称列表。该参数为可选项；若指定，则返回对应 Partition 的加载状态；若留空，则返回整个 Collection 的加载状态。

- `AddPartitionName(const std::string& partition_name)`

    添加一个 Partition 名称以查询其加载状态。

**返回值：**

包含 *GetLoadStateResponse* 的 *Status*

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

milvus::GetLoadStateResponse load_response;
status = client->GetLoadState(
    milvus::GetLoadStateRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name),
    load_response
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\tCollection load state: " << std::to_string(load_response.State()) << std::endl;
```

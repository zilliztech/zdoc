---
title: "GetLoadState() | Cloud"
slug: /cpp/cpp/Management-GetLoadState
sidebar_label: "GetLoadState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取 Collection 或 Partition 的加载状态。 | Cloud"
type: docx
token: Vs0rdbqzcoC2ODxjnR3cN1imnPd
sidebar_position: 12
keywords: 
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetLoadState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetLoadState()

此操作获取 Collection 或 Partition 的加载状态。

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

    设置目标 Database 名称。如果为空，则应用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    设置 Partition 名称。此参数为可选项；设置后，此操作将返回指定 Partition 的加载状态。如果为空，此操作将返回指定 Collection 的加载状态。

- `AddPartitionName(const std::string& partition_name)`

    添加一个 Partition 名称，以获取其加载状态。

**返回：**

*Status* 及 *GetLoadStateResponse*

检查 `status.IsOk()` 以确认成功。

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

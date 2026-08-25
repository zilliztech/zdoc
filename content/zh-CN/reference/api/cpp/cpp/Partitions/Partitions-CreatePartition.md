---
title: "CreatePartition() | Cloud"
slug: /cpp/cpp/Partitions-CreatePartition
sidebar_label: "CreatePartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于在 Collection 中创建 Partition。 | Cloud"
type: docx
token: W65adsrWqolU5Lx7C5Oc19b2ne6
sidebar_position: 1
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - CreatePartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreatePartition()

此操作用于在 Collection 中创建 Partition。

```c++
Status CreatePartition(const CreatePartitionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = CreatePartitionRequest()
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

检查 `status.IsOk()` 以确认操作是否成功。

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

status = client->CreatePartition(milvus::CreatePartitionRequest()
                                     .WithDatabaseName(db_name)
                                     .WithCollectionName(collection_name)
                                     .WithPartitionName(partition_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

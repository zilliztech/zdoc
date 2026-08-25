---
title: "ReleaseCollection() | Cloud"
slug: /cpp/cpp/Management-ReleaseCollection
sidebar_label: "ReleaseCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从查询节点释放 Collection 数据。 | Cloud"
type: docx
token: RzmYdsC1joL3LuxT765csIbwnCh
sidebar_position: 20
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - zilliz
  - zilliz cloud
  - cloud
  - ReleaseCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ReleaseCollection()

此操作从查询节点释放 Collection 数据。

```c++
Status ReleaseCollection(const ReleaseCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = ReleaseCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

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

status = client->ReleaseCollection(
    milvus::ReleaseCollectionRequest()
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

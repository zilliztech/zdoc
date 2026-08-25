---
title: "ListAliases() | Cloud"
slug: /cpp/cpp/Collections-ListAliases
sidebar_label: "ListAliases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回与指定 Collection 关联的所有别名列表。 | Cloud"
type: docx
token: YE0GdEE34oJXt3xyGLZc8H5Inkc
sidebar_position: 28
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - cloud
  - ListAliases()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases()

此操作返回与指定 Collection 关联的所有别名列表。

```c++
Status ListAliases(const ListAliasesRequest& request, ListAliasesResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = ListAliasesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

**返回值：**

包含 *ListAliasesResponse* 的 *Status*

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

milvus::ListAliasesResponse response;
status = client->ListAliases(
    milvus::ListAliasesRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& alias : response.Aliases()) {
    std::cout << "Alias: " << alias << std::endl;
}
```

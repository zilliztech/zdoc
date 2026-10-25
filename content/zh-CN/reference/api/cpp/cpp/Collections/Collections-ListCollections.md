---
title: "ListCollections() | Cloud"
slug: /cpp/cpp/Collections-ListCollections
sidebar_label: "ListCollections()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回所有 Collection 的列表，并包含每个 Collection 的简要信息。 | Cloud"
type: docx
token: A5FAdLCowoBG4sxh5vEcRH0Nnkb
sidebar_position: 29
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListCollections()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# ListCollections()

此操作返回所有 Collection 的列表，并包含每个 Collection 的简要信息。

```c++
Status ListCollections(const ListCollectionsRequest& request, ListCollectionsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = ListCollectionsRequest()
    .WithDatabaseName(db_name)
    .WithOnlyShowLoaded(only_show_loaded);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果该名称为空，则使用默认 Database。

- `WithOnlyShowLoaded(bool only_show_loaded)`

    设置该标志是仅显示已加载的 Collection，还是显示所有 Collection。默认值：`false`。

**返回值：**

包含 *ListCollectionsResponse* 的 *Status*

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

milvus::ListCollectionsResponse resp_list_coll;
status = client->ListCollections(
    milvus::ListCollectionsRequest()
        .WithDatabaseName(db_name), 
    resp_list_coll
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\nCollections:" << std::endl;
for (auto& name : resp_list_coll.CollectionNames()) {
    std::cout << "\t" << name << std::endl;
}
```

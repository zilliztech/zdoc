---
title: "RenameCollection() | Cloud"
slug: /cpp/cpp/Collections-RenameCollection
sidebar_label: "RenameCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可重命名 Collection。 | Cloud"
type: docx
token: EyHadkgMtohFXxxEEcucWAC5nje
sidebar_position: 31
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - RenameCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RenameCollection()

此操作可重命名 Collection。

```c++
Status RenameCollection(const RenameCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = RenameCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name1)
    .WithNewCollectionName(collection_name2);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithNewCollectionName(const std::string& collection_name)`

    设置 Collection 的新名称。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作是否成功。

**异常：**

- **StatusCode**

    查看 `status.Code()` 和 `status.Message()` 获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RenameCollection(
    milvus::RenameCollectionRequest()
        .WithCollectionName("old_collection")
        .WithNewCollectionName("new_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

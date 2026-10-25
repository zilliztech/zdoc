---
title: "RenameCollection() | Cloud"
slug: /cpp/cpp/Collections-RenameCollection
sidebar_label: "RenameCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会重命名 Collection。 | Cloud"
type: docx
token: WaD1dzpIzohLMKx39p7cGgEEnDh
sidebar_position: 31
keywords: 
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - 开源向量 db
  - zilliz
  - zilliz cloud
  - 云
  - RenameCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# RenameCollection()

此操作会重命名 Collection。

```c++
Status RenameCollection(const RenameCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = RenameCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name1)
    .WithNewCollectionName(collection_name2)
    .WithTargetDatabaseName(db_name2);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。如果该值为空，则应用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithNewCollectionName(const std::string& collection_name)`

    设置 Collection 的新名称。

- `WithTargetDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。重命名后的 Collection 将移动到该 Database。如果该值为空，则应用默认 Database。

**返回类型：**

*Status*

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

status = client->RenameCollection(
    milvus::RenameCollectionRequest()
        .WithCollectionName("old_collection")
        .WithNewCollectionName("new_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

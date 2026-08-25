---
title: "DropDatabaseProperties() | Cloud"
slug: /cpp/cpp/Database-DropDatabaseProperties
sidebar_label: "DropDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除 Database 的属性。 | Cloud"
type: docx
token: LBSwdc3WTo0vbQxTO4uca77EnWd
sidebar_position: 5
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabaseProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabaseProperties()

此操作用于删除 Database 的属性。

```c++
Status DropDatabaseProperties(const DropDatabasePropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropDatabasePropertiesRequest()
    .WithDatabaseName(db_name)
    .WithPropertyKeys(keys);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。若未指定，则使用默认 Database。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    设置待删除的 Database 属性键。

- `AddPropertyKey(const std::string& key)`

    添加待删除的键。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作是否成功。

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

status = client->DropDatabaseProperties(
    milvus::DropDatabasePropertiesRequest()
        .WithDatabaseName("my_database")
        .AddPropertyKey("key"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

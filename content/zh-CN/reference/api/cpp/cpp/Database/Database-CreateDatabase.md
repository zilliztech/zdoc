---
title: "CreateDatabase() | Cloud"
slug: /cpp/cpp/Database-CreateDatabase
sidebar_label: "CreateDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建新的 Database。 | Cloud"
type: docx
token: J7vTderKqoQFotxp1RUcLVzenBv
sidebar_position: 2
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - CreateDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateDatabase()

此操作用于创建新的 Database。

```c++
Status CreateDatabase(const CreateDatabaseRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = CreateDatabaseRequest()
    .WithDatabaseName(db_name)
    .WithProperties(properties);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。若未指定，则使用默认 Database。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置该 Database 的属性。

- `AddProperty(const std::string& key, const std::string& property)`

    为该 Database 添加属性。

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

std::unordered_map<std::string, std::string> props;
props.emplace("database.replica.number", "2");
status = client->CreateDatabase(
    milvus::CreateDatabaseRequest()
        .WithDatabaseName(my_db_name)
        .WithProperties(std::move(props))
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

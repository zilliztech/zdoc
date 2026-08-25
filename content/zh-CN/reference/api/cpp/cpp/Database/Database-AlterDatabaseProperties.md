---
title: "AlterDatabaseProperties() | Cloud"
slug: /cpp/cpp/Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于修改 Database 属性。 | Cloud"
type: docx
token: XPsfdhNDhopm2Ux7HKncEtZonjh
sidebar_position: 1
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - AlterDatabaseProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties()

此操作用于修改 Database 属性。

```c++
Status AlterDatabaseProperties(const AlterDatabasePropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterDatabasePropertiesRequest()
    .WithDatabaseName(db_name)
    .WithProperties(properties);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置该 Database 需要修改的属性。可用的 Database 属性请参见[此页面](https://milvus.io/docs/manage_databases.md#Manage-database-properties)。

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

status = client->AlterDatabaseProperties(
    milvus::AlterDatabasePropertiesRequest()
        .WithDatabaseName("my_database")
        .AddProperty("key", "value"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

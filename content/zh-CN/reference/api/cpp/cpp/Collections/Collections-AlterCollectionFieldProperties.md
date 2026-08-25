---
title: "AlterCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFieldProperties
sidebar_label: "AlterCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于修改字段属性。 | Cloud"
type: docx
token: A3gld3Xjco1VxSxi6Ndc3Bq4nuh
sidebar_position: 5
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - LLM 幻觉
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperties()

此操作用于修改字段属性。

```c++
Status AlterCollectionFieldProperties(const AlterCollectionFieldPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithProperties(properties);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithFieldName(const std::string& field_name)`

    设置目标字段名称。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置要修改的字段属性。详情请参阅[此页面](https://milvus.io/docs/alter-collection-field.md)。

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

status = client->AlterCollectionFieldProperties(
    milvus::AlterCollectionFieldPropertiesRequest()
        .WithCollectionName("my_collection")
        .WithFieldName("my_field")
        .AddProperty("max_length", "512"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

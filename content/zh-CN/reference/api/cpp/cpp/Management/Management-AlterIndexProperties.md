---
title: "AlterIndexProperties() | Cloud"
slug: /cpp/cpp/Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于修改索引属性。 | Cloud"
type: docx
token: TKJ0dmfeiojGU8xOyixcO4M5ncb
sidebar_position: 1
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - AlterIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

此操作用于修改索引的属性。

```c++
Status AlterIndexProperties(const AlterIndexPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = AlterIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithProperties(value);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithIndexName(const std::string& index_name)`

    设置索引名称。请注意，此操作需传入索引名称而非字段名称。

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    设置指定索引待修改的属性。可用的索引属性请参见[此页面](https://milvus.io/docs/mmap.md#Index-specific-mmap-settings)。

- `AddProperty(const std::string& key, const std::string& property)`

    为该索引添加属性。

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

status = client->AlterIndexProperties(milvus::AlterIndexPropertiesRequest()
                                          .WithCollectionName(collection_name)
                                          .WithIndexName("vector_index_name")
                                          .AddProperty(milvus::MMAP_ENABLED, "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

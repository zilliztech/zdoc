---
title: "DropCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFieldProperties
sidebar_label: "DropCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "移除字段的属性。| Cloud"
type: docx
token: VWOqdczvioTtxqxThEKcJzI3n2g
sidebar_position: 21
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionFieldProperties()

移除字段的属性。

```c++
Status DropCollectionFieldProperties(const DropCollectionFieldPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithPropertyKeys(keys);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithFieldName(const std::string& field_name)`

    设置字段名称。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    设置要从该字段移除的属性集合。

- `AddPropertyKey(const std::string& key)`

    设置要从该字段移除的单个属性。

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

status = client->DropCollectionFieldProperties(
    milvus::DropCollectionFieldPropertiesRequest()
        .WithCollectionName("my_collection")
        .WithFieldName("my_field")
        .AddPropertyKey("max_length"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

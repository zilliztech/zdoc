---
title: "DropIndexProperties() | Cloud"
slug: /cpp/cpp/Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从指定索引中移除属性。 | Cloud"
type: docx
token: SbJbdoDksoWVlxxvXQDcKYKsn4q
sidebar_position: 6
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties()

此操作从指定索引中移除属性。

```c++
Status DropIndexProperties(const DropIndexPropertiesRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithPropertyKeys(keys);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithIndexName(const std::string& index_name)`

    设置索引名称。请注意，此操作需使用索引名称而非字段名称。

- `WithPropertyKeys(std::set<std::string>&& keys)`

    设置要从该索引中移除的属性名称。

- `AddPropertyKey(const std::string& key)`

    设置要移除的属性名称。

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

status = client->DropIndexProperties(milvus::DropIndexPropertiesRequest()
                                         .WithCollectionName(collection_name)
                                         .WithIndexName("vector_index_name")
                                         .AddPropertyKey(milvus::MMAP_ENABLED));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

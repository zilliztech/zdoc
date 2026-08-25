---
title: "HasCollection() | Cloud"
slug: /cpp/cpp/Collections-HasCollection
sidebar_label: "HasCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于检查指定的 Collection 是否存在。 | Cloud"
type: docx
token: ZLfgdRLpXolwPYx2ZOrcDmxGnnw
sidebar_position: 27
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - HasCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# HasCollection()

此操作用于检查指定的 Collection 是否存在。

```c++
Status HasCollection(const HasCollectionRequest& request, HasCollectionResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = HasCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置目标 Collection 的名称。

**返回值：**

包含 *HasCollectionResponse* 的 *Status*

请检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    请检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::HasCollectionResponse response;
status = client->HasCollection(
    milvus::HasCollectionRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Collection exists: " << response.HasCollection() << std::endl;
```

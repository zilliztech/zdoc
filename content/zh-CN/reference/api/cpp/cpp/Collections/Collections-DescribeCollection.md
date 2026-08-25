---
title: "DescribeCollection() | Cloud"
slug: /cpp/cpp/Collections-DescribeCollection
sidebar_label: "DescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Collection 的描述信息，包括其 Schema 和属性。 | Cloud"
type: docx
token: XQLWd904koQK58x9tkHcqqbZnVb
sidebar_position: 18
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeCollection()

此操作返回 Collection 的描述信息，包括其 Schema 和属性。

```c++
Status DescribeCollection(const DescribeCollectionRequest& request, DescribeCollectionResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DescribeCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

**返回值：**

包含 *DescribeCollectionResponse* 的 *Status*

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

milvus::DescribeCollectionResponse desc_response;
status = client->DescribeCollection(
    milvus::DescribeCollectionRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name),
    desc_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "Collection ID: " << desc_response.Desc().ID() << std::endl;
```

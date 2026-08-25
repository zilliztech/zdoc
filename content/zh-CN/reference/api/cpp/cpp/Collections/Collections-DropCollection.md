---
title: "DropCollection() | Cloud"
slug: /cpp/cpp/Collections-DropCollection
sidebar_label: "DropCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将删除一个 Collection，包括其所有 Partition、索引和 Segment。 | Cloud"
type: docx
token: QGzdd5UMMo3gKpx0hNgcvA9jnOb
sidebar_position: 20
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection()

此操作将删除一个 Collection，包括其所有 Partition、索引和 Segment。

```c++
Status DropCollection(const DropCollectionRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

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

status = client->DropCollection(
    milvus::DropCollectionRequest()
        .WithCollectionName(collection_name)
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "ListIndexes() | Cloud"
slug: /cpp/cpp/Management-ListIndexes
sidebar_label: "ListIndexes()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会获取 Collection 的索引名称。 | Cloud"
type: docx
token: QO98dfF7qoLAWYxwsy2cfalvntc
sidebar_position: 15
keywords: 
  - Faiss 向量 Database
  - Chroma 向量 Database
  - NLP 搜索
  - LLM 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - ListIndexes()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# ListIndexes()

此操作会获取 Collection 的索引名称。

```c++
Status ListIndexes(const ListIndexesRequest& request, ListIndexesResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = ListIndexesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。如果该值为空，则应用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithFieldName(const std::string& field_name)`

    设置字段名称。如果该值为空，则返回所有字段的索引。

**返回：**

带 *ListIndexesResponse* 的 *Status*

检查 `status.IsOk()` 以确认是否成功。

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

milvus::ListIndexesResponse response;
status = client->ListIndexes(
    milvus::ListIndexesRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& index_name : response.IndexNames()) {
    std::cout << "Index: " << index_name << std::endl;
}
```

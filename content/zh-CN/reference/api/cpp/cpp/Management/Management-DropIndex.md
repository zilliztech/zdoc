---
title: "DropIndex() | Cloud"
slug: /cpp/cpp/Management-DropIndex
sidebar_label: "DropIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除字段上的索引。 | Cloud"
type: docx
token: JstbdGVJwocHJ0xQ8M8cagZHn2a
sidebar_position: 5
keywords: 
  - 自然语言搜索
  - 相似度搜索
  - 多模态 RAG
  - 大语言模型幻觉
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndex()

此操作会删除字段上的索引。

```c++
Status DropIndex(const DropIndexRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithIndexName(index_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 的名称。如果为空，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

- `WithFieldName(const std::string& field_name)`

    设置字段的名称。

- `WithIndexName(const std::string& index_name)`

    设置索引的名称。

    <Admonition type="info" title="Notes">

    如果同时指定了字段名称和索引名称，将使用索引名称；否则回退到字段名称。

    </Admonition>

**返回值：**

*Status*

检查 `status.IsOk()` 以确认成功。

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

status = client->DropIndex(
    milvus::DropIndexRequest()
        .WithCollectionName(collection_name)
        .WithFieldName(field_face)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "DropIndex() | Cloud"
slug: /cpp/cpp/Management-DropIndex
sidebar_label: "DropIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除字段上的索引。 | Cloud"
type: docx
token: JstbdGVJwocHJ0xQ8M8cagZHn2a
sidebar_position: 5
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndex()

此操作用于删除字段上的索引。

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

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

- `WithFieldName(const std::string& field_name)`

    设置字段名称。

- `WithIndexName(const std::string& index_name)`

    设置索引名称。

    <Admonition type="info" icon="📘" title="Notes">

    若同时指定了字段名称和索引名称，则以索引名称为准；否则回退至字段名称。

    </Admonition>

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

status = client->DropIndex(
    milvus::DropIndexRequest()
        .WithCollectionName(collection_name)
        .WithFieldName(field_face)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

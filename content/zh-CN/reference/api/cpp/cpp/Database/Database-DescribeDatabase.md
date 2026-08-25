---
title: "DescribeDatabase() | Cloud"
slug: /cpp/cpp/Database-DescribeDatabase
sidebar_label: "DescribeDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Database 的描述信息，包括其属性。 | Cloud"
type: docx
token: ZNfkd4vqOoG9RexySyicxncBnzf
sidebar_position: 3
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeDatabase()

此操作返回 Database 的描述信息，包括其属性。

```c++
Status DescribeDatabase(const DescribeDatabaseRequest& request, DescribeDatabaseResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DescribeDatabaseRequest()
    .WithDatabaseName(db_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

**返回值：**

包含 *DescribeDatabaseResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作是否成功。

### DatabaseDesc\{#databasedesc}

此类表示 Milvus Database 的元数据，通过调用 `DescribeDatabaseResponse` 对象的 `Desc()` 方法返回。

```c++
const DatabaseDesc& desc = response.Desc();
```

**方法：**

- `const std::string& Name() const`

    Database 名称。

- `int64_t ID() const`

    服务端分配的 Database ID。

- `const std::unordered_map<std::string, std::string>& Properties() const`

    Database 级别的属性，以键值对形式存储。

- `uint64_t CreatedTime() const`

    Database 创建时的 UTC 时间戳（微秒）。

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

milvus::DescribeDatabaseResponse resp_desc_db;
status = client->DescribeDatabase(
    milvus::DescribeDatabaseRequest()
        .WithDatabaseName(my_db_name), 
    resp_desc_db
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "database.replica.number = " << resp_desc_db.Desc().Properties().at("database.replica.number")
          << std::endl;
```

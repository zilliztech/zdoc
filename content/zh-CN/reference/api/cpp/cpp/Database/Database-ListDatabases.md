---
title: "ListDatabases() | Cloud"
slug: /cpp/cpp/Database-ListDatabases
sidebar_label: "ListDatabases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可列出所有 Database。 | Cloud"
type: docx
token: Tjohd3KEjoTXkuxX2Kqcs13wnEh
sidebar_position: 6
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量 Embedding
  - 向量存储
  - zilliz
  - zilliz cloud
  - cloud
  - ListDatabases()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListDatabases()

此操作可列出所有 Database。

```c++
Status ListDatabases(const ListDatabasesRequest& request, ListDatabasesResponse& response)
```

**返回值：**

包含 *ListDatabasesResponse* 的 *Status*

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

milvus::ListDatabasesResponse resp_list_dbs;
status = client->ListDatabases(milvus::ListDatabasesRequest(), resp_list_dbs);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const std::string my_db_name = "my_temp_db_for_cpp_test";
std::cout << "Databases: ";
for (const auto& name : resp_list_dbs.DatabaseNames()) {
    std::cout << name << ",";
}
std::cout << std::endl;
```

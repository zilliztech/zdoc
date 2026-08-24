---
title: "ListDatabases() | Cloud"
slug: /cpp/cpp/Database-ListDatabases
sidebar_label: "ListDatabases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべてのデータベースを一覧表示します。 | Cloud"
type: docx
token: Tjohd3KEjoTXkuxX2Kqcs13wnEh
sidebar_position: 6
keywords: 
  - HNSW
  - What is unstructured data
  - ベクトル embeddings
  - ベクトル store
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

この操作は、すべてのデータベースの一覧を取得します。

```c++
Status ListDatabases(const ListDatabasesRequest& request, ListDatabasesResponse& response)
```

**戻り値:**

*ListDatabasesResponse* を含む *Status*

成功したかどうかを確認するには、`status.IsOk()` を参照してください。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

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

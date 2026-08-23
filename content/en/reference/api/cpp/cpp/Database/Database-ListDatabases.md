---
title: "ListDatabases() | Cloud"
slug: /cpp/cpp/Database-ListDatabases
sidebar_label: "ListDatabases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all databases. | Cloud"
type: docx
token: Tjohd3KEjoTXkuxX2Kqcs13wnEh
sidebar_position: 6
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
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

This operation lists all databases.

```c++
Status ListDatabases(const ListDatabasesRequest& request, ListDatabasesResponse& response)
```

**RETURNS:**

*Status* with *ListDatabasesResponse*

Check `status.IsOk()` to confirm success.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## Example\{#example}

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

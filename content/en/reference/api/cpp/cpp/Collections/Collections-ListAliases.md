---
title: "ListAliases() | Cloud"
slug: /cpp/cpp/Collections-ListAliases
sidebar_label: "ListAliases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a list of all aliases associated with a collection. | Cloud"
type: docx
token: YE0GdEE34oJXt3xyGLZc8H5Inkc
sidebar_position: 28
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - ListAliases()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases()

This operation returns a list of all aliases associated with a collection.

```c++
Status ListAliases(const ListAliasesRequest& request, ListAliasesResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ListAliasesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

**RETURNS:**

*Status* with *ListAliasesResponse*

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

milvus::ListAliasesResponse response;
status = client->ListAliases(
    milvus::ListAliasesRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& alias : response.Aliases()) {
    std::cout << "Alias: " << alias << std::endl;
}
```

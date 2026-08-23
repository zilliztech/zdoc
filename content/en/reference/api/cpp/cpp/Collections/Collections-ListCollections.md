---
title: "ListCollections() | Cloud"
slug: /cpp/cpp/Collections-ListCollections
sidebar_label: "ListCollections()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns a list of all collections, including brief information for each. | Cloud"
type: docx
token: A5FAdLCowoBG4sxh5vEcRH0Nnkb
sidebar_position: 29
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollections()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListCollections()

This operation returns a list of all collections, including brief information for each.

```c++
Status ListCollections(const ListCollectionsRequest& request, ListCollectionsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ListCollectionsRequest()
    .WithDatabaseName(db_name)
    .WithOnlyShowLoaded(only_show_loaded);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithOnlyShowLoaded(bool only_show_loaded)`

    Sets the flag only show loaded collections or show all collections. Default: `false`.

**RETURNS:**

*Status* with *ListCollectionsResponse*

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

milvus::ListCollectionsResponse resp_list_coll;
status = client->ListCollections(
    milvus::ListCollectionsRequest()
        .WithDatabaseName(db_name), 
    resp_list_coll
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\nCollections:" << std::endl;
for (auto& name : resp_list_coll.CollectionNames()) {
    std::cout << "\t" << name << std::endl;
}
```

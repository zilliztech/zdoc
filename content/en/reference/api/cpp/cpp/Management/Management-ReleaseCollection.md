---
title: "ReleaseCollection() | Cloud"
slug: /cpp/cpp/Management-ReleaseCollection
sidebar_label: "ReleaseCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases collection data from the query node. | Cloud"
type: docx
token: RzmYdsC1joL3LuxT765csIbwnCh
sidebar_position: 20
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - ReleaseCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ReleaseCollection()

This operation releases collection data from the query node.

```c++
Status ReleaseCollection(const ReleaseCollectionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ReleaseCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

**RETURNS:**

*Status*

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

status = client->ReleaseCollection(
    milvus::ReleaseCollectionRequest()
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

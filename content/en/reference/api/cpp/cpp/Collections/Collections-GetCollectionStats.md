---
title: "GetCollectionStats() | Cloud"
slug: /cpp/cpp/Collections-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns collection statistics; it currently only returns row count. | Cloud"
type: docx
token: Lh65dZfnWoZKFMxsJhdcieUJnEb
sidebar_position: 26
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GetCollectionStats()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

This operation returns collection statistics; it currently only returns row count.

```c++
Status GetCollectionStats(const GetCollectionStatsRequest& request, GetCollectionStatsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GetCollectionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

**RETURNS:**

*Status* with *GetCollectionStatsResponse*

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

milvus::GetCollectionStatsResponse response;
status = client->GetCollectionStats(
    milvus::GetCollectionStatsRequest()
        .WithCollectionName(collection_name),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Collection " << collection_name << " row count: " << response.Stats().RowCount() << std::endl;
```

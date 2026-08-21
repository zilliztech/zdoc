---
title: "GetPartitionStatistics() | Cloud"
slug: /cpp/cpp/Partitions-GetPartitionStatistics
sidebar_label: "GetPartitionStatistics()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the partition statistics. | Cloud"
type: docx
token: LaPcdArhDo6aGnxpX8Oc5azCnCe
sidebar_position: 3
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GetPartitionStatistics()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStatistics()

This operation gets the partition statistics.

```c++
Status GetPartitionStatistics(const GetPartitionStatsRequest& request, GetPartitionStatsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GetPartitionStatsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithPartitionName(const std::string& partition_name)`

    Sets the name of a partition.

**RETURNS:**

*Status* with *GetPartitionStatsResponse*

Check `status.IsOk()` to confirm success. Currently, the response contains only the row count.

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

milvus::GetPartitionStatsResponse response;
status = client->GetPartitionStatistics(
    milvus::GetPartitionStatsRequest()
        .WithCollectionName("my_collection")
        .WithPartitionName("my_partition"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Row count: " << response.RowCount() << std::endl;
```

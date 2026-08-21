---
title: "ReleasePartitions() | Cloud"
slug: /cpp/cpp/Partitions-ReleasePartitions
sidebar_label: "ReleasePartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases the data of specific partitions from the query nodes. | Cloud"
type: docx
token: JJ28dtdEQo6J3Yx3HXkcnn7OnWh
sidebar_position: 7
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - ReleasePartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ReleasePartitions()

This operation releases the data of specific partitions from the query nodes.

```c++
Status ReleasePartitions(const ReleasePartitionsRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ReleasePartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithPartitionNames(const std::set<std::string>& partition_names)`

    Sets the names of the partitions.

- `AddPartitionName(const std::string& partition_name)`

    Adds a partition to be loaded.

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

status = client->ReleasePartitions(
    milvus::ReleasePartitionsRequest()
        .WithCollectionName("my_collection")
        .AddPartitionName("partition_1")
        .AddPartitionName("partition_2"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

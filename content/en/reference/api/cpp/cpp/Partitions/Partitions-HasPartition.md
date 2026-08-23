---
title: "HasPartition() | Cloud"
slug: /cpp/cpp/Partitions-HasPartition
sidebar_label: "HasPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether a partition exists. | Cloud"
type: docx
token: M7O7df6KLoqRS2x6ls0cuSwlnNh
sidebar_position: 4
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - HasPartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# HasPartition()

This operation checks whether a partition exists.

```c++
Status HasPartition(const HasPartitionRequest& request, HasPartitionResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = HasPartitionRequest()
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

    Sets the name of the partition.

**RETURNS:**

*Status* with *HasPartitionResponse*

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

milvus::HasPartitionResponse response;
status = client->HasPartition(
    milvus::HasPartitionRequest()
        .WithCollectionName("my_collection")
        .WithPartitionName("my_partition"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Partition exists: " << response.HasPartition() << std::endl;
```

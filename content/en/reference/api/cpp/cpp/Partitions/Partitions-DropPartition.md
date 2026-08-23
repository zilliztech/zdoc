---
title: "DropPartition() | Cloud"
slug: /cpp/cpp/Partitions-DropPartition
sidebar_label: "DropPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a partition, with its index and segments. | Cloud"
type: docx
token: SBLUdI6Wworo1oxrfAOcnH7jnFd
sidebar_position: 2
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - DropPartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropPartition()

This operation drops a partition, with its index and segments.

```c++
Status DropPartition(const DropPartitionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropPartitionRequest()
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

status = client->DropPartition(
    milvus::DropPartitionRequest()
        .WithCollectionName(collection_name)
        .WithPartitionName(partition_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

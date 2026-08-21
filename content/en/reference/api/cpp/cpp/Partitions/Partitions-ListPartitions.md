---
title: "ListPartitions() | Cloud"
slug: /cpp/cpp/Partitions-ListPartitions
sidebar_label: "ListPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the partitions in a collection. | Cloud"
type: docx
token: PwncdGtEvoxsajxmubhc5O6anqc
sidebar_position: 5
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - ListPartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPartitions()

This operation lists the partitions in a collection.

```c++
Status ListPartitions(const ListPartitionsRequest& request, ListPartitionsResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ListPartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

**RETURNS:**

*Status* with *ListPartitionsResponse*

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

milvus::ListPartitionsResponse resp_list_part;
status = client->ListPartitions(
    milvus::ListPartitionsRequest().WithDatabaseName(db_name).WithCollectionName(collection_name), resp_list_part);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\nPartitions of " << collection_name << ":" << std::endl;
for (auto& info : resp_list_part.PartitionInfos()) {
    std::cout << "\t" << info.Name() << std::endl;
}
```

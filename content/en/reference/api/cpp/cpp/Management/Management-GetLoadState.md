---
title: "GetLoadState() | Cloud"
slug: /cpp/cpp/Management-GetLoadState
sidebar_label: "GetLoadState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the load state of the collection or partitions. | Cloud"
type: docx
token: Vs0rdbqzcoC2ODxjnR3cN1imnPd
sidebar_position: 10
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GetLoadState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetLoadState()

This operation gets the load state of the collection or partitions.

```c++
Status GetLoadState(const GetLoadStateRequest& request, GetLoadStateResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GetLoadStateRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    Sets the partition names. This is optional, and when set, this operation returns the load state of the specified partitions. If this is empty, this operation returns the load state of the specified collection.

- `AddPartitionName(const std::string& partition_name)`

    Adds a partition name to get its load state.

**RETURNS:**

*Status* with *GetLoadStateResponse*

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

milvus::GetLoadStateResponse load_response;
status = client->GetLoadState(
    milvus::GetLoadStateRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name),
    load_response
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "\tCollection load state: " << std::to_string(load_response.State()) << std::endl;
```

---
title: "CreatePartition() | Cloud"
slug: /cpp/cpp/Partitions-CreatePartition
sidebar_label: "CreatePartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a partition in a collection. | Cloud"
type: docx
token: W65adsrWqolU5Lx7C5Oc19b2ne6
sidebar_position: 1
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - CreatePartition()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreatePartition()

This operation creates a partition in a collection.

```c++
Status CreatePartition(const CreatePartitionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = CreatePartitionRequest()
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

status = client->CreatePartition(milvus::CreatePartitionRequest()
                                     .WithDatabaseName(db_name)
                                     .WithCollectionName(collection_name)
                                     .WithPartitionName(partition_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "DescribeCollection() | Cloud"
slug: /cpp/cpp/Collections-DescribeCollection
sidebar_label: "DescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the collection description, including its schema and properties. | Cloud"
type: docx
token: XQLWd904koQK58x9tkHcqqbZnVb
sidebar_position: 18
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeCollection()

This operation returns the collection description, including its schema and properties.

```c++
Status DescribeCollection(const DescribeCollectionRequest& request, DescribeCollectionResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DescribeCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

**RETURNS:**

*Status* with *DescribeCollectionResponse*

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

milvus::DescribeCollectionResponse desc_response;
status = client->DescribeCollection(
    milvus::DescribeCollectionRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name),
    desc_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "Collection ID: " << desc_response.Desc().ID() << std::endl;
```

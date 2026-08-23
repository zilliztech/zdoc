---
title: "HasCollection() | Cloud"
slug: /cpp/cpp/Collections-HasCollection
sidebar_label: "HasCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether the specified collection exists. | Cloud"
type: docx
token: ZLfgdRLpXolwPYx2ZOrcDmxGnnw
sidebar_position: 27
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - HasCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# HasCollection()

This operation checks whether the specified collection exists.

```c++
Status HasCollection(const HasCollectionRequest& request, HasCollectionResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = HasCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the target collection.

**RETURNS:**

*Status* with *HasCollectionResponse*

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

milvus::HasCollectionResponse response;
status = client->HasCollection(
    milvus::HasCollectionRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Collection exists: " << response.HasCollection() << std::endl;
```

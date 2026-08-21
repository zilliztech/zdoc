---
title: "ListIndexes() | Cloud"
slug: /cpp/cpp/Management-ListIndexes
sidebar_label: "ListIndexes()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the index names of a collection. | Cloud"
type: docx
token: U7Y9dr70qoyDGYxlgBTcOGTgnbd
sidebar_position: 13
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - ListIndexes()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListIndexes()

This operation gets the index names of a collection.

```c++
Status ListIndexes(const ListIndexesRequest& request, ListIndexesResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = ListIndexesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

**RETURNS:**

*Status* with *ListIndexesResponse*

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

milvus::ListIndexesResponse response;
status = client->ListIndexes(
    milvus::ListIndexesRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& index_name : response.IndexNames()) {
    std::cout << "Index: " << index_name << std::endl;
}
```

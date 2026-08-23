---
title: "DropCollection() | Cloud"
slug: /cpp/cpp/Collections-DropCollection
sidebar_label: "DropCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a collection, with all its partitions, index, and segments. | Cloud"
type: docx
token: QGzdd5UMMo3gKpx0hNgcvA9jnOb
sidebar_position: 20
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection()

This operation drops a collection, with all its partitions, index, and segments.

```c++
Status DropCollection(const DropCollectionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

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

status = client->DropCollection(
    milvus::DropCollectionRequest()
        .WithCollectionName(collection_name)
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

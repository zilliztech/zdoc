---
title: "DropCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionProperties
sidebar_label: "DropCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a collection's properties. | Cloud"
type: docx
token: Sljyd2yrWoidNAxyCgRc255Mnhg
sidebar_position: 23
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionProperties()

This operation drops a collection's properties.

```c++
Status DropCollectionProperties(const DropCollectionPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPropertyKeys(keys);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithPropertyKeys(std::set<std::string>&& keys)`

    Sets the properties to drop from this collection.

- `AddPropertyKey(const std::string& key)`

    Sets a property to drop from this collection.

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

status = client->DropCollectionProperties(
    milvus::DropCollectionPropertiesRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name)
        .AddPropertyKey(milvus::COLLECTION_TTL_SECONDS)
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

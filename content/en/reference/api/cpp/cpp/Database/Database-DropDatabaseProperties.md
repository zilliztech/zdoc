---
title: "DropDatabaseProperties() | Cloud"
slug: /cpp/cpp/Database-DropDatabaseProperties
sidebar_label: "DropDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a database's properties. | Cloud"
type: docx
token: LBSwdc3WTo0vbQxTO4uca77EnWd
sidebar_position: 5
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabaseProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabaseProperties()

This operation drops a database's properties.

```c++
Status DropDatabaseProperties(const DropDatabasePropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropDatabasePropertiesRequest()
    .WithDatabaseName(db_name)
    .WithPropertyKeys(keys);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithPropertyKeys(std::set<std::string>&& keys)`

    Sets the key of the database property to delete.

- `AddPropertyKey(const std::string& key)`

    Adds a key to be deleted.

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

status = client->DropDatabaseProperties(
    milvus::DropDatabasePropertiesRequest()
        .WithDatabaseName("my_database")
        .AddPropertyKey("key"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

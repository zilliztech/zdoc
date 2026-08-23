---
title: "AlterIndexProperties() | Cloud"
slug: /cpp/cpp/Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation alters the properties of an index. | Cloud"
type: docx
token: TKJ0dmfeiojGU8xOyixcO4M5ncb
sidebar_position: 1
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - AlterIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

This operation alters the properties of an index.

```c++
Status AlterIndexProperties(const AlterIndexPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithProperties(value);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithIndexName(const std::string& index_name)`

    Sets the name of the index. Use the index name in this operation, but not the field name.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets the properties to alter of the specified index. You can find available index properties on [this page](https://milvus.io/docs/mmap.md#Index-specific-mmap-settings).

- `AddProperty(const std::string& key, const std::string& property)`

    Adds a property to this index.

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

status = client->AlterIndexProperties(milvus::AlterIndexPropertiesRequest()
                                          .WithCollectionName(collection_name)
                                          .WithIndexName("vector_index_name")
                                          .AddProperty(milvus::MMAP_ENABLED, "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

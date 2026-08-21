---
title: "DropIndexProperties() | Cloud"
slug: /cpp/cpp/Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops the property from the specified index. | Cloud"
type: docx
token: SbJbdoDksoWVlxxvXQDcKYKsn4q
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndexProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties()

This operation drops the property from the specified index.

```c++
Status DropIndexProperties(const DropIndexPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithPropertyKeys(keys);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithIndexName(const std::string& index_name)`

    Sets the name of the index. Use the index name in this operation, but not the field name.

- `WithPropertyKeys(std::set<std::string>&& keys)`

    Sets the name of the properties to drop from this index.

- `AddPropertyKey(const std::string& key)`

    Sets the name of a property to delete.

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

status = client->DropIndexProperties(milvus::DropIndexPropertiesRequest()
                                         .WithCollectionName(collection_name)
                                         .WithIndexName("vector_index_name")
                                         .AddPropertyKey(milvus::MMAP_ENABLED));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

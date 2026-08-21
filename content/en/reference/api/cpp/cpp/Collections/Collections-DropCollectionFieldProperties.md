---
title: "DropCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFieldProperties
sidebar_label: "DropCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Drop a field's properties. | Cloud"
type: docx
token: VWOqdczvioTtxqxThEKcJzI3n2g
sidebar_position: 21
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionFieldProperties()

Drop a field's properties.

```c++
Status DropCollectionFieldProperties(const DropCollectionFieldPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithPropertyKeys(keys);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithFieldName(const std::string& field_name)`

    Sets the name of the field.

- `WithPropertyKeys(std::set<std::string>&& keys)`

    Sets the properties to drop from this field.

- `AddPropertyKey(const std::string& key)`

    Sets a property to drop from this field.

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

status = client->DropCollectionFieldProperties(
    milvus::DropCollectionFieldPropertiesRequest()
        .WithCollectionName("my_collection")
        .WithFieldName("my_field")
        .AddPropertyKey("max_length"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

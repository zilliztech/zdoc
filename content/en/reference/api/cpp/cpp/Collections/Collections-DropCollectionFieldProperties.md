---
title: "DropCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFieldProperties
sidebar_label: "DropCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes the specified properties from a field of an existing collection. | Cloud"
type: docx
token: FCj5dkwVqo6Mlsxi6w9c3c9xnZb
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

This operation removes the specified properties from a field of an existing collection.

```c++
Status DropCollectionFieldProperties(const DropCollectionFieldPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name; the default database is used if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection that contains the target field.

- `WithFieldName(const std::string& field_name)`

    Sets the name of the field whose properties will be dropped.

- `WithPropertyKeys(std::set<std::string>&& keys)`

    Sets the property keys to drop from the field. The request takes ownership of the set via an rvalue reference, so pass it with std::move.

- `AddPropertyKey(const std::string& key)`

    Adds a single property key to drop from the field.

**RETURNS:**

*Status*

Returns a Status indicating whether the field properties were dropped successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call DropCollectionFieldProperties() on a connected MilvusClientV2 to drop the properties of a field.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .AddPropertyKey("mmap.enabled");
status = client->DropCollectionFieldProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "AlterCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation alters the properties of an existing collection. | Cloud"
type: docx
token: P8QFdIyQiojuy1xDQwecMgwRnHg
sidebar_position: 7
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

This operation alters the properties of an existing collection.

```c++
Status AlterCollectionProperties(const AlterCollectionPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database. If left empty, the default database is used.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection to alter.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets the properties to apply to the collection as key/value pairs. The request takes ownership of the map via an rvalue reference, so pass it with std::move.

- `AddProperty(const std::string& key, const std::string& property)`

    Adds a single property key/value pair to apply to the collection.

**RETURNS:**

*Status*

Returns a Status indicating whether the collection properties were altered successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call AlterCollectionProperties() on a connected MilvusClientV2 to alter the properties of the collection.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .AddProperty("mmap.enabled", "true");
status = client->AlterCollectionProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

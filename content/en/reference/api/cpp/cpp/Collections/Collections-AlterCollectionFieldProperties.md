---
title: "AlterCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFieldProperties
sidebar_label: "AlterCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation alters the properties of a specified field in an existing collection. | Cloud"
type: docx
token: TgEBdtrFron6aCxAE37cqHd3nvc
sidebar_position: 5
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFieldProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperties()

This operation alters the properties of a specified field in an existing collection.

```c++
Status AlterCollectionFieldProperties(const AlterCollectionFieldPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithProperties(properties)
    .AddProperty(key, property);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name; the default database is used if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection that contains the field to alter.

- `WithFieldName(const std::string& field_name)`

    Sets the name of the field to alter.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets the properties to apply to the field as key/value pairs. The request takes ownership of the map via an rvalue reference, so pass it with std::move.

- `AddProperty(const std::string& key, const std::string& property)`

    Adds a single property key/value pair to apply to the field.

**RETURNS:**

*Status*

Returns a Status indicating whether the field properties were altered successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call AlterCollectionFieldProperties() on a connected MilvusClientV2 to alter the properties of a field.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .AddProperty("mmap.enabled", "true");
status = client->AlterCollectionFieldProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

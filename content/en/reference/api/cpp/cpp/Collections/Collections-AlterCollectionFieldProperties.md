---
title: "AlterCollectionFieldProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFieldProperties
sidebar_label: "AlterCollectionFieldProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation alters a field's properties. | Cloud"
type: docx
token: A3gld3Xjco1VxSxi6Ndc3Bq4nuh
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

This operation alters a field's properties.

```c++
Status AlterCollectionFieldProperties(const AlterCollectionFieldPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterCollectionFieldPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithProperties(properties);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set the name of the collection.

- `WithFieldName(const std::string& field_name)`

    Sets the name of the target field.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets the properties to alter for the specified field. For details, refer to [this page](https://milvus.io/docs/alter-collection-field.md).

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

status = client->AlterCollectionFieldProperties(
    milvus::AlterCollectionFieldPropertiesRequest()
        .WithCollectionName("my_collection")
        .WithFieldName("my_field")
        .AddProperty("max_length", "512"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

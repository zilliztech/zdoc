---
title: "AlterCollectionProperties() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation alters collection properties. | Cloud"
type: docx
token: H5oLd8ZVfooSgixa5O9cyq37nCb
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

This operation alters collection properties.

```c++
Status AlterCollectionProperties(const AlterCollectionPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterCollectionPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithProperties(properties);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets the altered properties of this collection. For available properties, refer to [Supported properties](https://milvus.io/docs/modify-collection.md#Supported-properties).

- `AddProperty(const std::string& key, const std::string& property)`

    Sets one of the properties of this collection. For available properties, refer to [Supported properties](https://milvus.io/docs/modify-collection.md#Supported-properties).

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

status = client->AlterCollectionProperties(
    milvus::AlterCollectionPropertiesRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name)
        .AddProperty(milvus::COLLECTION_TTL_SECONDS, "20")
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "DropIndexProperties() | Cloud"
slug: /cpp/cpp/Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes specified properties from an index. | Cloud"
type: docx
token: P03PdoFAHoGTfxxA8AScr9CmnDc
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

This operation removes specified properties from an index.

```c++
Status DropIndexProperties(const DropIndexPropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .WithPropertyKeys(keys)
    .AddPropertyKey(key);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. If left empty, the default database is used.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection that owns the index.

- `WithIndexName(const std::string& index_name)`

    Sets the name of the index whose properties are to be dropped. Currently, this API only supports index_name.

- `WithPropertyKeys(std::set<std::string>&& keys)`

    Sets the property keys to remove from the index. Accepts a std::set&lt;std::string&gt; by rvalue reference, so the contents are moved into the request.

- `AddPropertyKey(const std::string& key)`

    Adds a single property key to the set of keys to be removed from the index.

**RETURNS:**

*Status*

Returns a Status indicating whether the index properties were dropped successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call DropIndexProperties() on a connected MilvusClientV2 to remove the mmap.enabled property from an index.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropIndexPropertiesRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexName(index_name)
    .AddPropertyKey("mmap.enabled");
status = client->DropIndexProperties(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "AlterAlias() | Cloud"
slug: /cpp/cpp/Collections-AlterAlias
sidebar_label: "AlterAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation reassigns an existing alias from its current collection to the collection specified in the request, so that search and query calls using the alias subsequently address the new collection. | Cloud"
type: docx
token: V2UCd9pXGobxHKxw10HcZBuQn8f
sidebar_position: 4
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - AlterAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterAlias()

This operation reassigns an existing alias from its current collection to the collection specified in the request, so that search and query calls using the alias subsequently address the new collection.

```c++
Status AlterAlias(const AlterAliasRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database; the default database is used if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection to which the alias is reassigned.

- `WithAlias(const std::string& alias)`

    Sets the name of the alias to change.

**RETURNS:**

*Status*

Returns a Status indicating whether the alias was changed successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call AlterAlias() on a connected MilvusClientV2 to reassign an alias to another collection.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
status = client->AlterAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

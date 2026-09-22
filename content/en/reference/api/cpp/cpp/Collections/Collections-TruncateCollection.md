---
title: "TruncateCollection() | Cloud"
slug: /cpp/cpp/Collections-TruncateCollection
sidebar_label: "TruncateCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Truncate a collection, removing all data while keeping the collection structure. | Cloud"
type: docx
token: GCNTd5HUkogWVDxUcuLcEusZnlh
sidebar_position: 33
keywords: 
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - TruncateCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# TruncateCollection()

Truncate a collection, removing all data while keeping the collection structure.

```c++
Status TruncateCollection(const TruncateCollectionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = TruncateCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates TruncateCollection() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::TruncateCollectionRequest();
util::CheckStatus(client->TruncateCollection(request));
```

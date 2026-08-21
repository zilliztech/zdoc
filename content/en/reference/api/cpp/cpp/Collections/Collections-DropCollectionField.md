---
title: "DropCollectionField() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionField
sidebar_label: "DropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Drop a field from an existing collection. | Cloud"
type: docx
token: Qgmsdk9v3oAOXlxlx0nc1svZn2b
sidebar_position: 35
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionField()

Drop a field from an existing collection.

```c++
Status DropCollectionField(const DropCollectionFieldRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropCollectionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithFieldID(field_id);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithFieldName(std::string field_name)`

    Set the name of the field to drop.

- `WithFieldID(int64_t field_id)`

    Set the ID of the field to drop.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates DropCollectionField() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropCollectionFieldRequest();
util::CheckStatus(client->DropCollectionField(request));
```

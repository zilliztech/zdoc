---
title: "AddCollectionStructField() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionStructField
sidebar_label: "AddCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Add a struct field to an existing collection. | Cloud"
type: docx
token: GWPxd80BYoQleSxNCPNcFvWsnzb
sidebar_position: 33
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionStructField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionStructField()

Add a struct field to an existing collection.

```c++
Status AddCollectionStructField(const AddCollectionStructFieldRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AddCollectionStructFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithStructField(field_schema);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithStructField(StructFieldSchema&& field_schema)`

    Set the struct field schema.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates AddCollectionStructField() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddCollectionStructFieldRequest();
util::CheckStatus(client->AddCollectionStructField(request));
```

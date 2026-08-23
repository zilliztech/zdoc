---
title: "AddFunctionField() | Cloud"
slug: /cpp/cpp/Collections-AddFunctionField
sidebar_label: "AddFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Add a function-backed output field to an existing collection. | Cloud"
type: docx
token: TcF2doHmuoNHsKxRRJbcsYevnph
sidebar_position: 34
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - AddFunctionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddFunctionField()

Add a function-backed output field to an existing collection.

```c++
Status AddFunctionField(const AddFunctionFieldRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AddFunctionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithField(field_schema)
    .WithFunction(function)
    .WithIndex(index);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithField(FieldSchema&& field_schema)`

    Set the field schema.

- `WithFunction(const FunctionPtr& function)`

    Set the function to be added.

- `WithIndex(IndexDesc&& index)`

    Set the index bound to the function output field. The bound index is required and must use an explicit index type. AUTOINDEX is not supported.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates AddFunctionField() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddFunctionFieldRequest();
util::CheckStatus(client->AddFunctionField(request));
```

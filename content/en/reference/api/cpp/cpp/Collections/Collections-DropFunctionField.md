---
title: "DropFunctionField() | Cloud"
slug: /cpp/cpp/Collections-DropFunctionField
sidebar_label: "DropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Drop a function from an existing collection together with its generated output fields. | Cloud"
type: docx
token: CC9zdTSe3onmvrxGs5ic0e8inJd
sidebar_position: 36
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - DropFunctionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropFunctionField()

Drop a function from an existing collection together with its generated output fields.

```c++
Status DropFunctionField(const DropFunctionFieldRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropFunctionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithFunctionName(std::string function_name)`

    Set the name of the function to drop together with its output fields.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates DropFunctionField() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropFunctionFieldRequest();
util::CheckStatus(client->DropFunctionField(request));
```

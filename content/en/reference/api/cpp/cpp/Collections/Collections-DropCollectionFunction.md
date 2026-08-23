---
title: "DropCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFunction
sidebar_label: "DropCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "Drop a function of an existing collection. | Cloud"
type: docx
token: C6UadudBVopgWOxeZRwcf0uKn6b
sidebar_position: 22
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionFunction()

Drop a function of an existing collection.

<Admonition type="info" icon="📘" title="Note">

Deprecated in v3.0.x. Use DropFunctionField() to drop the function together with its output field and bound index.

</Admonition>

```c++
Status DropCollectionFunction(const DropCollectionFunctionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
```

### DropCollectionFunctionRequest\{#dropcollectionfunctionrequest}

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithFunctionName(std::string function_name)`

    Set the name of the function to drop.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates DropCollectionFunction() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropCollectionFunctionRequest();
util::CheckStatus(client->DropCollectionFunction(request));
```

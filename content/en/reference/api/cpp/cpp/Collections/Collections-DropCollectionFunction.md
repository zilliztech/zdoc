---
title: "DropCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFunction
sidebar_label: "DropCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "This operation drops a function of an existing collection. | Cloud"
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

This operation drops a function of an existing collection.

<Admonition type="info" title="Notes">

Deprecated in v3.0.x. Use [DropFunctionField()](./Collections-DropFunctionField) to drop the function together with its output field and bound index.

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

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database. If it is empty, the default database is used.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the target collection.

- `WithFunctionName(std::string function_name)`

    Sets the name of the function to drop. This cannot be empty.

**RETURNS:**

*Status*

Returns a Status indicating whether the function was dropped successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call DropCollectionFunction() on a connected MilvusClientV2 to drop a function of an existing collection.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
status = client->DropCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

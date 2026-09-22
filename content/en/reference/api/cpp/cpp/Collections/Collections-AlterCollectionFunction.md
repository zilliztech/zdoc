---
title: "AlterCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFunction
sidebar_label: "AlterCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation alters a function of an existing collection. The function name carried by the Function object identifies which function is altered. | Cloud"
type: docx
token: YuvidafRvob4HuxnxrGcU7Vsnbh
sidebar_position: 6
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFunction()

This operation alters a function of an existing collection. The function name carried by the Function object identifies which function is altered.

```c++
Status AlterCollectionFunction(const AlterCollectionFunctionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name; the default database is used if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithFunction(const FunctionPtr& function)`

    Sets the function with the new definition, as a shared pointer to the function definition; its name identifies which function to alter.

**RETURNS:**

*Status*

Returns a Status indicating whether the function was altered successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call AlterCollectionFunction() on a connected MilvusClientV2 to alter a function of an existing collection.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
status = client->AlterCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

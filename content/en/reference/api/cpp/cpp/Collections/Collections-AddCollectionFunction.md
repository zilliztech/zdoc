---
title: "AddCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionFunction
sidebar_label: "AddCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "This operation adds a function to an existing collection. | Cloud"
type: docx
token: OrRqdvj4yoN2cMxbHUkcEE9Xnbg
sidebar_position: 2
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionFunction()

This operation adds a function to an existing collection.

<Admonition type="info" title="Notes">

Deprecated in v3.0.x. Use [AddFunctionField()](./Collections-AddFunctionField) to add the function together with a new output field and bound index.

</Admonition>

```c++
Status AddCollectionFunction(const AddCollectionFunctionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AddCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name; the default database is used if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection to add the function to.

- `WithFunction(const FunctionPtr& function)`

    Sets the function to add to the collection, as a shared pointer to the function definition.

**RETURNS:**

*Status*

Returns a Status indicating whether the function was added successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call AddCollectionFunction() on a connected MilvusClientV2 to add a function to an existing collection.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AddCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
status = client->AddCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

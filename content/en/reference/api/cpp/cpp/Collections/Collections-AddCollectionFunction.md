---
title: "AddCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionFunction
sidebar_label: "AddCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "Add a function to an existing collection. | Cloud"
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

Add a function to an existing collection.

<Admonition type="info" icon="📘" title="Note">

Deprecated in v3.0.x. Use AddFunctionField() to add the function together with a new output field and bound index.

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

### AddCollectionFunctionRequest\{#addcollectionfunctionrequest}

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Set target db name, use default database if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Set name of the collection.

- `WithFunction(const FunctionPtr& function)`

    Set the function to be added.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates AddCollectionFunction() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddCollectionFunctionRequest();
util::CheckStatus(client->AddCollectionFunction(request));
```

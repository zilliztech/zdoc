---
title: "AlterCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFunction
sidebar_label: "AlterCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "This operation replaces the definition of an existing collection function identified by the function name in the provided Function object. | Cloud"
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

This operation replaces the definition of an existing collection function identified by the function name in the provided Function object.

```c++
Status AlterCollectionFunction(const AlterCollectionFunctionRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterCollectionFunctionRequest()
    .WithCollectionName(collection_name)
    .WithFunction(function_ptr);
```

### AlterCollectionFunctionRequest\{#altercollectionfunctionrequest}

**REQUEST METHODS:**

- `WithCollectionName(const std::string& collection_name)`

    Sets the collection whose function definition will be changed.

- `WithDatabaseName(const std::string& db_name)`

    Sets the database containing the target collection.

- `WithFunction(const FunctionPtr& function)`

    Supplies the updated function definition. Its name identifies which function to alter.

**RETURNS:**

*Status*

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for missing function names, invalid function definitions, or unavailable collections.

## Example\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto function = std::make_shared<milvus::Function>();
function->SetName("bm25_fn");

status = client->AlterCollectionFunction(
    milvus::AlterCollectionFunctionRequest()
        .WithCollectionName("docs")
        .WithFunction(function));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

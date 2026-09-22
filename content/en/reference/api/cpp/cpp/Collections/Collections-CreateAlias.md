---
title: "CreateAlias() | Cloud"
slug: /cpp/cpp/Collections-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates an alias for a collection so that search and query calls can address the collection by the alias in place of its name. | Cloud"
type: docx
token: Pz42dXmiqoCNScx0MPzcjmXLnib
sidebar_position: 13
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - CreateAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateAlias()

This operation creates an alias for a collection so that search and query calls can address the collection by the alias in place of its name.

```c++
Status CreateAlias(const CreateAliasRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = CreateAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database; the default database is used if this is left empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection to alias.

- `WithAlias(const std::string& alias)`

    Sets the name of the alias to create.

**RETURNS:**

*Status*

Returns a Status indicating whether the alias was created successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call CreateAlias() on a connected MilvusClientV2 to create an alias that references an existing collection.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::CreateAliasRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithAlias(alias);
status = client->CreateAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

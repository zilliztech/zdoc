---
title: "CreateAlias() | Cloud"
slug: /cpp/cpp/Collections-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an alias for a collection. Alias can be used in a search or query to replace the collection name. | Cloud"
type: docx
token: TCOmduhQKosBcNxfUQOcLdzqnAf
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

This operation creates an alias for a collection. Alias can be used in a search or query to replace the collection name.

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

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(const std::string& collection_name)`

    Sets the name of the collection.

- `WithAlias(const std::string& alias)`

    Sets the name of the alias.

**RETURNS:**

*Status*

Check `status.IsOk()` to confirm success.

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## Example\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateAlias(
    milvus::CreateAliasRequest()
        .WithCollectionName("my_collection")
        .WithAlias("my_alias"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

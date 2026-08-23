---
title: "CreateDatabase() | Cloud"
slug: /cpp/cpp/Database-CreateDatabase
sidebar_label: "CreateDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a new database. | Cloud"
type: docx
token: J7vTderKqoQFotxp1RUcLVzenBv
sidebar_position: 2
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - CreateDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateDatabase()

This operation creates a new database.

```c++
Status CreateDatabase(const CreateDatabaseRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = CreateDatabaseRequest()
    .WithDatabaseName(db_name)
    .WithProperties(properties);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets properties of this database.

- `AddProperty(const std::string& key, const std::string& property)`

    Adds a property to this database.

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

std::unordered_map<std::string, std::string> props;
props.emplace("database.replica.number", "2");
status = client->CreateDatabase(
    milvus::CreateDatabaseRequest()
        .WithDatabaseName(my_db_name)
        .WithProperties(std::move(props))
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

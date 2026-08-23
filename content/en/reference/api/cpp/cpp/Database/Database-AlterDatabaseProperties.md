---
title: "AlterDatabaseProperties() | Cloud"
slug: /cpp/cpp/Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation alters a database property. | Cloud"
type: docx
token: XPsfdhNDhopm2Ux7HKncEtZonjh
sidebar_position: 1
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - AlterDatabaseProperties()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties()

This operation alters a database property. 

```c++
Status AlterDatabaseProperties(const AlterDatabasePropertiesRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterDatabasePropertiesRequest()
    .WithDatabaseName(db_name)
    .WithProperties(properties);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithProperties(std::unordered_map<std::string, std::string>&& properties)`

    Sets altered properties of this database. You can find the available database properties on [this page](https://milvus.io/docs/manage_databases.md#Manage-database-properties). 

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

status = client->AlterDatabaseProperties(
    milvus::AlterDatabasePropertiesRequest()
        .WithDatabaseName("my_database")
        .AddProperty("key", "value"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

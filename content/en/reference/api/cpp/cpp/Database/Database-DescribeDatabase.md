---
title: "DescribeDatabase() | Cloud"
slug: /cpp/cpp/Database-DescribeDatabase
sidebar_label: "DescribeDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the description of a database, including its properties. | Cloud"
type: docx
token: ZNfkd4vqOoG9RexySyicxncBnzf
sidebar_position: 3
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeDatabase()

This operation returns the description of a database, including its properties.

```c++
Status DescribeDatabase(const DescribeDatabaseRequest& request, DescribeDatabaseResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DescribeDatabaseRequest()
    .WithDatabaseName(db_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

**RETURNS:**

*Status* with *DescribeDatabaseResponse*

Check `status.IsOk()` to confirm success.

### DatabaseDesc\{#databasedesc}

This class represents the metadata of a Milvus database. It is returned by calling `Desc()` on a `DescribeDatabaseResponse` object.

```c++
const DatabaseDesc& desc = response.Desc();
```

**METHODS:**

- `const std::string& Name() const`

    Name of the database.

- `int64_t ID() const`

    Server-assigned database ID.

- `const std::unordered_map<std::string, std::string>& Properties() const`

    Database-level properties as key-value pairs.

- `uint64_t CreatedTime() const`

    UTC timestamp (microseconds) when the database was created.

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

milvus::DescribeDatabaseResponse resp_desc_db;
status = client->DescribeDatabase(
    milvus::DescribeDatabaseRequest()
        .WithDatabaseName(my_db_name), 
    resp_desc_db
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "database.replica.number = " << resp_desc_db.Desc().Properties().at("database.replica.number")
          << std::endl;
```

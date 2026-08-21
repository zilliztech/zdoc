---
title: "DropDatabase() | Cloud"
slug: /cpp/cpp/Database-DropDatabase
sidebar_label: "DropDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a database. | Cloud"
type: docx
token: H6bldn5xxoPeGJxoX7Icp0tpnMb
sidebar_position: 4
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabase()

This operation drops a database.

```c++
Status DropDatabase(const DropDatabaseRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropDatabaseRequest()
    .WithDatabaseName(db_name);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

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

status = client->DropDatabase(
    milvus::DropDatabaseRequest()
        .WithDatabaseName(my_db_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

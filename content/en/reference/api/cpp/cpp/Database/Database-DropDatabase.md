---
title: "DropDatabase() | Cloud"
slug: /cpp/cpp/Database-DropDatabase
sidebar_label: "DropDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a database on the connected Milvus server. | Cloud"
type: docx
token: GkzpdbQMGovXFIx0n8pc6aDinfc
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

This operation drops a database on the connected Milvus server.

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

    Sets the name of the database to drop.

**RETURNS:**

*Status*

Returns a Status indicating whether the database was dropped successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call DropDatabase() on a connected MilvusClientV2 to drop a database by name.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropDatabaseRequest()
    .WithDatabaseName(db_name);
status = client->DropDatabase(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

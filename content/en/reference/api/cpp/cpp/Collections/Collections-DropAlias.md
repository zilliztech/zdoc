---
title: "DropAlias() | Cloud"
slug: /cpp/cpp/Collections-DropAlias
sidebar_label: "DropAlias()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops an alias so that the name no longer resolves to its collection, while the underlying collection remains unaffected. | Cloud"
type: docx
token: JUcUd5B8QoDmc5xEx0LcmVZHnyN
sidebar_position: 19
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - DropAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropAlias()

This operation drops an alias so that the name no longer resolves to its collection, while the underlying collection remains unaffected.

```c++
Status DropAlias(const DropAliasRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
```

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the target database; the default database is used if it is empty.

- `WithAlias(const std::string& alias)`

    Sets the name of the alias to drop.

**RETURNS:**

*Status*

Returns a Status indicating whether the alias was dropped successfully.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or the returned Status for failure details.

## Example\{#example}

Call DropAlias() on a connected MilvusClientV2 to drop an alias from a collection.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DropAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
status = client->DropAlias(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

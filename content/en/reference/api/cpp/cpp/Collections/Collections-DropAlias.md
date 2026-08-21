---
title: "DropAlias() | Cloud"
slug: /cpp/cpp/Collections-DropAlias
sidebar_label: "DropAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops an alias. | Cloud"
type: docx
token: WsSQdBrrOo4hhbx9XWFciuVAn3b
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

This operation drops an alias.

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

    Sets the target database name. 

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

status = client->DropAlias(
    milvus::DropAliasRequest()
        .WithAlias("my_alias"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "GrantPrivilegeV2() | Cloud"
slug: /cpp/cpp/Authentication-GrantPrivilegeV2
sidebar_label: "GrantPrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a privilege or a privilege group to a role. | Cloud"
type: docx
token: RkNpdn17xopIkwxeBxYcmQj0nFg
sidebar_position: 11
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilegeV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilegeV2()

This operation grants a privilege or a privilege group to a role.

```c++
Status GrantPrivilegeV2(const GrantPrivilegeV2Request& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = GrantPrivilegeV2Request()
    .WithRoleName(name)
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPrivilege(privilege);
```

**REQUEST METHODS:**

- `WithRoleName(const std::string& name)`

    Sets the role's name.

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name for the role.

- `WithCollectionName(const std::string& collection_name)`

    Sets the target collection name for the role.

- `WithPrivilege(const std::string& privilege)`

    Sets the name of the privilege to assign to the role. For available privileges, refer to [this page](https://milvus.io/docs/grant_privileges.md).

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

status = client->GrantPrivilegeV2(
    milvus::GrantPrivilegeV2Request()
        .WithRoleName(role_name)
        .WithPrivilege(privilege_group_name)
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

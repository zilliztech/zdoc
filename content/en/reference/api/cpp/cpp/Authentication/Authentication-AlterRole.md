---
title: "AlterRole() | Cloud"
slug: /cpp/cpp/Authentication-AlterRole
sidebar_label: "AlterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates the description of a role. | Cloud"
type: docx
token: HkRQd5kF5om421xNwSmcoaz3nxb
sidebar_position: 2
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - AlterRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterRole()

This operation updates the description of a role.

```c++
Status AlterRole(const AlterRoleRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = AlterRoleRequest()
    .WithRoleName(role_name)
    .WithDescription(description);
```

**REQUEST METHODS:**

- `WithRoleName(const std::string& role_name)`

    Sets the name of the role.

- `WithDescription(const std::string& description)`

    Sets the role's description.

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

status = client->AlterRole(
    milvus::AlterRoleRequest()
        .WithRoleName(role_name)
        .WithDescription(description)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

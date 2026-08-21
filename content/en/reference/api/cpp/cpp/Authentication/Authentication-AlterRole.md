---
title: "AlterRole() | Cloud"
slug: /cpp/cpp/Authentication-AlterRole
sidebar_label: "AlterRole()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Changes the description of an existing role. | Cloud"
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

Changes the description of an existing role.

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

    Used by MilvusClientV2::AlterRole().

- `WithDescription(const std::string& description)`

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates AlterRole() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AlterRoleRequest();
util::CheckStatus(client->AlterRole(request));
```

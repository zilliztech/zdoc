---
title: "DescribeRole() | Cloud"
slug: /cpp/cpp/Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describe an role. | Cloud"
type: docx
token: U8KCdu2BRohC5CxZK7vch6TGnrc
sidebar_position: 6
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeRole()

Describe an role.

```c++
Status DescribeRole(const DescribeRoleRequest& request, DescribeRoleResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DescribeRoleRequest()
    .WithRoleName(name)
    .WithDatabaseName(db_name);
```

**REQUEST METHODS:**

- `WithRoleName(const std::string& name)`

    Set name of the role.

- `WithDatabaseName(const std::string& db_name)`

    Set database name which the role is assigned.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates DescribeRole() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DescribeRoleRequest();
milvus::DescribeRoleResponse response;
util::CheckStatus(client->DescribeRole(request, response));
```

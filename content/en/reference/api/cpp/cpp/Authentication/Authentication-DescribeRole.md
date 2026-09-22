---
title: "DescribeRole() | Cloud"
slug: /cpp/cpp/Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation provides the details of the specified role. | Cloud"
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

This operation provides the details of the specified role.

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

    Sets the name of the role to describe.

- `WithDatabaseName(const std::string& db_name)`

    Sets the name of the database in which the role is scoped. Optional.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

- **response** (*DescribeRoleResponse*) -

    - **Desc** (*const RoleDesc&*) -

        Get role description.

        - **Name** (*const std::string&*) -

            Get name of the role.

        - **Description** (*const std::string&*) -

            Get the role description.

        - **GrantItems** (*const std::vector&lt;GrantItem&gt;&*) -

            Get privilege items of the role.

            - **object_type_** (*std::string*) -

                privilege type.

            - **object_name_** (*std::string*) -

                privilege name.

            - **db_name_** (*std::string*) -

                in which database take effect.

            - **role_name_** (*std::string*) -

                grant to which role.

            - **privilege_** (*std::string*) -

                privilege.

            - **grantor_name_** (*std::string*) -

                grantor name.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Describes the role named &lt;role_name&gt; after connecting a MilvusClientV2.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeRoleRequest()
    .WithRoleName(name)
    .WithDatabaseName(db_name);
status = client->DescribeRole(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

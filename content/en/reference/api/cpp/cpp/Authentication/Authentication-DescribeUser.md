---
title: "DescribeUser() | Cloud"
slug: /cpp/cpp/Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation provides the details of the specified user, including the roles granted to them. | Cloud"
type: docx
token: WqOudbitToLoSRx9faGctun6nlf
sidebar_position: 7
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeUser()

This operation provides the details of the specified user, including the roles granted to them.

```c++
Status DescribeUser(const DescribeUserRequest& request, DescribeUserResponse& response)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DescribeUserRequest()
    .WithUserName(name);
```

**REQUEST METHODS:**

- `WithUserName(const std::string& name)`

    Sets the name of the user to describe.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

- **response** (*DescribeUserResponse*) -

    - **Desc** (*const UserDesc&*) -

        Get user description.

        - **Name** (*const std::string&*) -

            Get the name of the user.

        - **Description** (*const std::string&*) -

            Get the user description.

        - **Roles** (*const std::vector&lt;std::string&gt;&*) -

            Get role names of the user.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

The following example demonstrates how to use DescribeUser() to retrieve a user's details.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeUserRequest()
    .WithUserName(name);
status = client->DescribeUser(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

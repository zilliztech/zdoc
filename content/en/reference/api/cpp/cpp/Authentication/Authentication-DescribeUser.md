---
title: "DescribeUser() | Cloud"
slug: /cpp/cpp/Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describe an user. | Cloud"
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

Describe an user.

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

    Set name of the user.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates DescribeUser() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DescribeUserRequest();
milvus::DescribeUserResponse response;
util::CheckStatus(client->DescribeUser(request, response));
```

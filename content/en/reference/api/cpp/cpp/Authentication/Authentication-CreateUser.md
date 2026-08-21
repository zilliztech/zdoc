---
title: "CreateUser() | Cloud"
slug: /cpp/cpp/Authentication-CreateUser
sidebar_label: "CreateUser()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Create an user with username and password to login milvus. | Cloud"
type: docx
token: InqLdJ931o15yIxpt1bcfYFinAf
sidebar_position: 5
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - CreateUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateUser()

Create an user with username and password to login milvus.

```c++
Status CreateUser(const CreateUserRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = CreateUserRequest()
    .WithUserName(name)
    .WithPassword(password)
    .WithDescription(description);
```

**REQUEST METHODS:**

- `WithUserName(const std::string& name)`

    Set name of the user.

- `WithPassword(const std::string& password)`

    Set password of the user.

- `WithDescription(const std::string& description)`

    Set description of the user.

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates CreateUser() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::CreateUserRequest();
util::CheckStatus(client->CreateUser(request));
```

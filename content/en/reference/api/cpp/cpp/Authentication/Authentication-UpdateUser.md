---
title: "UpdateUser() | Cloud"
slug: /cpp/cpp/Authentication-UpdateUser
sidebar_label: "UpdateUser()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Update password of an user. | Cloud"
type: docx
token: XXBwdXvCWo1te0xWjifc19kUnjf
sidebar_position: 22
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - UpdateUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UpdateUser()

Update password of an user.

```c++
Status UpdateUser(const UpdateUserRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = UpdateUserRequest()
    .WithUserName(user_name)
    .WithDescription(description);
```

**REQUEST METHODS:**

- `WithUserName(const std::string& user_name)`

    Used by MilvusClientV2::UpdateUser().

- `WithDescription(const std::string& description)`

**RETURNS:**

*Status*

Returns a status indicating whether the operation succeeded.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

Demonstrates UpdateUser() with the C++ SDK.

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::UpdateUserRequest();
util::CheckStatus(client->UpdateUser(request));
```

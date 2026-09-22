---
title: "UpdateUser() | Cloud"
slug: /cpp/cpp/Authentication-UpdateUser
sidebar_label: "UpdateUser()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates a user's description. | Cloud"
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

This operation updates a user's description.

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

    Sets the name of the user.

- `WithDescription(const std::string& description)`

    Sets the user's description.

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

status = client->UpdateUser(
    milvus::UpdateUserRequest()
        .WithUserName(user_name)
        .WithDescription(description)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

---
title: "DropUser() | Cloud"
slug: /cpp/cpp/Authentication-DropUser
sidebar_label: "DropUser()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a user. | Cloud"
type: docx
token: FtGndkY80oH1PNx04hvclmVCnDg
sidebar_position: 10
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - DropUser()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropUser()

This operation drops a user.

```c++
Status DropUser(const DropUserRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropUserRequest()
    .WithUserName(name);
```

**REQUEST METHODS:**

- `WithUserName(const std::string& name)`

    Sets the name of the user.

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

status = client->DropUser(
    milvus::DropUserRequest()
        .WithUserName(user_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

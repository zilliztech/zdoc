---
title: "DropRole() | Cloud"
slug: /cpp/cpp/Authentication-DropRole
sidebar_label: "DropRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a role. | Cloud"
type: docx
token: QRNudMVJXoG1flxBkEocI2pynef
sidebar_position: 9
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - DropRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropRole()

This operation drops a role.

```c++
Status DropRole(const DropRoleRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = DropRoleRequest()
    .WithRoleName(name)
    .WithForceDrop(force_drop);
```

**REQUEST METHODS:**

- `WithRoleName(const std::string& name)`

    Sets the name of the role.

- `WithForceDrop(bool force_drop)`

    Sets the flag whether to force drop the role.

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

status = client->DropRole(
    milvus::DropRoleRequest()
        .WithRoleName(role_name)
        .WithForceDrop(false)
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

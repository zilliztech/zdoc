---
title: "RemovePrivilegesFromGroup() | Cloud"
slug: /cpp/cpp/Authentication-RemovePrivilegesFromGroup
sidebar_label: "RemovePrivilegesFromGroup()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes privileges from a privilege group. | Cloud"
type: docx
token: TCfed4TH2o0XkdxkZDPcwPTdnWG
sidebar_position: 17
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - RemovePrivilegesFromGroup()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RemovePrivilegesFromGroup()

This operation removes privileges from a privilege group.

```c++
Status RemovePrivilegesFromGroup(const RemovePrivilegesFromGroupRequest& request)
```

## Request Syntax\{#request-syntax}

```c++
auto request = RemovePrivilegesFromGroupRequest()
    .WithGroupName(name)
    .WithPrivileges(privileges);
```

**REQUEST METHODS:**

- `WithGroupName(const std::string& name)`

    Set the name of the target privilege group for this operation.

- `WithPrivileges(std::set<std::string>&& privileges)`

    Sets the privileges to be removed from the specified group.

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

privileges = {"Search", "Query"};
status = client->RemovePrivilegesFromGroup(
    milvus::RemovePrivilegesFromGroupRequest()
       .WithGroupName(privilege_group_name)
       .WithPrivileges(std::move(privileges))
);

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

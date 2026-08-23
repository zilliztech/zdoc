---
title: "PrivilegeGroupInfo | Cloud"
slug: /cpp/cpp/Authentication-PrivilegeGroupInfo
sidebar_label: "PrivilegeGroupInfo"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "This class represents a single privilege group, which is a named set of privileges that can be granted to a role as a unit. `ListPrivilegeGroupsResponse:Groups()` returns a `PrivilegeGroupInfos` value, which is a type alias for `std::vector`. | Cloud"
type: docx
token: Gzj9djiMTooQUgxl4dfcOIfvnUb
sidebar_position: 16
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - PrivilegeGroupInfo
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# PrivilegeGroupInfo

This class represents a single privilege group, which is a named set of privileges that can be granted to a role as a unit. `ListPrivilegeGroupsResponse::Groups()` returns a `PrivilegeGroupInfos` value, which is a type alias for `std::vector<PrivilegeGroupInfo>`.

```c++
PrivilegeGroupInfo();
PrivilegeGroupInfo(const std::string& name, std::vector<std::string>&& privileges);

using PrivilegeGroupInfos = std::vector<PrivilegeGroupInfo>;
```

**METHODS:**

- `const std::string& Name() const`

    Name of the privilege group.

- `const std::vector<std::string>& Privileges() const`

    List of privilege names included in this group.

## Example\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

ListPrivilegeGroupsResponse response;
auto status = client->ListPrivilegeGroups(
    ListPrivilegeGroupsRequest(),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const PrivilegeGroupInfos& groups = response.Groups();
for (const auto& group : groups) {
    std::cout << "Group: " << group.Name() << "\n";
    for (const auto& priv : group.Privileges()) {
        std::cout << "  " << priv << "\n";
    }
}
```

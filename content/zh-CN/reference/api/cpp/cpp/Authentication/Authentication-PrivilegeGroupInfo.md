---
title: "PrivilegeGroupInfo | Cloud"
slug: /cpp/cpp/Authentication-PrivilegeGroupInfo
sidebar_label: "PrivilegeGroupInfo"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类表示单个权限组，即一组可作为一个整体授予角色的命名权限集合。`ListPrivilegeGroupsResponse:Groups()` 返回一个 `PrivilegeGroupInfos` 值，该值是 `std::vector` 的类型别名。 | Cloud"
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

此类表示单个权限组，即一组可作为一个整体授予角色的命名权限集合。`ListPrivilegeGroupsResponse::Groups()` 返回一个 `PrivilegeGroupInfos` 值，该值是 `std::vector<PrivilegeGroupInfo>` 的类型别名。

```c++
PrivilegeGroupInfo();
PrivilegeGroupInfo(const std::string& name, std::vector<std::string>&& privileges);

using PrivilegeGroupInfos = std::vector<PrivilegeGroupInfo>;
```

**方法：**

- `const std::string& Name() const`

    权限组的名称。

- `const std::vector<std::string>& Privileges() const`

    此组中包含的权限名称列表。

## 示例\{#example}

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

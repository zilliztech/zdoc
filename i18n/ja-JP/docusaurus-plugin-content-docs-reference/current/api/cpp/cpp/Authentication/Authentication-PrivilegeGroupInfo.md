---
title: "PrivilegeGroupInfo | Cloud"
slug: /cpp/cpp/Authentication-PrivilegeGroupInfo
sidebar_label: "PrivilegeGroupInfo"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは単一の権限グループを表します。権限グループとは、ロールに対してまとめて付与できる名前付きの権限セットです。`ListPrivilegeGroupsResponse:Groups()` は `PrivilegeGroupInfos` 値を返しますが、これは `std::vector` の型エイリアスです。 | Cloud"
type: docx
token: Gzj9djiMTooQUgxl4dfcOIfvnUb
sidebar_position: 16
keywords: 
  - ハイブリッド検索
  - 語彙検索
  - 最近傍探索
  - エージェンティック RAG
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

このクラスは単一の権限グループを表します。権限グループとは、ロールに対してまとめて付与できる名前付きの権限セットです。`ListPrivilegeGroupsResponse::Groups()` は `PrivilegeGroupInfos` 値を返しますが、これは `std::vector<PrivilegeGroupInfo>` の型エイリアスです。

```c++
PrivilegeGroupInfo();
PrivilegeGroupInfo(const std::string& name, std::vector<std::string>&& privileges);

using PrivilegeGroupInfos = std::vector<PrivilegeGroupInfo>;
```

**メソッド:**

- `const std::string& Name() const`

    権限グループの名前。

- `const std::vector<std::string>& Privileges() const`

    このグループに含まれる権限名のリスト。

## 例\{#example}

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

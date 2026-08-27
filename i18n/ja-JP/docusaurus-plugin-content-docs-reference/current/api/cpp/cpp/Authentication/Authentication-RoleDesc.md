---
title: "RoleDesc | Cloud"
slug: /cpp/cpp/Authentication-RoleDesc
sidebar_label: "RoleDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "このページでは、`RoleDesc` と `GrantItem` について説明します。`RoleDesc` は、Milvus ロールのメタデータおよび関連する権限を表します。これは、`DescribeRoleResponse` に対して `Desc()` を呼び出すことで返されます。各権限エントリは `GrantItem` 構造体です。 | Cloud"
type: docx
token: UuNVdIvAYoTy3GxmbcGcQ1chn3b
sidebar_position: 20
keywords: 
  - AI chatbots
  - cosine distance
  - what is a ベクトル データベース
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - RoleDesc
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RoleDesc

このページでは、`RoleDesc` と `GrantItem` について説明します。`RoleDesc` は、Milvus ロールのメタデータおよび関連する権限を表します。これは、`DescribeRoleResponse` に対して `Desc()` を呼び出すことで返されます。各権限エントリは `GrantItem` 構造体です。

## RoleDesc\{#roledesc}

```c++
RoleDesc();
RoleDesc(const std::string& name, std::vector<GrantItem>&& grant_items);
```

**メソッド:**

- `const std::string& Name() const`

    ロール名。

- `const std::vector<GrantItem>& GrantItems() const`

    このロールに割り当てられた権限付与のリストです。各エントリは GrantItem 構造体です（後述）。

## GrantItem\{#grantitem}

`GrantItem` は、単一の権限付与を表すシンプルな構造体です。

```c++
struct GrantItem {
    GrantItem(const std::string& object_type, const std::string& object_name,
              const std::string& db_name, const std::string& role_name,
              const std::string& grantor_name, const std::string& privilege);

    std::string object_type_;   // e.g., "Global", "Collection"
    std::string object_name_;   // resource name (e.g., collection name or "*")
    std::string db_name_;       // database in which the privilege takes effect
    std::string role_name_;     // role that holds this privilege
    std::string privilege_;     // privilege name (e.g., "Insert", "Search")
    std::string grantor_name_;  // user who granted this privilege
};
```

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

DescribeRoleResponse response;
auto status = client->DescribeRole(
    DescribeRoleRequest().WithRoleName("read_only"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const RoleDesc& desc = response.Desc();
std::cout << "Role: " << desc.Name() << "\n";
for (const auto& item : desc.GrantItems()) {
    std::cout << "  " << item.privilege_
              << " on " << item.object_type_ << "/" << item.object_name_
              << " (db=" << item.db_name_ << ")\n";
}
```

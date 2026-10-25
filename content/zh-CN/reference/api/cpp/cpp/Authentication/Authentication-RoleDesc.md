---
title: "RoleDesc | Cloud"
slug: /cpp/cpp/Authentication-RoleDesc
sidebar_label: "RoleDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "本页同时介绍 `RoleDesc` 和 `GrantItem`。`RoleDesc` 表示 Milvus 角色的元数据及其关联权限。它通过调用 `DescribeRoleResponse` 上的 `Desc()` 返回。每个权限条目都是一个 `GrantItem` 结构体。 | Cloud"
type: docx
token: UuNVdIvAYoTy3GxmbcGcQ1chn3b
sidebar_position: 20
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - RoleDesc
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# RoleDesc

本页同时介绍 `RoleDesc` 和 `GrantItem`。`RoleDesc` 表示 Milvus 角色的元数据及其关联权限。它通过调用 `DescribeRoleResponse` 上的 `Desc()` 返回。每个权限条目都是一个 `GrantItem` 结构体。

## RoleDesc\{#roledesc}

```c++
RoleDesc();
RoleDesc(const std::string& name, std::vector<GrantItem>&& grant_items);
```

**方法：**

- `const std::string& Name() const`

    角色名称。

- `const std::vector<GrantItem>& GrantItems() const`

    分配给此角色的权限授权列表。每一项都是一个 GrantItem 结构体（见下文）。

## GrantItem\{#grantitem}

`GrantItem` 是一个普通结构体，用于描述单个权限授权。

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

## 示例\{#example}

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

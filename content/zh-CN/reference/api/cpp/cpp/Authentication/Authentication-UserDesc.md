---
title: "UserDesc | Cloud"
slug: /cpp/cpp/Authentication-UserDesc
sidebar_label: "UserDesc"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类表示 Milvus 用户的元数据。通过在 `DescribeUserResponse` 上调用 `Desc()` 返回。 | Cloud"
type: docx
token: UhsfdHxjhoWttaxASWEcygc7nLc
sidebar_position: 23
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - UserDesc
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UserDesc

此类表示 Milvus 用户的元数据。通过在 `DescribeUserResponse` 上调用 `Desc()` 返回。

```c++
UserDesc();
UserDesc(const std::string& name, std::vector<std::string>&& roles);
```

**方法：**

- `const std::string& Name() const`

    用户名。

- `const std::vector<std::string>& Roles() const`

    分配给该用户的角色名称列表。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

DescribeUserResponse response;
auto status = client->DescribeUser(
    DescribeUserRequest().WithUsername("alice"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const UserDesc& desc = response.Desc();
std::cout << "User: " << desc.Name() << "\n";
for (const auto& role : desc.Roles()) {
    std::cout << "  role: " << role << "\n";
}
```

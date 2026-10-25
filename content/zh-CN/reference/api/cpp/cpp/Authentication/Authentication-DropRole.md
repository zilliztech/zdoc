---
title: "DropRole() | Cloud"
slug: /cpp/cpp/Authentication-DropRole
sidebar_label: "DropRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除角色。 | Cloud"
type: docx
token: QRNudMVJXoG1flxBkEocI2pynef
sidebar_position: 9
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - cloud
  - DropRole()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# DropRole()

此操作用于删除角色。

```c++
Status DropRole(const DropRoleRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = DropRoleRequest()
    .WithRoleName(name)
    .WithForceDrop(force_drop);
```

**请求方法：**

- `WithRoleName(const std::string& name)`

    设置角色的名称。

- `WithForceDrop(bool force_drop)`

    设置是否强制删除角色的标志位。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## 示例\{#example}

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

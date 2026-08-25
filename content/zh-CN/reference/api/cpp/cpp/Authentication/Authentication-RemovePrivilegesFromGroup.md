---
title: "RemovePrivilegesFromGroup() | Cloud"
slug: /cpp/cpp/Authentication-RemovePrivilegesFromGroup
sidebar_label: "RemovePrivilegesFromGroup()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于从权限组中移除权限。 | Cloud"
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

此操作用于从权限组中移除权限。

```c++
Status RemovePrivilegesFromGroup(const RemovePrivilegesFromGroupRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = RemovePrivilegesFromGroupRequest()
    .WithGroupName(name)
    .WithPrivileges(privileges);
```

**请求方法：**

- `WithGroupName(const std::string& name)`

    设置此操作的目标权限组名称。

- `WithPrivileges(std::set<std::string>&& privileges)`

    设置要从指定组中移除的权限。

**返回值：**

*Status*

检查 `status.IsOk()` 以确认操作是否成功。

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

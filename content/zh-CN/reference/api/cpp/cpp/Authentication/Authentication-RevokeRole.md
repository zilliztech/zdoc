---
title: "RevokeRole() | Cloud"
slug: /cpp/cpp/Authentication-RevokeRole
sidebar_label: "RevokeRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于撤销用户的角色。 | Cloud"
type: docx
token: EyJ4d9M4joZE3WxIoIac1hTNnng
sidebar_position: 19
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - RevokeRole()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RevokeRole()

此操作用于撤销用户的角色。

```c++
Status RevokeRole(const RevokeRoleRequest& request)
```

## 请求语法\{#request-syntax}

```c++
auto request = RevokeRoleRequest()
    .WithUserName(name)
    .WithRoleName(name);
```

**请求方法：**

- `WithUserName(const std::string& name)`

    设置此操作的目标用户名。

- `WithRoleName(const std::string& name)`

    设置要撤销的角色名称。

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

status = client->RevokeRole(
    milvus::RevokeRoleRequest()
        .WithUserName(user_name)
        .WithRoleName(role_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

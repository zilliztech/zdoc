---
title: "ListRoles() | Cloud"
slug: /cpp/cpp/Authentication-ListRoles
sidebar_label: "ListRoles()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会返回角色列表。 | Cloud"
type: docx
token: Syt3dskDpo3VcQxMu43cXcBFnre
sidebar_position: 14
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - 向量数据库
  - 多模态向量 Database 检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListRoles()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# ListRoles()

此操作会返回角色列表。

```c++
Status ListRoles(const ListRolesRequest& request, ListRolesResponse& response)
```

**返回：**

*Status* 与 *ListRolesResponse*

请检查 `status.IsOk()` 以确认操作成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以了解错误详情。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListRolesRequest request;
milvus::ListRolesResponse response;
status = client->ListRoles(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

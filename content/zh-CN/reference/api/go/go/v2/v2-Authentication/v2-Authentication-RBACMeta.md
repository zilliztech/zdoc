---
title: "RBACMeta | Go | v2"
slug: /go/go/v2-Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "RBAC 元数据的完整快照，包括用户、角色、授权和权限组。与 BackupRBAC/RestoreRBAC 一起使用。 | Go | v2"
type: docx
token: GyCrdXyvzobrrAxzFRbcRTlSnUb
sidebar_position: 18
keywords: 
  - 什么是向量数据库
  - 向量数据库对比
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - cloud
  - RBACMeta
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RBACMeta

RBAC 元数据的完整快照，包括用户、角色、授权和权限组。与 BackupRBAC/RestoreRBAC 一起使用。

```go
type RBACMeta struct {
    Users []*UserInfo
    Roles []*Role
    RoleGrants []*RoleGrants
    PrivilegeGroups []*PrivilegeGroup
}
```

**字段：**

- **Users** (*[]*UserInfo*)

    用户。

- **Roles** (*[]*Role*)

    已分配角色的列表。

- **RoleGrants** (*[]*RoleGrants*)

    角色授权。

- **PrivilegeGroups** (*[]*PrivilegeGroup*)

    权限组。

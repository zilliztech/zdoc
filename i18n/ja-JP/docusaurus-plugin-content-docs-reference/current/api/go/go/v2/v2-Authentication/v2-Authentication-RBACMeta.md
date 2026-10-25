---
title: "RBACMeta | Go | v2"
slug: /go/go/v2-Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ユーザー、ロール、権限付与、権限グループを含む RBAC メタデータの完全なスナップショットです。BackupRBAC/RestoreRBAC. とともに使用されます。 | Go | v2"
type: docx
token: QiqfdWnrkorbVuxiuUUcx6rznSb
sidebar_position: 18
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - cloud
  - RBACMeta
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RBACMeta

ユーザー、ロール、権限付与、権限グループを含む RBAC メタデータの完全なスナップショットです。BackupRBAC/RestoreRBAC. とともに使用されます。

```go
type RBACMeta struct {
    Users []*UserInfo
    Roles []*Role
    RoleGrants []*RoleGrants
    PrivilegeGroups []*PrivilegeGroup
}
```

**FIELDS:**

- **Users** (<em>[]</em>UserInfo&ast;) -

    RBACMeta のユーザーです。

- **Roles** (<em>[]</em>Role&ast;) -

    RBACMeta のロールです。

- **RoleGrants** (<em>[]</em>RoleGrants&ast;) -

    RBACMeta の権限付与です。

- **PrivilegeGroups** (<em>[]</em>PrivilegeGroup&ast;) -

    RBACMeta の権限グループです。

## 例\{#example}

```go
type RBACMeta struct {
    Users []*UserInfo
    Roles []*Role
    RoleGrants []*RoleGrants
    PrivilegeGroups []*PrivilegeGroup
}
```

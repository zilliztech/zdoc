---
title: "RBACMeta | Go | v2"
slug: /go/go/v2-Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザー、ロール、権限付与、権限グループを含む RBAC メタデータの完全なスナップショットです。BackupRBAC/RestoreRBAC. とともに使用されます。 | Go | v2"
type: docx
token: GyCrdXyvzobrrAxzFRbcRTlSnUb
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

displayed_sidbar: goSidebar
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

- **Users** (<em>[]</em>UserInfo&ast;)

    ユーザーです。

- **Roles** (<em>[]</em>Role&ast;)

    割り当てられたロールのリストです。

- **RoleGrants** (<em>[]</em>RoleGrants&ast;)

    ロールの権限付与です。

- **PrivilegeGroups** (<em>[]</em>PrivilegeGroup&ast;)

    権限グループです。

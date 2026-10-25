---
title: "RBACMeta | Go | v2"
slug: /go/go/v2-Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A full snapshot of RBAC metadata including users, roles, grants, and privilege groups. Used with BackupRBAC/RestoreRBAC. | Go | v2"
type: docx
token: QiqfdWnrkorbVuxiuUUcx6rznSb
sidebar_position: 18
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - RBACMeta
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RBACMeta

A full snapshot of RBAC metadata including users, roles, grants, and privilege groups. Used with BackupRBAC/RestoreRBAC.

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

    The Users of the RBACMeta.

- **Roles** (<em>[]</em>Role&ast;) -

    The Roles of the RBACMeta.

- **RoleGrants** (<em>[]</em>RoleGrants&ast;) -

    The RoleGrants of the RBACMeta.

- **PrivilegeGroups** (<em>[]</em>PrivilegeGroup&ast;) -

    The PrivilegeGroups of the RBACMeta.

## Example\{#example}

```go
type RBACMeta struct {
    Users []*UserInfo
    Roles []*Role
    RoleGrants []*RoleGrants
    PrivilegeGroups []*PrivilegeGroup
}
```

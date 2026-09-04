---
title: "RBACMeta | Go | v2"
slug: /go/go/v2-Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "A full snapshot of RBAC metadata including users, roles, grants, and privilege groups. Used with BackupRBAC/RestoreRBAC. | Go | v2"
type: docx
token: GyCrdXyvzobrrAxzFRbcRTlSnUb
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

displayed_sidbar: goSidebar
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

- **Users** (<em>[]</em>UserInfo*)

    The users.

- **Roles** (<em>[]</em>Role*)

    The list of assigned roles.

- **RoleGrants** (<em>[]</em>RoleGrants*)

    The role grants.

- **PrivilegeGroups** (<em>[]</em>PrivilegeGroup*)

    The privilege groups.
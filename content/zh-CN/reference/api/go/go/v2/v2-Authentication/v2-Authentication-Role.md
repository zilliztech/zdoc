---
title: "Role | Go | v2"
slug: /go/go/v2-Authentication-Role
sidebar_label: "Role"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一个角色及其被授予的权限，由 DescribeRole 返回。 | Go | v2"
type: docx
token: MUdZdTFeDoEtcwxBCOycaHyanr7
sidebar_position: 24
keywords: 
  - milvus
  - Zilliz
  - Milvus 向量 Database
  - Milvus 数据库
  - zilliz
  - Zilliz Cloud
  - cloud
  - Role
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Role

表示一个角色及其被授予的权限，由 DescribeRole 返回。

```go
type Role struct {
    RoleName string
    Privileges []GrantItem
}
```

**字段：**

- **RoleName** (*string*)

    角色的名称。

- **Privileges** (*[]GrantItem*)

    已授予权限的列表。

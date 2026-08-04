---
title: "PrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-PrivilegeGroup
sidebar_label: "PrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示可一起授予的具名权限组。 | Go | v2"
type: docx
token: IPv6dB9pdoGXeRxdoL4c70pWnmg
sidebar_position: 17
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - cloud
  - PrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# PrivilegeGroup

表示可一起授予的具名权限组。

```go
type PrivilegeGroup struct {
    GroupName string
    Privileges []string
}
```

**字段：**

- **GroupName** (*string*)

    权限组的名称。

- **Privileges** (*[]string*)

    已授予权限的列表。

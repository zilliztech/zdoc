---
title: "User | Go | v2"
slug: /go/go/v2-Authentication-User
sidebar_label: "User"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示具有其分配角色的用户，由 DescribeUser 返回。 | Go | v2"
type: docx
token: FCnndgcaworiHGxozvocjrZonIj
sidebar_position: 26
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless 向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - User
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# User

表示具有其分配角色的用户，由 DescribeUser 返回。

```go
type User struct {
    UserName string
    Roles []string
}
```

**字段：**

- **UserName** (*string*)

    用户的名称。

- **Roles** (*[]string*)

    已分配角色的列表。

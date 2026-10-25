---
title: "User | Go | v2"
slug: /go/go/v2-Authentication-User
sidebar_label: "User"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "割り当てられたロールを持つユーザーを表し、DescribeUser によって返されます。 | Go | v2"
type: docx
token: FCnndgcaworiHGxozvocjrZonIj
sidebar_position: 26
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - User
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# User

割り当てられたロールを持つユーザーを表し、DescribeUser によって返されます。

```go
type User struct {
    UserName string
    Roles []string
}
```

**FIELDS:**

- **UserName** (*string*)

    ユーザーの名前。

- **Roles** (*[]string*)

    割り当てられたロールの一覧。

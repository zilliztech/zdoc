---
title: "Role | Go | v2"
slug: /go/go/v2-Authentication-Role
sidebar_label: "Role"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "DescribeRole によって返される、付与された権限を持つロールを表します。 | Go | v2"
type: docx
token: MUdZdTFeDoEtcwxBCOycaHyanr7
sidebar_position: 24
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - Role
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Role

DescribeRole によって返される、付与された権限を持つロールを表します。

```go
type Role struct {
    RoleName string
    Privileges []GrantItem
}
```

**FIELDS:**

- **RoleName** (*string*)

    ロールの名前です。

- **Privileges** (*[]GrantItem*)

    付与された権限の一覧です。

---
title: "Role | Go | v2"
slug: /go/go/v2-Authentication-Role
sidebar_label: "Role"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents a role with its granted privileges, returned by DescribeRole. | Go | v2"
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

Represents a role with its granted privileges, returned by DescribeRole.

```go
type Role struct {
    RoleName string
    Privileges []GrantItem
}
```

**FIELDS:**

- **RoleName** (*string*)

    The name of the role.

- **Privileges** (*[]GrantItem*)

    The list of granted privileges.
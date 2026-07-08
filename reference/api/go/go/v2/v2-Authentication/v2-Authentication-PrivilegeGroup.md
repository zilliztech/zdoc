---
title: "PrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-PrivilegeGroup
sidebar_label: "PrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents a named group of privileges that can be granted together. | Go | v2"
type: docx
token: IPv6dB9pdoGXeRxdoL4c70pWnmg
sidebar_position: 17
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
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

Represents a named group of privileges that can be granted together.

```go
type PrivilegeGroup struct {
    GroupName string
    Privileges []string
}
```

**FIELDS:**

- **GroupName** (*string*)

    The name of the privilege group.

- **Privileges** (*[]string*)

    The list of granted privileges.
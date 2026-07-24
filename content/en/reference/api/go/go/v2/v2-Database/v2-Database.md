---
title: "Database | Go | v2"
slug: /go/go/v2-Database
sidebar_label: "Database"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Represents a database description returned by DescribeDatabase, including custom properties. | Go | v2"
type: docx
token: KXgNdgTrWoglBsxXTjvcIwnpnqh
sidebar_position: 3
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - Database
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Database

Represents a database description returned by DescribeDatabase, including custom properties.

```go
type Database struct {
    Name string
    Properties map[string]string
}
```

**FIELDS:**

- **Name** (*string*)

    The name.

- **Properties** (*map[string]string*)

    Custom key-value properties.
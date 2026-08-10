---
title: "Database | Go | v2"
slug: /go/go/v2-Database
sidebar_label: "Database"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示由 DescribeDatabase 返回的 Database 描述，包括自定义属性。 | Go | v2"
type: docx
token: KXgNdgTrWoglBsxXTjvcIwnpnqh
sidebar_position: 3
keywords: 
  - 大语言模型
  - 向量化
  - k 近邻算法
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

表示由 DescribeDatabase 返回的 Database 描述，包括自定义属性。

```go
type Database struct {
    Name string
    Properties map[string]string
}
```

**字段：**

- **Name** (*string*)

    名称。

- **Properties** (*map[string]string*)

    自定义键值属性。

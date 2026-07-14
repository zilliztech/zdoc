---
title: "Database | Go | v2"
slug: /go/go/v2-Database
sidebar_label: "データベース"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "カスタムプロパティを含む、DescribeDatabase によって返されるデータベースの説明を表します。 | Go | v2"
type: docx
token: KXgNdgTrWoglBsxXTjvcIwnpnqh
sidebar_position: 3
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - データベース
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Database

カスタムプロパティを含む、DescribeDatabase によって返されるデータベースの説明を表します。

```go
type Database struct {
    Name string
    Properties map[string]string
}
```

**FIELDS:**

- **Name** (*string*)

    名前。

- **Properties** (*map[string]string*)

    カスタムのキーと値のプロパティ。

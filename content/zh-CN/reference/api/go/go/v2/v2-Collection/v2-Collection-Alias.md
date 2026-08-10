---
title: "Alias | Go | v2"
slug: /go/go/v2-Collection-Alias
sidebar_label: "Alias"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一个 Collection Alias，以及与其关联的 Database 和 Collection 名称。 | Go | v2"
type: docx
token: GwIxdz90jojeBNx965VcTJHnnFd
sidebar_position: 2
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - 幻觉 LLM
  - 多模态搜索
  - zilliz
  - zilliz cloud
  - 云
  - Alias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Alias

表示一个 Collection Alias，以及与其关联的 Database 和 Collection 名称。

```go
type Alias struct {
    DbName string
    Alias string
    CollectionName string
}
```

**字段：**

- **DbName** (*string*)

    关联的 Database 名称。

- **Alias** (*string*)

    Alias 名称。

- **CollectionName** (*string*)

    关联的 Collection 名称。

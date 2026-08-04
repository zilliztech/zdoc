---
title: "Alias | Go | v2"
slug: /go/go/v2-Collection-Alias
sidebar_label: "Alias"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示集合别名及其关联的数据库和集合名称。 | Go | v2"
type: docx
token: GwIxdz90jojeBNx965VcTJHnnFd
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - Alias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Alias

表示集合别名及其关联的数据库和集合名称。

```go
type Alias struct {
    DbName string
    Alias string
    CollectionName string
}
```

**字段：**

- **DbName** (*string*)

    关联数据库的名称。

- **Alias** (*string*)

    别名名称。

- **CollectionName** (*string*)

    关联集合的名称。

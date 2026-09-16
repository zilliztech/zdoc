---
title: "IndexDescription | Go | v2"
slug: /go/go/v2-Management-IndexDescription
sidebar_label: "IndexDescription"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "描述一个索引，包括其类型、参数、构建状态和行数。 | Go | v2"
type: docx
token: Wyvhd3725onAmAxegk1caOHonQg
sidebar_position: 15
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - IndexDescription
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# IndexDescription

描述一个索引，包括其类型、参数、构建状态和行数。

```go
type IndexDescription struct {
    index.Index
    State index.IndexState
    PendingIndexRows int64
    TotalRows int64
    IndexedRows int64
}
```

**字段：**

- **index.Index** *(embedded)*

    继承 index.Index 的方法。

- **State** (*index.IndexState*)

    当前状态。

- **PendingIndexRows** (*int64*)

    待建立索引的行数。

- **TotalRows** (*int64*)

    总行数。

- **IndexedRows** (*int64*)

    已建立索引的行数。

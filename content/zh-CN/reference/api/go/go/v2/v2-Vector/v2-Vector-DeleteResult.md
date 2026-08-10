---
title: "DeleteResult | Go | v2"
slug: /go/go/v2-Vector-DeleteResult
sidebar_label: "DeleteResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "包含 Delete 操作的结果，包括已删除 Entity 的数量。 | Go | v2"
type: docx
token: Gh4ydrMIBopZekxncUFcrJctnBl
sidebar_position: 8
keywords: 
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - Embedding 模型
  - zilliz
  - zilliz cloud
  - 云
  - DeleteResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DeleteResult

包含 Delete 操作的结果，包括已删除 Entity 的数量。

```go
type DeleteResult struct {
    DeleteCount int64
}
```

**字段：**

- **DeleteCount** (*int64*)

    受影响的 Entity 数量。

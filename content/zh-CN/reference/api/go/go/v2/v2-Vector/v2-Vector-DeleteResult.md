---
title: "DeleteResult | Go | v2"
slug: /go/go/v2-Vector-DeleteResult
sidebar_label: "DeleteResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "包含 Delete 操作的结果，包括已删除实体的数量。 | Go | v2"
type: docx
token: Gh4ydrMIBopZekxncUFcrJctnBl
sidebar_position: 8
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - DeleteResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DeleteResult

包含 Delete 操作的结果，包括已删除实体的数量。

```go
type DeleteResult struct {
    DeleteCount int64
}
```

**字段：**

- **DeleteCount** (*int64*)

    受影响的实体数量。

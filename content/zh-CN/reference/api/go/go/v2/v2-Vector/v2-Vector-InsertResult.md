---
title: "InsertResult | Go | v2"
slug: /go/go/v2-Vector-InsertResult
sidebar_label: "InsertResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "包含 Insert 操作的结果，包括已插入 Entity 的数量和 ID。 | Go | v2"
type: docx
token: EqKvdT96PoSVzzxyEF7civIgnDh
sidebar_position: 12
keywords: 
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - zilliz
  - zilliz cloud
  - 云
  - InsertResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# InsertResult

包含 Insert 操作的结果，包括已插入 Entity 的数量和 ID。

```go
type InsertResult struct {
    InsertCount int64
    IDs column.Column
}
```

**字段：**

- **InsertCount** (*int64*)

    受影响的 Entity 数量。

- **IDs** (*column.Column*)

    受影响的 Entity 的 ID。

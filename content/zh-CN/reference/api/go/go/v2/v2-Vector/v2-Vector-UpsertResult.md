---
title: "UpsertResult | Go | v2"
slug: /go/go/v2-Vector-UpsertResult
sidebar_label: "UpsertResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "包含 Upsert 操作的结果，包括受影响 Entity 的数量和 ID。 | Go | v2"
type: docx
token: KlfGdGLbxo7zfNxin91cgFxWnQO
sidebar_position: 20
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - UpsertResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UpsertResult

包含 Upsert 操作的结果，包括受影响 Entity 的数量和 ID。

```go
type UpsertResult struct {
    UpsertCount int64
    IDs column.Column
}
```

**字段：**

- **UpsertCount** (*int64*)

    受影响 Entity 的数量。

- **IDs** (*column.Column*)

    受影响 Entity 的 ID。

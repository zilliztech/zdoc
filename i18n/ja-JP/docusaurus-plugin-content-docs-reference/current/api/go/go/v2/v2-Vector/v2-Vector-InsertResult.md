---
title: "InsertResult | Go | v2"
slug: /go/go/v2-Vector-InsertResult
sidebar_label: "InsertResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "挿入されたエンティティの件数と ID を含む Insert 操作の結果。 | Go | v2"
type: docx
token: EqKvdT96PoSVzzxyEF7civIgnDh
sidebar_position: 7
keywords: 
  - 安価な vector database
  - マネージド vector database
  - Pinecone vector database
  - 音声検索
  - zilliz
  - zilliz cloud
  - cloud
  - InsertResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# InsertResult

挿入されたエンティティの件数と ID を含む Insert 操作の結果です。

```go
type InsertResult struct {
    InsertCount int64
    IDs column.Column
}
```

**FIELDS:**

- **InsertCount** (*int64*)

    影響を受けたエンティティの数。

- **IDs** (*column.Column*)

    影響を受けたエンティティの ID。

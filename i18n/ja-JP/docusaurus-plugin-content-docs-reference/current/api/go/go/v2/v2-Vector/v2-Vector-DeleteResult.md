---
title: "DeleteResult | Go | v2"
slug: /go/go/v2-Vector-DeleteResult
sidebar_label: "DeleteResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "削除されたエンティティ数を含む Delete 操作の結果を格納します。 | Go | v2"
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

削除されたエンティティ数を含む Delete 操作の結果を格納します。

```go
type DeleteResult struct {
    DeleteCount int64
}
```

**FIELDS:**

- **DeleteCount** (*int64*)

    影響を受けたエンティティの数。

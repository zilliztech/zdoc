---
title: "InsertResult | Go | v2"
slug: /go/go/v2-Vector-InsertResult
sidebar_label: "InsertResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Contains the result of an Insert operation including the count and IDs of inserted entities. | Go | v2"
type: docx
token: EqKvdT96PoSVzzxyEF7civIgnDh
sidebar_position: 7
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
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

Contains the result of an Insert operation including the count and IDs of inserted entities.

```go
type InsertResult struct {
    InsertCount int64
    IDs column.Column
}
```

**FIELDS:**

- **InsertCount** (*int64*)

    The number of affected entities.

- **IDs** (*column.Column*)

    The IDs of the affected entities.
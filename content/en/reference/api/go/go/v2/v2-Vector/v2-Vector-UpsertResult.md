---
title: "UpsertResult | Go | v2"
slug: /go/go/v2-Vector-UpsertResult
sidebar_label: "UpsertResult"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Contains the result of an Upsert operation including the count and IDs of affected entities. | Go | v2"
type: docx
token: KlfGdGLbxo7zfNxin91cgFxWnQO
sidebar_position: 15
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - UpsertResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UpsertResult

Contains the result of an Upsert operation including the count and IDs of affected entities.

```go
type UpsertResult struct {
    UpsertCount int64
    IDs column.Column
}
```

**FIELDS:**

- **UpsertCount** (*int64*)

    The number of affected entities.

- **IDs** (*column.Column*)

    The IDs of the affected entities.
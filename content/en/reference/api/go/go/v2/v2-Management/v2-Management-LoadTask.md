---
title: "LoadTask | Go | v2"
slug: /go/go/v2-Management-LoadTask
sidebar_label: "LoadTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "An async task returned by LoadCollection/LoadPartitions. Call Await() to block until loading completes. | Go | v2"
type: docx
token: U9w7dQeEBom2UBxJZM1cJAIYniL
sidebar_position: 21
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - LoadTask
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadTask

An async task returned by LoadCollection/LoadPartitions. Call Await() to block until loading completes.

```go
type LoadTask struct {
}
```

**METHODS:**

- `Await(ctx context.Context) error`

    Blocks until the async operation completes or the context is cancelled. Returns an error if the operation fails.
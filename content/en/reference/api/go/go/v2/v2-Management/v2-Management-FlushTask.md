---
title: "FlushTask | Go | v2"
slug: /go/go/v2-Management-FlushTask
sidebar_label: "FlushTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "An async task returned by Flush. Call Await() to block until flushing completes. | Go | v2"
type: docx
token: BPXDdgDPzoaDTixPJLncvFZ0nig
sidebar_position: 10
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - FlushTask
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# FlushTask

An async task returned by Flush. Call Await() to block until flushing completes.

```go
type FlushTask struct {
}
```

**METHODS:**

- `Await(ctx context.Context) error`

    Blocks until the async operation completes or the context is cancelled. Returns an error if the operation fails.

- `GetFlushStats() segIDs []int64, flushSegIDs []int64, flushTs uint64, channelCheckpoints map[string]*msgpb.MsgPosition`

    Returns flush statistics including segment IDs and flush timestamp.
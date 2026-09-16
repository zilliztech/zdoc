---
title: "FlushTask | Go | v2"
slug: /go/go/v2-Management-FlushTask
sidebar_label: "FlushTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "由 Flush 返回的异步任务。调用 Await() 以阻塞，直到 flush 完成。 | Go | v2"
type: docx
token: BPXDdgDPzoaDTixPJLncvFZ0nig
sidebar_position: 10
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - zilliz
  - zilliz cloud
  - 云
  - FlushTask
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# FlushTask

由 Flush 返回的异步任务。调用 Await() 以阻塞，直到 flush 完成。

```go
type FlushTask struct {
}
```

**方法：**

- `Await(ctx context.Context) error`

    在异步操作完成或上下文被取消之前保持阻塞。如果操作失败，则返回错误。

- `GetFlushStats() segIDs []int64, flushSegIDs []int64, flushTs uint64, channelCheckpoints map[string]*msgpb.MsgPosition`

    返回 flush 统计信息，包括 Segment ID 和 flush 时间戳。

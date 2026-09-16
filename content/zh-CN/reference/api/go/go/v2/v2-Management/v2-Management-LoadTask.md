---
title: "LoadTask | Go | v2"
slug: /go/go/v2-Management-LoadTask
sidebar_label: "LoadTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "由 LoadCollection/LoadPartitions. 返回的异步任务。调用 Await() 以阻塞，直到加载完成。 | Go | v2"
type: docx
token: U9w7dQeEBom2UBxJZM1cJAIYniL
sidebar_position: 21
keywords: 
  - Zilliz
  - milvus 向量 Database
  - milvus db
  - milvus 向量 db
  - zilliz
  - zilliz cloud
  - 云
  - LoadTask
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadTask

由 LoadCollection/LoadPartitions. 返回的异步任务。调用 Await() 以阻塞，直到加载完成。

```go
type LoadTask struct {
}
```

**方法：**

- `Await(ctx context.Context) error`

    在异步操作完成或上下文被取消之前保持阻塞。如果操作失败，则返回错误。

---
title: "LoadTask | Go | v2"
slug: /go/go/v2-Management-LoadTask
sidebar_label: "LoadTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "由 LoadCollection/LoadPartitions. 返回的异步任务。调用 Await() 会阻塞，直至加载完成。 | Go | v2"
type: docx
token: U9w7dQeEBom2UBxJZM1cJAIYniL
sidebar_position: 20
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - LoadTask
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# LoadTask

由 LoadCollection/LoadPartitions. 返回的异步任务。调用 Await() 会阻塞，直至加载完成。

```go
type LoadTask struct {
}
```

**方法：**

- `Await(ctx context.Context) error`

    阻塞，直至异步操作完成或上下文被取消。如果操作失败，则返回错误。

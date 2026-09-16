---
title: "CreateIndexTask | Go | v2"
slug: /go/go/v2-Management-CreateIndexTask
sidebar_label: "CreateIndexTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "由 CreateIndex 返回的异步任务。调用 Await() 以阻塞，直到索引构建完成。 | Go | v2"
type: docx
token: Y0IAdifhVoYQVAxiZEdcjIS0nog
sidebar_position: 5
keywords: 
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - 视频去重
  - zilliz
  - zilliz cloud
  - 云
  - CreateIndexTask
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndexTask

由 CreateIndex 返回的异步任务。调用 Await() 以阻塞，直到索引构建完成。

```go
type CreateIndexTask struct {
}
```

**方法：**

- `Await(ctx context.Context) error`

    在异步操作完成或上下文被取消之前保持阻塞。如果操作失败，则返回错误。

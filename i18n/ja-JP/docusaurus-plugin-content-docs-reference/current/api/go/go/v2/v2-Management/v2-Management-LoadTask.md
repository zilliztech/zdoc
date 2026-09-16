---
title: "LoadTask | Go | v2"
slug: /go/go/v2-Management-LoadTask
sidebar_label: "LoadTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "LoadCollection/LoadPartitions. から返される非同期タスクです。ロードが完了するまでブロックするには、Await() を呼び出します。 | Go | v2"
type: docx
token: U9w7dQeEBom2UBxJZM1cJAIYniL
sidebar_position: 21
keywords: 
  - Zilliz
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
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

LoadCollection/LoadPartitions. から返される非同期タスクです。ロードが完了するまでブロックするには、Await() を呼び出します。

```go
type LoadTask struct {
}
```

**METHODS:**

- `Await(ctx context.Context) error`

    非同期操作が完了するか、コンテキストがキャンセルされるまでブロックします。操作が失敗した場合はエラーが返されます。

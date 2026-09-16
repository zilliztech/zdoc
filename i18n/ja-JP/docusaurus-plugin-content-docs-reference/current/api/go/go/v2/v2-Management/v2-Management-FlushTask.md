---
title: "FlushTask | Go | v2"
slug: /go/go/v2-Management-FlushTask
sidebar_label: "FlushTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Flush から返される非同期タスクです。フラッシュが完了するまでブロックするには、Await() を呼び出します。 | Go | v2"
type: docx
token: BPXDdgDPzoaDTixPJLncvFZ0nig
sidebar_position: 10
keywords: 
  - ベクトルの次元
  - ANN Search
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
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

Flush から返される非同期タスクです。フラッシュが完了するまでブロックするには、Await() を呼び出します。

```go
type FlushTask struct {
}
```

**METHODS:**

- `Await(ctx context.Context) error`

    非同期操作が完了するか、コンテキストがキャンセルされるまでブロックします。操作が失敗した場合はエラーが返されます。

- `GetFlushStats() segIDs []int64, flushSegIDs []int64, flushTs uint64, channelCheckpoints map[string]*msgpb.MsgPosition`

    セグメント ID とフラッシュのタイムスタンプを含むフラッシュ統計を返します。

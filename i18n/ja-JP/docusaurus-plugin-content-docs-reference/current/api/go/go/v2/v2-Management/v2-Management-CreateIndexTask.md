---
title: "CreateIndexTask | Go | v2"
slug: /go/go/v2-Management-CreateIndexTask
sidebar_label: "CreateIndexTask"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "CreateIndex によって返される非同期タスクです。インデックスの構築が完了するまでブロックするには、Await() を呼び出します。 | Go | v2"
type: docx
token: Y0IAdifhVoYQVAxiZEdcjIS0nog
sidebar_position: 5
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateIndexTask
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndexTask

CreateIndex によって返される非同期タスクです。インデックスの構築が完了するまでブロックするには、Await() を呼び出します。

```go
type CreateIndexTask struct {
}
```

**メソッド:**

- `Await(ctx context.Context) error`

    非同期操作が完了するか、コンテキストがキャンセルされるまでブロックします。操作が失敗した場合はエラーを返します。

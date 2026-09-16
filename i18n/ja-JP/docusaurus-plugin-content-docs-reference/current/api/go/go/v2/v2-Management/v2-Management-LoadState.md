---
title: "LoadState | Go | v2"
slug: /go/go/v2-Management-LoadState
sidebar_label: "LoadState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションまたはパーティションのロード状態（進捗率を含む）を表します。 | Go | v2"
type: docx
token: XWSAdFkdDoaDPnxOtkEcuFETngL
sidebar_position: 20
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - zilliz
  - zilliz cloud
  - cloud
  - LoadState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadState

コレクションまたはパーティションのロード状態（進捗率を含む）を表します。

```go
type LoadState struct {
    State LoadStateCode
    Progress int64
}
```

**FIELDS:**

- **State** (*LoadStateCode*)

    現在の状態。

- **Progress** (*int64*)

    進捗率。

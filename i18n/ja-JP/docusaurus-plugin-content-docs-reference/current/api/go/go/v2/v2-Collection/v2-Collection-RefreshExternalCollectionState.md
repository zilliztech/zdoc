---
title: "RefreshExternalCollectionState | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionState
sidebar_label: "RefreshExternalCollectionState"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "この型は、外部 collection の更新ジョブの状態を表します。 | Go | v2"
type: docx
token: Or8Gd2JEIo1swQxD3QTccFoBn9b
sidebar_position: 29
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - RefreshExternalCollectionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionState

この型は、外部 collection の更新ジョブの状態を表します。

```go
type RefreshExternalCollectionState milvuspb.RefreshExternalCollectionState
```

**定数:**

- **RefreshStatePending** -<br/>
  ジョブは保留中で、まだ開始されていません。

- **RefreshStateInProgress** -<br/>
  ジョブは現在進行中です。

- **RefreshStateCompleted** -<br/>
  ジョブは正常に完了しました。


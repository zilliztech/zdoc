---
title: "RefreshExternalCollectionState | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionState
sidebar_label: "RefreshExternalCollectionState"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "RefreshExternalCollectionState インスタンスは、外部コレクションのリフレッシュジョブで取りうる状態を列挙します。 | Go | v2"
type: docx
token: Or8Gd2JEIo1swQxD3QTccFoBn9b
sidebar_position: 35
keywords: 
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - LLM-as-a-judge
  - ハイブリッドベクトル検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - RefreshExternalCollectionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionState

RefreshExternalCollectionState インスタンスは、外部コレクションのリフレッシュジョブで取りうる状態を列挙します。

```go
type RefreshExternalCollectionState milvuspb
```

**値：**

- **RefreshStatePending** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshPending)

    リフレッシュジョブは保留中です。

- **RefreshStateInProgress** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshInProgress)

    リフレッシュジョブは実行中です。

- **RefreshStateCompleted** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshCompleted)

    リフレッシュジョブは完了しました。

- **RefreshStateFailed** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshFailed)

    リフレッシュジョブは失敗しました。

## 例\{#example}

RefreshExternalCollectionState の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

jobs, err := cli.ListRefreshExternalCollectionJobs(ctx, milvusclient.NewListRefreshExternalCollectionJobsOption())
if err != nil {
	// handle error
}
if jobs[0].State == milvusclient.RefreshStateInProgress {
	fmt.Println("refresh still running")
}
```

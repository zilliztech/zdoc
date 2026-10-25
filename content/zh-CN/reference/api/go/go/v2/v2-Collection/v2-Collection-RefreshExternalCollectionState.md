---
title: "RefreshExternalCollectionState | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionState
sidebar_label: "RefreshExternalCollectionState"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "RefreshExternalCollectionState 实例用于枚举刷新外部 Collection 作业的可能状态。 | Go | v2"
type: docx
token: Or8Gd2JEIo1swQxD3QTccFoBn9b
sidebar_position: 35
keywords: 
  - 向量搜索算法
  - 问答系统
  - LLM 作为评判者
  - 混合向量搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - RefreshExternalCollectionState
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionState

RefreshExternalCollectionState 实例用于枚举刷新外部 Collection 作业的可能状态。

```go
type RefreshExternalCollectionState milvuspb
```

**取值：**

- **RefreshStatePending** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshPending)

    刷新作业待处理。

- **RefreshStateInProgress** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshInProgress)

    刷新作业正在进行中。

- **RefreshStateCompleted** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshCompleted)

    刷新作业已完成。

- **RefreshStateFailed** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshFailed)

    刷新作业已失败。

## 示例\{#example}

演示 RefreshExternalCollectionState 的用法。

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

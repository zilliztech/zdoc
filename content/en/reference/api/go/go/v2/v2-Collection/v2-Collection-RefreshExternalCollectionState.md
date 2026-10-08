---
title: "RefreshExternalCollectionState | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionState
sidebar_label: "RefreshExternalCollectionState"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A RefreshExternalCollectionState instance enumerates the possible states of a refresh external collection job. | Go | v2"
type: docx
token: Or8Gd2JEIo1swQxD3QTccFoBn9b
sidebar_position: 35
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollectionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionState

A RefreshExternalCollectionState instance enumerates the possible states of a refresh external collection job.

```go
type RefreshExternalCollectionState milvuspb
```

**VALUES:**

- **RefreshStatePending** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshPending)

    The refresh job is pending.

- **RefreshStateInProgress** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshInProgress)

    The refresh job is in progress.

- **RefreshStateCompleted** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshCompleted)

    The refresh job has completed.

- **RefreshStateFailed** = RefreshExternalCollectionState(RefreshExternalCollectionState_RefreshFailed)

    The refresh job has failed.

## Example\{#example}

Demonstrates RefreshExternalCollectionState usage.

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

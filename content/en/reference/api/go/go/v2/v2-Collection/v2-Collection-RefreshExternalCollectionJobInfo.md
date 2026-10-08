---
title: "RefreshExternalCollectionJobInfo | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A RefreshExternalCollectionJobInfo instance contains information about a refresh external collection job. | Go | v2"
type: docx
token: TxIQdcx34oB2CUxHIRMcRGPNnic
sidebar_position: 34
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollectionJobInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionJobInfo

A RefreshExternalCollectionJobInfo instance contains information about a refresh external collection job.

```go
type RefreshExternalCollectionJobInfo struct {
    JobID int64
    CollectionName string
    State RefreshExternalCollectionState
    Progress int64
    Reason string
    ExternalSource string
    ExternalSpec string
    StartTime int64
    EndTime int64
}
```

**FIELDS:**

- **JobID** (*int64*) -

    The unique identifier of the refresh job.

- **CollectionName** (*string*) -

    The name of the collection being refreshed.

- **State** ([RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)) -

    The current state of the refresh job.

- **Progress** (*int64*) -

    The progress percentage of the refresh job.

- **Reason** (*string*) -

    Additional information or reason for the current state.

- **ExternalSource** (*string*) -

    The external data source identifier.

- **ExternalSpec** (*string*) -

    The external data source specification (JSON), describing the file format and object storage settings.

- **StartTime** (*int64*) -

    The Unix timestamp when the job started.

- **EndTime** (*int64*) -

    The Unix timestamp when the job completed.

## Example\{#example}

Demonstrates RefreshExternalCollectionJobInfo usage.

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
for _, job := range jobs {
	fmt.Println(job.JobID, job.State)
}
```

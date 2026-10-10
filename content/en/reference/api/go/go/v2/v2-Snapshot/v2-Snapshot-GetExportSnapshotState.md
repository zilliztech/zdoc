---
title: "GetExportSnapshotState | Go | v2"
slug: /go/go/v2-Snapshot-GetExportSnapshotState
sidebar_label: "GetExportSnapshotState"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation queries the status and progress of an asynchronous snapshot export job. | Go | v2"
type: docx
token: Coq7d7x5qoOApzxWQAZcQ2wSnee
sidebar_position: 4
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - GetExportSnapshotState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetExportSnapshotState

This operation queries the status and progress of an asynchronous snapshot export job.

```go
func (c *Client) GetExportSnapshotState(ctx context.Context, opt GetExportSnapshotStateOption, callOptions ...grpc.CallOption) (*milvuspb.ExportSnapshotInfo, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetExportSnapshotState().

```go
option := milvusclient.NewGetExportSnapshotStateOption(jobID)

info, err := cli.GetExportSnapshotState(ctx, option)
```

**PARAMETERS:**

- **jobID** (*int64*) -

    **[REQUIRED]**

    The job ID returned by `ExportSnapshot()`.

**BUILDER METHODS:**

- `NewGetExportSnapshotStateOption(jobID int64)`

    Creates a new option for the export job to query.

**RETURN TYPE:**

*milvuspb.ExportSnapshotInfo, error*

**RETURNS:**

The durable state of the specified export snapshot job. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*milvuspb.ExportSnapshotInfo*) -

    The durable state of the specified export snapshot job.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GetExportSnapshotState() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

info, err := cli.GetExportSnapshotState(ctx, milvusclient.NewGetExportSnapshotStateOption(jobID))
if err != nil {
	// handle error
}

fmt.Printf("Export state: %v\n", info.GetState())
```

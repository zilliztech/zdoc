---
title: "ListRestoreSnapshotJobs() | Go | v2"
slug: /go/go/v2-Snapshot-ListRestoreSnapshotJobs
sidebar_label: "ListRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all restore snapshot jobs. Optionally filter by collection name or database name. | Go | v2"
type: docx
token: QrOmdt65AooKEkxVmNuc7qunnmf
sidebar_position: 6
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - ListRestoreSnapshotJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRestoreSnapshotJobs()

This operation lists all restore snapshot jobs. Optionally filter by collection name or database name.

```go
func (c *Client) ListRestoreSnapshotJobs(ctx context.Context, opt ListRestoreSnapshotJobsOption, callOptions ...grpc.CallOption) ([]*milvuspb.RestoreSnapshotInfo, error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListRestoreSnapshotJobs().

```go
option := client.NewListRestoreSnapshotJobsOption().
    WithCollectionName(collectionName string).
    WithDbName(dbName string)

result, err := client.ListRestoreSnapshotJobs(option)
```

**PARAMETERS:**

- **JobId** (*int64*) -

    The restore job ID.

- **SnapshotName** (*string*) -

    The snapshot name being restored.

- **DbName** (*string*) -

    The target database name.

- **CollectionName** (*string*) -

    The target collection name.

- **State** (*RestoreSnapshotState*) -

    Current state. Possible values: *RestoreSnapshotNone*, *RestoreSnapshotPending*, *RestoreSnapshotExecuting*, *RestoreSnapshotCompleted*, *RestoreSnapshotFailed*.

- **Progress** (*int64*) -

    Progress percentage (0-100).

- **Reason** (*string*) -

    Error reason if the job failed.

- **StartTime** (*int64*) -

    Start timestamp in milliseconds.

- **TimeCost** (*int64*) -

    Time cost in milliseconds.

**BUILDER METHODS:**

- `WithCollectionName(collectionName string)`

    This filters restore jobs by target collection name. If not set, all restore jobs are listed.

- `WithDbName(dbName string)`

    This specifies the database name. If not set, the default database is used.

**RETURN TYPE:**

<em>[]</em>milvuspb.RestoreSnapshotInfo, error&ast;

**RETURNS:**

A list of RestoreSnapshotInfo objects, each recording the details of a restore snapshot job.

```go
type RestoreSnapshotInfo struct {
    JobId          int64
    SnapshotName   string
    DbName         string
    CollectionName string
    State          RestoreSnapshotState
    Progress       int64
    Reason         string
    StartTime      int64
    TimeCost       int64
}
```

**PARAMETERS:**

- **result** (<em>[]</em>milvuspb.RestoreSnapshotInfo&ast;) -

    The RestoreSnapshotInfo objects, each recording the details of a restore snapshot job.

**ERROR HANDLING:**

- **error**

    The operation fails. Check err != nil for failure details.

## Example\{#example}

Demonstrates ListRestoreSnapshotJobs() usage.

```go
import (
	"log"
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
	log.Fatal(err)
}

defer cli.Close(ctx)

option := milvusclient.NewListRestoreSnapshotJobsOption()

jobs, err := cli.ListRestoreSnapshotJobs(ctx, option)
if err != nil {
	// handle error
}

for _, job := range jobs {
	fmt.Printf("Job %d: %s -> %s (%s)\n", job.GetJobId(), job.GetSnapshotName(), job.GetCollectionName(), job.GetState())
}
```

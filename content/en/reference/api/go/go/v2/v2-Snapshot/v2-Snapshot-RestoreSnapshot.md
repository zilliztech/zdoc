---
title: "RestoreSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-RestoreSnapshot
sidebar_label: "RestoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation restores a snapshot to a target collection. The restore runs asynchronously — use `GetRestoreSnapshotState()` to monitor progress. | Go | v2"
type: docx
token: DrQidTj6koNKBkxHi4NcAxBfnDd
sidebar_position: 10
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreSnapshot()

This operation restores a snapshot to a target collection. The restore runs asynchronously — use `GetRestoreSnapshotState()` to monitor progress.

```go
func (c *Client) RestoreSnapshot(ctx context.Context, opt RestoreSnapshotOption, callOptions ...grpc.CallOption) (int64, error)
```

## Request Syntax\{#request-syntax}

Creates the request for RestoreSnapshot().

```go
option := client.NewRestoreSnapshotOption(snapshotName, collectionName, targetCollectionName).
    WithDbName(dbName string).
    WithTargetDbName(targetDbName string)

jobID, err := client.RestoreSnapshot(option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the snapshot to restore.

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the source collection the snapshot was taken from.

- **targetCollectionName** (*string*) -

    **[REQUIRED]**

    The name for the restored collection. This must differ from the source collection name.

**BUILDER METHODS:**

- `WithDbName(dbName string)`

    This sets the source database name. If not set, the default database is used.

- `WithTargetDbName(targetDbName string)`

    This sets the target database name for the restored collection. If not set, the source database is used.

**RETURN TYPE:**

*int64, error*

**RETURNS:**

The restore job ID. Use this ID with `GetRestoreSnapshotState()` to track the restore progress. Returns an error if the snapshot does not exist or the operation fails.

**PARAMETERS:**

- **result** (*int64*) -

    The int64 value returned by RestoreSnapshot().

**ERROR HANDLING:**

- **error**

    The operation fails. Check err != nil for failure details.

## Example\{#example}

Demonstrates RestoreSnapshot() usage.

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

option := milvusclient.NewRestoreSnapshotOption("backup_20260418", "my_collection", "restored_collection")

jobID, err := cli.RestoreSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Printf("Restore job started: %d\n", jobID)
```

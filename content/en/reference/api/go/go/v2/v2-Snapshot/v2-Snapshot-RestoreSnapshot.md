---
title: "RestoreSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-RestoreSnapshot
sidebar_label: "RestoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation restores a snapshot to a target collection. The restore runs asynchronously — use `GetRestoreSnapshotState()` to monitor progress. | Go | v2"
type: docx
token: DrQidTj6koNKBkxHi4NcAxBfnDd
sidebar_position: 8
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

```go
option := client.NewRestoreSnapshotOption(snapshotName, collectionName, targetCollectionName).
    WithDbName(dbName string).
    WithTargetDbName(targetDbName string)

jobID, err := client.RestoreSnapshot(option)
```

**PARAMETERS:**

- **snapshotName** (*string*) -

    The name of the snapshot to restore.

- **collectionName** (*string*) -

    The name of the source collection the snapshot was taken from.

- **targetCollectionName** (*string*) -

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

**EXCEPTIONS:**

- **error**

    Check err != nil for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

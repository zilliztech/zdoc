---
title: "RestoreExternalSnapshot | Go | v2"
slug: /go/go/v2-Snapshot-RestoreExternalSnapshot
sidebar_label: "RestoreExternalSnapshot"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation restores an external snapshot to a target collection. The restore runs asynchronously — use `GetRestoreSnapshotState()` to monitor progress. | Go | v2"
type: docx
token: HSYWdB6MaoyG2vxEpMSca16fnsb
sidebar_position: 9
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreExternalSnapshot
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreExternalSnapshot

This operation restores an external snapshot to a target collection. The restore runs asynchronously — use `GetRestoreSnapshotState()` to monitor progress.

```go
func (c *Client) RestoreExternalSnapshot(ctx context.Context, opt RestoreExternalSnapshotOption, callOptions ...grpc.CallOption) (int64, error)
```

## Request Syntax\{#request-syntax}

Creates the request for RestoreExternalSnapshot().

```go
option := milvusclient.NewRestoreExternalSnapshotOption(targetCollectionName, snapshotMetadataURI).
    WithDbName(dbName).
    WithExternalSpec(externalSpec).
    WithRequestTimeout(timeout)

jobID, err := cli.RestoreExternalSnapshot(ctx, option)
```

**PARAMETERS:**

- **targetCollectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection to restore into.

- **snapshotMetadataURI** (*string*) -

    **[REQUIRED]**

    The URI of the snapshot metadata to restore.

**BUILDER METHODS:**

- `NewRestoreExternalSnapshotOption(targetCollectionName string, snapshotMetadataURI string)`

    Creates a new option to restore an external snapshot.

- `WithDbName(dbName string)`

    Sets the database name for the target collection.

- `WithExternalSpec(externalSpec string)`

    Sets the external storage specification (e.g., custom endpoint credentials) used for the restore.

- `WithRequestTimeout(timeout time.Duration)`

    Sets the timeout for the restore request. Default: `120 * time.Second`.

**RETURN TYPE:**

*int64, error*

**RETURNS:**

The restore job ID on success. Use this ID with `GetRestoreSnapshotState()` to track the restore progress. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*int64*) -

    The int64 value returned by RestoreExternalSnapshot().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates RestoreExternalSnapshot() usage.

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

jobID, err := cli.RestoreExternalSnapshot(ctx, milvusclient.NewRestoreExternalSnapshotOption("restored_collection", "s3://my-bucket/snapshots/backup/"))
if err != nil {
	// handle error
}

fmt.Printf("Restore job started: %d\n", jobID)
```

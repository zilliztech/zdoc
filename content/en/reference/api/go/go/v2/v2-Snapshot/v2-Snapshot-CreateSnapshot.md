---
title: "CreateSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-CreateSnapshot
sidebar_label: "CreateSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a point-in-time snapshot of a collection. Use snapshots to back up collection data and metadata for disaster recovery or migration. | Go | v2"
type: docx
token: QFxmdtUNVoy071xXO8Acvkdpnse
sidebar_position: 1
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateSnapshot()

This operation creates a point-in-time snapshot of a collection. Use snapshots to back up collection data and metadata for disaster recovery or migration.

```go
func (c *Client) CreateSnapshot(ctx context.Context, opt CreateSnapshotOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for CreateSnapshot().

```go
option := client.NewCreateSnapshotOption(snapshotName, collectionName).
    WithDescription(description string).
    WithDbName(dbName string)

err := client.CreateSnapshot(option)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the snapshot to create. This must be unique within the collection.

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the collection to snapshot.

**BUILDER METHODS:**

- `WithDescription(description string)`

    This sets an optional human-readable description for the snapshot.

- `WithDbName(dbName string)`

    This sets the database name. If not set, the default database is used.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success. Returns an error if the collection does not exist, the snapshot name is already taken, or the operation fails for any other reason.

**ERROR HANDLING:**

- **error**

    The operation fails. Check err != nil for failure details.

## Example\{#example}

Demonstrates CreateSnapshot() usage.

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

option := milvusclient.NewCreateSnapshotOption("backup_20260418", "my_collection").
	WithDescription("Daily backup before schema change")

err = cli.CreateSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println("Snapshot created successfully")
```

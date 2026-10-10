---
title: "UnpinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation unpins previously pinned snapshot data, allowing garbage collection to reclaim the files. | Go | v2"
type: docx
token: NgKmd79aSob0ruxRuUEcZba7nge
sidebar_position: 11
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - UnpinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

This operation unpins previously pinned snapshot data, allowing garbage collection to reclaim the files.

```go
func (c *Client) UnpinSnapshotData(ctx context.Context, opt UnpinSnapshotDataOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for UnpinSnapshotData().

```go
option := milvusclient.NewUnpinSnapshotDataOption(pinID)

err := cli.UnpinSnapshotData(ctx, option)
```

**PARAMETERS:**

- **pinID** (*int64*) -

    **[REQUIRED]**

    The pin ID returned by `PinSnapshotData()`.

**BUILDER METHODS:**

- `NewUnpinSnapshotDataOption(pinID int64)`

    Creates a new option for the pin to release.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates UnpinSnapshotData() usage.

```go
import (
	"context"

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

err = cli.UnpinSnapshotData(ctx, milvusclient.NewUnpinSnapshotDataOption(pinID))
if err != nil {
	// handle error
}
```

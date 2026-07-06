---
title: "UnpinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "This operation unpins previously pinned snapshot data, allowing it to be garbage collected. | Go | v2"
type: docx
token: NgKmd79aSob0ruxRuUEcZba7nge
sidebar_position: 9
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

This operation unpins previously pinned snapshot data, allowing it to be garbage collected.

```go
func (c *Client) UnpinSnapshotData(ctx context.Context, opt UnpinSnapshotDataOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewUnpinSnapshotDataOption(pinID)

err := cli.UnpinSnapshotData(ctx, option)
```

**PARAMETERS:**

- **opt** (*UnpinSnapshotDataOption*) -

    The options for unpinning snapshot data.

**BUILDER METHODS:**

- `NewUnpinSnapshotDataOption(pinID int64)`

    This creates an option to unpin snapshot data using the pin ID returned by `PinSnapshotData()`.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check err != nil for failure details.

## Example\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

pinID := int64(12345)

err = cli.UnpinSnapshotData(ctx, milvusclient.NewUnpinSnapshotDataOption(pinID))
if err != nil {
	log.Fatal("failed to unpin snapshot data: ", err.Error())
}
```

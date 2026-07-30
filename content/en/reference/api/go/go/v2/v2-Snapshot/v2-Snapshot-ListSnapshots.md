---
title: "ListSnapshots() | Go | v2"
slug: /go/go/v2-Snapshot-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all snapshot names for a specified collection. | Go | v2"
type: docx
token: Bs3OdQ56zohZEbx9KaHcInM4nHh
sidebar_position: 6
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - ListSnapshots()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListSnapshots()

This operation lists all snapshot names for a specified collection.

```go
func (c *Client) ListSnapshots(ctx context.Context, opt ListSnapshotsOption, callOptions ...grpc.CallOption) ([]string, error)
```

## Request Syntax\{#request-syntax}

```go
option := client.NewListSnapshotsOption(collectionName).
    WithDbName(dbName string)

result, err := client.ListSnapshots(option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    The name of the target collection.

**BUILDER METHODS:**

- `WithDbName(dbName string)`

    This sets the database name. If not set, the default database is used.

**RETURN TYPE:**

*[]string, error*

**RETURNS:**

A list of snapshot names. Returns an error if the operation fails.

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

option := milvusclient.NewListSnapshotsOption("my_collection")

snapshots, err := cli.ListSnapshots(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(snapshots)
```

---
title: "GetPersistentSegmentInfo | Go | v2"
slug: /go/go/v2-Management-GetPersistentSegmentInfo
sidebar_label: "GetPersistentSegmentInfo"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns information about persistent data segments in a collection. | Go | v2"
type: docx
token: WYiEdG01Oo8BgHxnjA3ci72insg
sidebar_position: 13
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - GetPersistentSegmentInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPersistentSegmentInfo

This operation returns information about persistent data segments in a collection.

```go
func (c *Client) GetPersistentSegmentInfo(ctx context.Context, option GetPersistentSegmentInfoOption) ([]*entity.Segment, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetPersistentSegmentInfo().

```go
option := milvusclient.NewGetPersistentSegmentInfoOption("quick_setup")

segments, err := client.GetPersistentSegmentInfo(ctx, option)
```

**BUILDER METHODS:**

- `NewGetPersistentSegmentInfoOption(collectionName string)`

    Creates the request for GetPersistentSegmentInfo().

**RETURN TYPE:**

<em>[]</em>entity.Segment, error&ast;

**RETURNS:**

A list of persistent segment details. Returns an error if the operation fails.

```go
type Segment struct {
    ID           int64
    CollectionID int64
    ParititionID int64
    NumRows      int64
    State        commonpb.SegmentState
}
```

**PARAMETERS:**

- **ID** (*int64*) -

    The unique identifier of the segment.

- **CollectionID** (*int64*) -

    The identifier of the collection the segment belongs to.

- **ParititionID** (*int64*) -

    The identifier of the partition the segment belongs to.

- **NumRows** (*int64*) -

    The number of rows in the segment.

- **State** (*commonpb.SegmentState*) -

    The current segment state.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GetPersistentSegmentInfo() usage.

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

segments, err := cli.GetPersistentSegmentInfo(ctx, milvusclient.NewGetPersistentSegmentInfoOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(segments)
```

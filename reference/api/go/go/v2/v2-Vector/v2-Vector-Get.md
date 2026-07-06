---
title: "Get() | Go | v2"
slug: /go/go/v2-Vector-Get
sidebar_label: "Get()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation retrieves entities by their primary key values. | Go | v2"
type: docx
token: FLBRdxZqWojjpXxuwJZc5APKncC
sidebar_position: 4
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - Get()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Get()

This operation retrieves entities by their primary key values.

```go
func (c *Client) Get(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewQueryOption(collectionName).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithLimit(limit).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithPartitions(partitionNames).
    WithIDs(ids)

result, err := client.Get(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    The name of the target collection.

**OPTION METHODS:**

- `WithFilter(expr string)`

    Applies a boolean filter expression to narrow results.

- `WithTemplateParam(key string, val any)`

    Sets a template parameter for expression evaluation.

- `WithOffset(offset int)`

    Sets the number of results to skip before returning matches.

- `WithLimit(limit int)`

    Sets the maximum number of results to return.

- `WithOutputFields(fieldNames ...string)`

    Specifies which fields to include in the returned results.

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    Sets the consistency level for the operation (Strong, Bounded, Session, or Eventually).

- `WithPartitions(partitionNames ...string)`

    Limits the operation to the specified partitions.

- `WithIDs(ids column.Column)`

    Sets the i ds for the operation.

**RETURN TYPE:**

*[ResultSet](./v2-Vector-ResultSet), error*

**RETURNS:**

The search or query results containing matched entities with scores and fields. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/column"
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

rs, err := cli.Get(ctx, milvusclient.NewQueryOption("quick_setup").
	WithIDs(column.NewColumnInt64("id", []int64{1, 2, 3})))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```

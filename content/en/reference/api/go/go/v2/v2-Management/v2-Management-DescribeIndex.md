---
title: "DescribeIndex | Go | v2"
slug: /go/go/v2-Management-DescribeIndex
sidebar_label: "DescribeIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns detailed information about an index, including its type and parameters. | Go | v2"
type: docx
token: PcKJdVvSkolLwnxpiQUcHO9Mnfh
sidebar_position: 6
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex

This operation returns detailed information about an index, including its type and parameters.

```go
func (c *Client) DescribeIndex(ctx context.Context, opt DescribeIndexOption, callOptions ...grpc.CallOption) (IndexDescription, error)
```

## Request Syntax\{#request-syntax}

Creates the request for DescribeIndex().

```go
option := milvusclient.NewDescribeIndexOption(collectionName, indexName)

result, err := client.DescribeIndex(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **indexName** (*string*) -

    **[REQUIRED]**

    The name of the index.

**BUILDER METHODS:**

- `NewDescribeIndexOption(collectionName string, indexName string)`

    Creates the request for DescribeIndex().

**RETURN TYPE:**

*IndexDescription, error*

**RETURNS:**

The index details including type, metric, and parameters. Returns an error if the operation fails.

```go
type IndexDescription struct {
    index.Index
    State index.IndexState
    PendingIndexRows int64
    TotalRows int64
    IndexedRows int64
}
```

**PARAMETERS:**

- **State** (*index.IndexState*) -

    The current state.

- **PendingIndexRows** (*int64*) -

    The number of rows pending indexing.

- **TotalRows** (*int64*) -

    The total number of rows.

- **IndexedRows** (*int64*) -

    The number of indexed rows.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DescribeIndex() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

indexInfo, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
fmt.Println(indexInfo)
```

---
title: "DescribeIndex() | Go | v2"
slug: /go/go/v2-Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns detailed information about an index, including its type and parameters. | Go | v2"
type: docx
token: PjAddPiH8oyRNpxqafBc1ZGknSd
sidebar_position: 6
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex()

This operation returns detailed information about an index, including its type and parameters.

```go
func (c *Client) DescribeIndex(ctx context.Context, opt DescribeIndexOption, callOptions ...grpc.CallOption) (IndexDescription, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDescribeIndexOption(collectionName, indexName)

result, err := client.DescribeIndex(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    The name of the target collection.

- **indexName** (*string*)

    The name of the index.

**RETURN TYPE:**

*[IndexDescription](./v2-Management-IndexDescription), error*

**RETURNS:**

The index details including type, metric, and parameters. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

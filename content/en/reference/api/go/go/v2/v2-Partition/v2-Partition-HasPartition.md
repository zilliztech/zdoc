---
title: "HasPartition() | Go | v2"
slug: /go/go/v2-Partition-HasPartition
sidebar_label: "HasPartition()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether a partition exists in a collection. | Go | v2"
type: docx
token: Cased8tfhoZ25Sx4VALcy4gZnbh
sidebar_position: 4
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - HasPartition()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasPartition()

This operation checks whether a partition exists in a collection.

```go
func (c *Client) HasPartition(ctx context.Context, opt HasPartitionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewHasPartitionOption(collectionName, partitionName)

result, err := client.HasPartition(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

The name of the target collection.

- **partitionName** (*string*)

The name of the partition to check.

**RETURN TYPE:**

*has bool, err error*

**RETURNS:**

A boolean indicating whether the resource exists. Returns an error if the operation fails.

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

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)
result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

fmt.Println(result)
```

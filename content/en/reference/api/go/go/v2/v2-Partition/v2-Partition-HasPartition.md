---
title: "HasPartition | Go | v2"
slug: /go/go/v2-Partition-HasPartition
sidebar_label: "HasPartition"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks whether a partition exists in a collection. | Go | v2"
type: docx
token: Qn1ddXN3ho1R9ixA2qRcr0JanJb
sidebar_position: 4
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - HasPartition
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasPartition

This operation checks whether a partition exists in a collection.

```go
func (c *Client) HasPartition(ctx context.Context, opt HasPartitionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## Request Syntax\{#request-syntax}

Creates the request for HasPartition().

```go
option := milvusclient.NewHasPartitionOption(collectionName, partitionName)

result, err := client.HasPartition(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    The name of the target collection.

- **partitionName** (*string*) -

    The name of the partition to check.

**BUILDER METHODS:**

- `NewHasPartitionOption(collectionName string, partitionName string)`

    Creates the request for HasPartition().

**RETURN TYPE:**

*has bool, err error*

**RETURNS:**

A boolean indicating whether the resource exists. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*has bool*) -

    The has bool value returned by HasPartition().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates HasPartition() usage.

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
result, err := cli.HasPartition(ctx, milvusclient.NewHasPartitionOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}

fmt.Println(result)
```

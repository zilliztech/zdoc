---
title: "DescribeCollection() | Go | v2"
slug: /go/go/v2-Collection-DescribeCollection
sidebar_label: "DescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns detailed information about a collection, including its schema and properties. | Go | v2"
type: docx
token: SCP5dY88horVwExBCD2cuSChnZM
sidebar_position: 11
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeCollection()

This operation returns detailed information about a collection, including its schema and properties.

```go
func (c *Client) DescribeCollection(ctx context.Context, option DescribeCollectionOption, callOptions ...grpc.CallOption) (collection *entity.Collection, err error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDescribeCollectionOption(name)

result, err := client.DescribeCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*)

    The name of the target collection.

**RETURN TYPE:**

*[collection* ](./v2-Collection)entity.Collection, err error*

**RETURNS:**

The collection description including schema, fields, and properties. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"
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

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(collection)
```

---
title: "DropCollection() | Go | v2"
slug: /go/go/v2-Collection-DropCollection
sidebar_label: "DropCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a collection and all its data permanently. | Go | v2"
type: docx
token: LBTLd1W4UoAbUHxvv6xce1gHnqf
sidebar_position: 13
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection()

This operation drops a collection and all its data permanently.

```go
func (c *Client) DropCollection(ctx context.Context, option DropCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDropCollectionOption(name)

err := client.DropCollection(ctx, option)
```

**PARAMETERS:**

- **name** (*string*)

    The name of the target collection.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

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

err = cli.DropCollection(ctx, milvusclient.NewDropCollectionOption("customized_setup_2"))
if err != nil {
	// handle err
}
```

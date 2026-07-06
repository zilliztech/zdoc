---
title: "RenameCollection() | Go | v2"
slug: /go/go/v2-Collection-RenameCollection
sidebar_label: "RenameCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation renames an existing collection. | Go | v2"
type: docx
token: XJN5dD1ifo5A9xxEfFKcf7Fxn1g
sidebar_position: 22
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - RenameCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RenameCollection()

This operation renames an existing collection.

```go
func (c *Client) RenameCollection(ctx context.Context, option RenameCollectionOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewRenameCollectionOption(oldName, newName)

err := client.RenameCollection(ctx, option)
```

**PARAMETERS:**

- **oldName** (*string*)

    The old name.

- **newName** (*string*)

    The new name for the collection.

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

err = cli.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
	// handle error
}
```

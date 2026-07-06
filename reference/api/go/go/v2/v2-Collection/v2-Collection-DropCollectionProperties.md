---
title: "DropCollectionProperties() | Go | v2"
slug: /go/go/v2-Collection-DropCollectionProperties
sidebar_label: "DropCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes specified properties from a collection. | Go | v2"
type: docx
token: Zyf1dXoBIo83V2xWHiKcXUEAnMc
sidebar_position: 14
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionProperties()

This operation removes specified properties from a collection.

```go
func (c *Client) DropCollectionProperties(ctx context.Context, option DropCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDropCollectionPropertiesOption(collection, propertyKeys)

err := client.DropCollectionProperties(ctx, option)
```

**PARAMETERS:**

- **[collection](./v2-Collection)** (*string*)

    The collection.

- **propertyKeys** (*...string*)

    The property keys.

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
	"github.com/milvus-io/milvus/pkg/v2/common"
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

err = cli.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
	// handle error
}
```

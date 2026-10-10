---
title: "DropIndexProperties | Go | v2"
slug: /go/go/v2-Management-DropIndexProperties
sidebar_label: "DropIndexProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes one or more properties from an existing index. | Go | v2"
type: docx
token: DdDQdWN3OoSwZbxFTebctTRFnZf
sidebar_position: 8
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - DropIndexProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties

This operation removes one or more properties from an existing index.

```go
func (c *Client) DropIndexProperties(ctx context.Context, opt DropIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for DropIndexProperties().

```go
option := milvusclient.NewDropIndexPropertiesOption(collectionName, indexName, keys...)

err := client.DropIndexProperties(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **indexName** (*string*) -

    **[REQUIRED]**

    The name of the index.

- **keys** (*...string*) -

    **[REQUIRED]**

    The keys for DropIndexProperties.

**BUILDER METHODS:**

- `NewDropIndexPropertiesOption(collectionName string, indexName string, keys ...string)`

    Creates options to drop index properties. `collectionName` specifies the collection, `indexName` specifies the index, and `keys` lists the property keys to remove.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the index properties are dropped. Returns an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Request construction or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DropIndexProperties() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.DropIndexProperties(ctx, milvusclient.NewDropIndexPropertiesOption("books", "vector_index", "mmap.enabled"))
if err != nil {
	// handle error
}
```

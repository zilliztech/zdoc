---
title: "AlterIndexProperties | Go | v2"
slug: /go/go/v2-Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation modifies properties of an existing index. | Go | v2"
type: docx
token: KAfCd9KE6oD9XmxgntMcfFNTn0c
sidebar_position: 1
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - AlterIndexProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties

This operation modifies properties of an existing index.

```go
func (c *Client) AlterIndexProperties(ctx context.Context, opt AlterIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AlterIndexProperties().

```go
option := milvusclient.NewAlterIndexPropertiesOption(collectionName, indexName).
    WithProperty(key, value)

err := client.AlterIndexProperties(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **indexName** (*string*) -

    **[REQUIRED]**

    The name of the index.

**BUILDER METHODS:**

- `NewAlterIndexPropertiesOption(collectionName string, indexName string)`

    Creates the request for AlterIndexProperties().

- `WithProperty(key string, value any)`

    Sets a custom property key-value pair on the resource.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AlterIndexProperties() usage.

```go
import (
	"context"

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
defer cli.Close(ctx)

err = cli.AlterIndexProperties(ctx, milvusclient.NewAlterIndexPropertiesOption("my_collection", "my_index").
	WithProperty("mmap.enabled", true))
if err != nil {
	// handle err
}
```

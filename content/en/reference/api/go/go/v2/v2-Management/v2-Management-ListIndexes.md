---
title: "ListIndexes() | Go | v2"
slug: /go/go/v2-Management-ListIndexes
sidebar_label: "ListIndexes()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all indexes built on a specified collection. | Go | v2"
type: docx
token: S8NxdJc1gom2SVxxNYkc5lHxnMg
sidebar_position: 17
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - ListIndexes()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListIndexes()

This operation lists all indexes built on a specified collection.

```go
func (c *Client) ListIndexes(ctx context.Context, opt ListIndexOption, callOptions ...grpc.CallOption) ([]string, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewListIndexOption(collectionName).
    WithFieldName(fieldName)

result, err := client.ListIndexes(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    The name of the target collection.

**OPTION METHODS:**

- `WithFieldName(fieldName string)`

    Sets the field name for the operation.

**RETURN TYPE:**

*[]string, error*

**RETURNS:**

A list of names. Returns an error if the operation fails.

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

indexes, err := cli.ListIndexes(ctx, milvusclient.NewListIndexOption("my_collection").WithFieldName("my_vector"))
if err != nil {
	// handle err
}
fmt.Println(indexes)
```

---
title: "ListDatabase | Go | v2"
slug: /go/go/v2-Database-ListDatabase
sidebar_label: "ListDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all databases in the Milvus instance. | Go | v2"
type: docx
token: A0bMdNQyvon0rhxJIQpcHbPPn3f
sidebar_position: 7
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - ListDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListDatabase

This operation lists all databases in the Milvus instance.

```go
func (c *Client) ListDatabase(ctx context.Context, option ListDatabaseOption, callOptions ...grpc.CallOption) (databaseNames []string, err error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListDatabase().

```go
option := milvusclient.NewListDatabaseOption()

dbs, err := client.ListDatabase(ctx, option)
```

**BUILDER METHODS:**

- `NewListDatabaseOption()`

    Creates the request for ListDatabase().

**RETURN TYPE:**

*databaseNames []string, err error*

**RETURNS:**

A list of names. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*databaseNames []string*) -

    The databaseNames []string value returned by ListDatabase().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ListDatabase() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle err
}
defer cli.Close(ctx)

dbs, err := cli.ListDatabase(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
	// handle err
}
fmt.Println(dbs)
```

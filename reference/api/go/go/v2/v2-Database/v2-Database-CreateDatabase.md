---
title: "CreateDatabase() | Go | v2"
slug: /go/go/v2-Database-CreateDatabase
sidebar_label: "CreateDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a new database. | Go | v2"
type: docx
token: BMlVd8UFLor42pxDtr3cnobPnxe
sidebar_position: 2
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - CreateDatabase()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateDatabase()

This operation creates a new database.

```go
func (c *Client) CreateDatabase(ctx context.Context, option CreateDatabaseOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewCreateDatabaseOption(dbName).
    WithProperty(key, val)

err := client.CreateDatabase(ctx, option)
```

**PARAMETERS:**

- **dbName** (*string*)

    The name of the database.

**OPTION METHODS:**

- `WithProperty(key string, val any)`

    Sets a custom property key-value pair on the resource.

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

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

dbName := `test_db`
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

err = cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption(dbName))
if err != nil {
	// handle err
}
```

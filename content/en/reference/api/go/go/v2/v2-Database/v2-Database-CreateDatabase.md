---
title: "CreateDatabase | Go | v2"
slug: /go/go/v2-Database-CreateDatabase
sidebar_label: "CreateDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a new database with the specified name and optional properties. | Go | v2"
type: docx
token: KgMSdCS28oPhbWx38NLcrXKanCd
sidebar_position: 2
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - CreateDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateDatabase

This operation creates a new database with the specified name and optional properties.

```go
func (c *Client) CreateDatabase(ctx context.Context, option CreateDatabaseOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for CreateDatabase().

```go
option := milvusclient.NewCreateDatabaseOption(dbName).
    WithProperty(key, value)

err := client.CreateDatabase(ctx, option)
```

**PARAMETERS:**

- **dbName** (*string*) -

    **[REQUIRED]**

    The name of the database.

**BUILDER METHODS:**

- `NewCreateDatabaseOption(dbName string)`

    Creates options to create a database. `dbName` specifies the name of the database to create.

- `WithProperty(key string, value any)`

    Sets a database property key-value pair after converting the value to its string representation.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the database is created. Returns an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Request construction or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates CreateDatabase() usage.

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

err = cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("test_db").
	WithProperty("database.replica.number", "3"))
if err != nil {
	// handle error
}
```

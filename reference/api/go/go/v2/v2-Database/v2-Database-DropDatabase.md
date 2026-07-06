---
title: "DropDatabase() | Go | v2"
slug: /go/go/v2-Database-DropDatabase
sidebar_label: "DropDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a database and all its collections permanently. | Go | v2"
type: docx
token: FfZ6dqEk2o9Cn3xFAgTckLhsnS6
sidebar_position: 5
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabase()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabase()

This operation drops a database and all its collections permanently.

```go
func (c *Client) DropDatabase(ctx context.Context, option DropDatabaseOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewDropDatabaseOption(dbName)

err := client.DropDatabase(ctx, option)
```

**PARAMETERS:**

- **dbName** (*string*)

    The name of the database.

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

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle err
}
defer cli.Close(ctx)

err = cli.DropDatabase(ctx, milvusclient.NewDropDatabaseOption("test_db"))
if err != nil {
	// handle err
}
```

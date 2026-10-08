---
title: "UseDatabase | Go | v2"
slug: /go/go/v2-Database-UseDatabase
sidebar_label: "UseDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation switches the active database for the current client connection. | Go | v2"
type: docx
token: EwKhdwcBuoINVbxxLopcubz7nxa
sidebar_position: 8
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - UseDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UseDatabase

This operation switches the active database for the current client connection.

```go
func (c *Client) UseDatabase(ctx context.Context, option UseDatabaseOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for UseDatabase().

```go
option := milvusclient.NewUseDatabaseOption("my_database")

 := client.UseDatabase(ctx, option)
```

**BUILDER METHODS:**

- `NewUseDatabaseOption(dbName string)`

    Creates the request for UseDatabase().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates UseDatabase() usage.

```go
import (
	"context"

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

err = cli.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database"))
if err != nil {
	// handle err
}
```

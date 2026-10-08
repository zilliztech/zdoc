---
title: "AlterDatabaseProperties | Go | v2"
slug: /go/go/v2-Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation modifies the properties of an existing database. | Go | v2"
type: docx
token: P66AdsWbooIL47xykGkcsI5ZnAg
sidebar_position: 1
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - AlterDatabaseProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties

This operation modifies the properties of an existing database.

```go
func (c *Client) AlterDatabaseProperties(ctx context.Context, option AlterDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AlterDatabaseProperties().

```go
option := milvusclient.NewAlterDatabasePropertiesOption(dbName).
    WithProperty(key, value)

err := client.AlterDatabaseProperties(ctx, option)
```

**PARAMETERS:**

- **dbName** (*string*) -

    **[REQUIRED]**

    The name of the database.

**BUILDER METHODS:**

- `NewAlterDatabasePropertiesOption(dbName string)`

    Creates options to alter database properties. `dbName` specifies the database whose properties are altered.

- `WithProperty(key string, value any)`

    Sets a database property key-value pair after converting the value to its string representation.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil after the database properties are altered. Returns an error if the operation fails.

**ERROR HANDLING:**

- **error**

    The operation fails. Request construction or the RPC fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AlterDatabaseProperties() usage.

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

err = cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("test_db").
	WithProperty("database.replica.number", "2"))
if err != nil {
	// handle error
}
```

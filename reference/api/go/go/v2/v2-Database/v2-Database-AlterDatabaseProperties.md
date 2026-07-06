---
title: "AlterDatabaseProperties() | Go | v2"
slug: /go/go/v2-Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies properties of an existing database. | Go | v2"
type: docx
token: TxGQdsN2noPbRixebWycWSe0nYt
sidebar_position: 1
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - AlterDatabaseProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties()

This operation modifies properties of an existing database.

```go
func (c *Client) AlterDatabaseProperties(ctx context.Context, option AlterDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewAlterDatabasePropertiesOption(dbName).
    WithProperty(key, value)

err := client.AlterDatabaseProperties(ctx, option)
```

**PARAMETERS:**

- **dbName** (*string*)

    The name of the database.

**OPTION METHODS:**

- `WithProperty(key string, value any)`

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
	"github.com/milvus-io/milvus/pkg/v2/common"
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

err = cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("my_database").
	WithProperty(common.DatabaseReplicaNumber, 2))
if err != nil {
	// handle err
}
```

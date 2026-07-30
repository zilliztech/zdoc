---
title: "ListDatabase() | Go | v2"
slug: /go/go/v2-Database-ListDatabase
sidebar_label: "ListDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all databases in the Milvus instance. | Go | v2"
type: docx
token: SV1KdmQUCoLh3nxArLzc9v6In1e
sidebar_position: 7
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - ListDatabase()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListDatabase()

This operation lists all databases in the Milvus instance.

```go
func (c *Client) ListDatabase(ctx context.Context, option ListDatabaseOption, callOptions ...grpc.CallOption) (databaseNames []string, err error)
```

**RETURN TYPE:**

*databaseNames []string, err error*

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

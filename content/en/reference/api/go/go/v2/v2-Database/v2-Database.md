---
title: "Database | Go | v2"
slug: /go/go/v2-Database
sidebar_label: "Database"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Database instance represents a database and its properties, returned by DescribeDatabase. | Go | v2"
type: docx
token: YXVpdEBCWo4vpexKgwCcRbClnFc
sidebar_position: 3
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - Database
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Database

A Database instance represents a database and its properties, returned by DescribeDatabase.

```go
type Database struct {
    Name string
    Properties map[string]string
}
```

**FIELDS:**

- **Name** (*string*) -

    The name of the database.

- **Properties** (*map[string]string*) -

    The properties of the database.

## Example\{#example}

Demonstrates Database usage.

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
	// handle error
}
defer cli.Close(ctx)

databases, err := cli.ListDatabases(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
	// handle error
}
for _, db := range databases {
	fmt.Println(db.Name)
}
```

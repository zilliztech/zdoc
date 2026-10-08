---
title: "DescribeDatabase | Go | v2"
slug: /go/go/v2-Database-DescribeDatabase
sidebar_label: "DescribeDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns detailed information about a database, including its properties. | Go | v2"
type: docx
token: TA9gd2U0moA7oPx2x9Ocsq8dnud
sidebar_position: 4
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeDatabase

This operation returns detailed information about a database, including its properties.

```go
func (c *Client) DescribeDatabase(ctx context.Context, option DescribeDatabaseOption, callOptions ...grpc.CallOption) (*entity.Database, error)
```

## Request Syntax\{#request-syntax}

Creates the request for DescribeDatabase().

```go
option := milvusclient.NewDescribeDatabaseOption(dbName)

result, err := client.DescribeDatabase(ctx, option)
```

**PARAMETERS:**

- **dbName** (*string*) -

    **[REQUIRED]**

    The name of the database.

**BUILDER METHODS:**

- `NewDescribeDatabaseOption(dbName string)`

    Creates the request for DescribeDatabase().

**RETURN TYPE:**

&ast;*entity.Database, error*

**RETURNS:**

The database description including properties. Returns an error if the operation fails.

```go
type Database struct {
    Name       string
    Properties map[string]string
}
```

**PARAMETERS:**

- **Name** (*string*) -

    The name of the database.

- **Properties** (*map[string]string*) -

    The properties of the database.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DescribeDatabase() usage.

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

db, err := cli.DescribeDatabase(ctx, milvusclient.NewDescribeDatabaseOption(dbName))
if err != nil {
	// handle err
}
log.Println(db)
```

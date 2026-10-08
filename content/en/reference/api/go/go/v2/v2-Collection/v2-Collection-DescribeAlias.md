---
title: "DescribeAlias | Go | v2"
slug: /go/go/v2-Collection-DescribeAlias
sidebar_label: "DescribeAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns detailed information about an alias, including the collection it points to. | Go | v2"
type: docx
token: VTjPdvA5XopoUCxDDOLcjpkpnXd
sidebar_position: 10
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeAlias

This operation returns detailed information about an alias, including the collection it points to.

```go
func (c *Client) DescribeAlias(ctx context.Context, option DescribeAliasOption, callOptions ...grpc.CallOption) (*entity.Alias, error)
```

## Request Syntax\{#request-syntax}

Creates the request for DescribeAlias().

```go
option := milvusclient.NewDescribeAliasOption(alias)

result, err := client.DescribeAlias(ctx, option)
```

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    The alias for DescribeAlias.

**BUILDER METHODS:**

- `NewDescribeAliasOption(alias string)`

    Creates options to describe an alias. `alias` specifies the alias name.

**RETURN TYPE:**

&ast;*entity.Alias, error*

**RETURNS:**

The alias description including the alias name, the target collection, and the database name. Returns an error if the operation fails.

```go
type Alias struct {
    DbName string
    Alias string
    CollectionName string
}
```

**PARAMETERS:**

- **DbName** (*string*) -

    The name of the associated database.

- **Alias** (*string*) -

    The alias name.

- **CollectionName** (*string*) -

    The name of the associated collection.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates DescribeAlias() usage.

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

alias, err := cli.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("books_alias"))
if err != nil {
	// handle error
}
log.Println(alias)
```

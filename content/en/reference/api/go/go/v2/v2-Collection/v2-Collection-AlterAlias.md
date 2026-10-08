---
title: "AlterAlias | Go | v2"
slug: /go/go/v2-Collection-AlterAlias
sidebar_label: "AlterAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation reassigns an existing alias to a different collection. | Go | v2"
type: docx
token: NOBpdRuf2oSRrJxZSYMcOLEcnAE
sidebar_position: 3
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - AlterAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterAlias

This operation reassigns an existing alias to a different collection.

```go
func (c *Client) AlterAlias(ctx context.Context, option AlterAliasOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for AlterAlias().

```go
option := milvusclient.NewAlterAliasOption(alias, collectionName)

err := client.AlterAlias(ctx, option)
```

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    The alias name to assign.

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewAlterAliasOption(alias string, collectionName string)`

    Creates the request for AlterAlias().

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates AlterAlias() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

err = cli.AlterAlias(ctx, milvusclient.NewAlterAliasOption("alice", "customized_setup_1"))
if err != nil {
	// handle error
}

aliases, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_1"))
if err != nil {
	// handle error
}
fmt.Println(aliases)

aliases, err = cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_2"))
if err != nil {
	// handle error
}
fmt.Println(aliases)
```

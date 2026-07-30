---
title: "AlterAlias() | Go | v2"
slug: /go/go/v2-Collection-AlterAlias
sidebar_label: "AlterAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation reassigns an existing alias to a different collection. | Go | v2"
type: docx
token: GNQcdBgh2oMyS9xxJk0cvESGnfe
sidebar_position: 3
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - AlterAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterAlias()

This operation reassigns an existing alias to a different collection.

```go
func (c *Client) AlterAlias(ctx context.Context, option AlterAliasOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewAlterAliasOption(alias, collectionName)

err := client.AlterAlias(ctx, option)
```

**PARAMETERS:**

- **[alias](./v2-Collection-Alias)** (*string*)

    The alias name to assign.

- **collectionName** (*string*)

    The name of the target collection.

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
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

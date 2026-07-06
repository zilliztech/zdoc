---
title: "CreateAlias() | Go | v2"
slug: /go/go/v2-Collection-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an alias for a collection, allowing you to reference it by an alternative name. | Go | v2"
type: docx
token: HbsGdw2PboyE0Yxcp8IcaG4Qnmg
sidebar_position: 8
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - CreateAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateAlias()

This operation creates an alias for a collection, allowing you to reference it by an alternative name.

```go
func (c *Client) CreateAlias(ctx context.Context, option CreateAliasOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewCreateAliasOption(collectionName, alias)

err := client.CreateAlias(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*)

    The name of the target collection.

- **[alias](./v2-Collection-Alias)** (*string*)

    The alias name to assign.

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

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "bob"))
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "alice"))
if err != nil {
	// handle error
}
```

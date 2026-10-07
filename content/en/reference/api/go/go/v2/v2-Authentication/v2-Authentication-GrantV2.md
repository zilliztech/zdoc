---
title: "GrantV2 | Go | v2"
slug: /go/go/v2-Authentication-GrantV2
sidebar_label: "GrantV2"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a privilege to a role using the v2 API. | Go | v2"
type: docx
token: UK3BdNpHNorHQPx0R2bcxyiQnTd
sidebar_position: 28
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GrantV2
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantV2

This operation grants a privilege to a role using the v2 API.

<Admonition type="info" title="Notes">

This interface is deprecated, use GrantPrivilegeV2() instead.

</Admonition>

```go
func (c *Client) GrantV2(ctx context.Context, option GrantV2Option, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for GrantV2().

```go
option := milvusclient.NewGrantV2Option(roleName, privilegeName, dbName, collectionName).
    WithDbName(dbName)

err := client.GrantV2(ctx, option)
```

**PARAMETERS:**

- **roleName** (*string*) -

    The name of the role.

- **privilegeName** (*string*) -

    The name of the privilege.

- **dbName** (*string*) -

    The name of the database.

- **collectionName** (*string*) -

    The name of the target collection.

**BUILDER METHODS:**

- `NewGrantV2Option(roleName string, privilegeName string, dbName string, collectionName string)`

    Creates a new option to grant a privilege using the v2 API. Deprecated, use `NewGrantPrivilegeV2Option` instead.

- `WithDbName(dbName string)`

    Specifies the database to use for the operation.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GrantV2() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

err = cli.GrantV2(ctx, milvusclient.NewGrantV2Option("my_role", "Search", "default", "quick_setup"))
if err != nil {
	// handle error
}
```

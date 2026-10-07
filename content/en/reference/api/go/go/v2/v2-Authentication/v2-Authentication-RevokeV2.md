---
title: "RevokeV2 | Go | v2"
slug: /go/go/v2-Authentication-RevokeV2
sidebar_label: "RevokeV2"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation revokes a privilege from a role using the v2 API. | Go | v2"
type: docx
token: NylxdfK4NoqbPPxPsZ4cOF14n1f
sidebar_position: 30
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - RevokeV2
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokeV2

This operation revokes a privilege from a role using the v2 API.

<Admonition type="info" title="Notes">

This interface is deprecated, use RevokePrivilegeV2() instead.

</Admonition>

```go
func (c *Client) RevokeV2(ctx context.Context, option RevokeV2Option, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for RevokeV2().

```go
option := milvusclient.NewRevokeV2Option(roleName, privilegeName, dbName, collectionName).
    WithDbName(dbName)

err := client.RevokeV2(ctx, option)
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

- `NewRevokeV2Option(roleName string, privilegeName string, dbName string, collectionName string)`

    Creates a new option to revoke a privilege using the v2 API. Deprecated, use `NewRevokePrivilegeV2Option` instead.

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

Demonstrates RevokeV2() usage.

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

err = cli.RevokeV2(ctx, milvusclient.NewRevokeV2Option("my_role", "Search", "default", "quick_setup"))
if err != nil {
	// handle error
}
```

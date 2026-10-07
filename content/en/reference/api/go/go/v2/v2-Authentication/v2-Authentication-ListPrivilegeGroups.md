---
title: "ListPrivilegeGroups | Go | v2"
slug: /go/go/v2-Authentication-ListPrivilegeGroups
sidebar_label: "ListPrivilegeGroups"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all privilege groups and their included privileges. | Go | v2"
type: docx
token: XbybdCKjgoveJExG4SDcpBjenkg
sidebar_position: 14
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - ListPrivilegeGroups
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListPrivilegeGroups

This operation lists all privilege groups and their included privileges.

```go
func (c *Client) ListPrivilegeGroups(ctx context.Context, option ListPrivilegeGroupsOption, callOptions ...grpc.CallOption) ([]*entity.PrivilegeGroup, error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListPrivilegeGroups().

```go
option := milvusclient.NewListPrivilegeGroupsOption()

groups, err := client.ListPrivilegeGroups(ctx, option)
```

**BUILDER METHODS:**

- `NewListPrivilegeGroupsOption()`

    Creates the request for ListPrivilegeGroups().

**RETURN TYPE:**

<em>[]</em>entity.PrivilegeGroup, error&ast;

**RETURNS:**

A list of privilege groups with their included privileges. Returns an error if the operation fails.

```go
type PrivilegeGroup struct {
    GroupName string
    Privileges []string
}
```

**PARAMETERS:**

- **GroupName** (*string*) -

    The name of the privilege group.

- **Privileges** (*[]string*) -

    The list of granted privileges.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates ListPrivilegeGroups() usage.

```go
import (
	"context"
	"fmt"

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

groups, err := cli.ListPrivilegeGroups(ctx, milvusclient.NewListPrivilegeGroupsOption())
if err != nil {
	// handle error
}
fmt.Println(groups)
```

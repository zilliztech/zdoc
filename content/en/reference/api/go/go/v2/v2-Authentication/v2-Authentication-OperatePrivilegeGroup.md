---
title: "OperatePrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-OperatePrivilegeGroup
sidebar_label: "OperatePrivilegeGroup"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds or removes privileges from a privilege group using the low-level v2 API. | Go | v2"
type: docx
token: GCIadDUe1o31qKx66HCcLL3FnPf
sidebar_position: 29
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - OperatePrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# OperatePrivilegeGroup

This operation adds or removes privileges from a privilege group using the low-level v2 API.

<Admonition type="info" title="Notes">

This interface is deprecated, use AddPrivilegesToGroup() or RemovePrivilegesFromGroup() instead.

</Admonition>

```go
func (c *Client) OperatePrivilegeGroup(ctx context.Context, option OperatePrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for OperatePrivilegeGroup().

```go
option := milvusclient.NewOperatePrivilegeGroupOption(groupName, privileges, operateType)

err := client.OperatePrivilegeGroup(ctx, option)
```

**PARAMETERS:**

- **groupName** (*string*) -

    **[REQUIRED]**

    The name of the privilege group.

- **privileges** (<em>[]</em>milvuspb.PrivilegeEntity&ast;) -

    **[REQUIRED]**

    The privileges to add to or remove from the group.

- **operateType** (*milvuspb.OperatePrivilegeGroupType*) -

    **[REQUIRED]**

    The operation to perform: add or remove the specified privileges.

**BUILDER METHODS:**

- `NewOperatePrivilegeGroupOption(groupName string, privileges []*milvuspb.PrivilegeEntity, operateType milvuspb.OperatePrivilegeGroupType)`

    Creates a new option to add or remove privileges from a privilege group. Deprecated, use `NewAddPrivilegesToGroupOption` or `NewRemovePrivilegesFromGroupOption` instead.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates OperatePrivilegeGroup() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus-proto/go-api/v3/milvuspb"
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

privileges := []*milvuspb.PrivilegeEntity{
	{Name: "Search"},
}

err = cli.OperatePrivilegeGroup(ctx, milvusclient.NewOperatePrivilegeGroupOption("my_priv_group", privileges, milvuspb.OperatePrivilegeGroupType_AddPrivilegesToGroup))
if err != nil {
	// handle error
}
```

---
title: "BackupRBAC | Go | v2"
slug: /go/go/v2-Authentication-BackupRBAC
sidebar_label: "BackupRBAC"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a full backup of RBAC metadata, including users, roles, grants, and privilege groups. | Go | v2"
type: docx
token: IXV9dcjNHoDBgXx5jJucsAbYnPd
sidebar_position: 2
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - BackupRBAC
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BackupRBAC

This operation creates a full backup of RBAC metadata, including users, roles, grants, and privilege groups.

```go
func (c *Client) BackupRBAC(ctx context.Context, option BackupRBACOption, callOptions ...grpc.CallOption) (*entity.RBACMeta, error)
```

## Request Syntax\{#request-syntax}

Creates the request for BackupRBAC().

```go
option := milvusclient.NewBackupRBACOption()

backup, err := client.BackupRBAC(ctx, option)
```

**BUILDER METHODS:**

- `NewBackupRBACOption()`

    Creates the request for BackupRBAC().

**RETURN TYPE:**

&ast;*entity.RBACMeta, error*

**RETURNS:**

The full RBAC metadata snapshot including users, roles, grants, and privilege groups. Returns an error if the operation fails.

```go
type RBACMeta struct {
    Users []*UserInfo
    Roles []*Role
    RoleGrants []*RoleGrants
    PrivilegeGroups []*PrivilegeGroup
}
```

**PARAMETERS:**

- **Users** (<em>[]</em>UserInfo&ast;) -

    The users.

- **Roles** (<em>[]</em>Role&ast;) -

    The list of assigned roles.

- **RoleGrants** (<em>[]</em>RoleGrants&ast;) -

    The role grants.

- **PrivilegeGroups** (<em>[]</em>PrivilegeGroup&ast;) -

    The privilege groups.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates BackupRBAC() usage.

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

backup, err := cli.BackupRBAC(ctx, milvusclient.NewBackupRBACOption())
if err != nil {
	// handle error
}
fmt.Println(backup)
```

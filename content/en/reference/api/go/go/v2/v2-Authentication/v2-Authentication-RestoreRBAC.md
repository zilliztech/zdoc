---
title: "RestoreRBAC | Go | v2"
slug: /go/go/v2-Authentication-RestoreRBAC
sidebar_label: "RestoreRBAC"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation restores a full backup of RBAC metadata, including users, roles, grants, and privilege groups, previously captured with `BackupRBAC()`. | Go | v2"
type: docx
token: UcL8dziUMoCFrDxhMu3ccOJMnUb
sidebar_position: 20
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreRBAC
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreRBAC

This operation restores a full backup of RBAC metadata, including users, roles, grants, and privilege groups, previously captured with `BackupRBAC()`.

```go
func (c *Client) RestoreRBAC(ctx context.Context, option RestoreRBACOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

Creates the request for RestoreRBAC().

```go
option := milvusclient.NewRestoreRBACOption(meta)

err := client.RestoreRBAC(ctx, option)
```

**PARAMETERS:**

- **meta** (*entity.RBACMeta*) -

    The RBAC metadata to restore, typically the snapshot returned by `BackupRBAC()`.

**BUILDER METHODS:**

- `NewRestoreRBACOption(meta *entity.RBACMeta)`

    Creates a new option with the RBAC metadata to restore.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates RestoreRBAC() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
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

backup, err := cli.BackupRBAC(ctx, milvusclient.NewBackupRBACOption())
if err != nil {
	// handle error
}

meta := &entity.RBACMeta{
	Users:           backup.Users,
	Roles:           backup.Roles,
	RoleGrants:      backup.RoleGrants,
	PrivilegeGroups: backup.PrivilegeGroups,
}

err = cli.RestoreRBAC(ctx, milvusclient.NewRestoreRBACOption(meta))
if err != nil {
	// handle error
}
```

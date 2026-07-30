---
title: "BackupRBAC() | Go | v2"
slug: /go/go/v2-Authentication-BackupRBAC
sidebar_label: "BackupRBAC()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a full backup of RBAC metadata, including users, roles, grants, and privilege groups. | Go | v2"
type: docx
token: Iz1ZdJDWVo0uoUxQjlPcIbS2nMo
sidebar_position: 2
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - BackupRBAC()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BackupRBAC()

This operation creates a full backup of RBAC metadata, including users, roles, grants, and privilege groups.

```go
func (c *Client) BackupRBAC(ctx context.Context, option BackupRBACOption, callOptions ...grpc.CallOption) (*entity.RBACMeta, error)
```

**RETURN TYPE:**

**[entity.RBACMeta](./v2-Authentication-RBACMeta), error*

**RETURNS:**

The full RBAC metadata snapshot including users, roles, grants, and privilege groups. Returns an error if the operation fails.

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

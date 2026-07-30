---
title: "RestoreRBAC() | Go | v2"
slug: /go/go/v2-Authentication-RestoreRBAC
sidebar_label: "RestoreRBAC()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation restores RBAC metadata from a previously created backup. | Go | v2"
type: docx
token: YYvkdK6o5ovGGsxVyEtcEGXnn6b
sidebar_position: 20
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreRBAC()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreRBAC()

This operation restores RBAC metadata from a previously created backup.

```go
func (c *Client) RestoreRBAC(ctx context.Context, option RestoreRBACOption, callOptions ...grpc.CallOption) error
```

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

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

// First back up the RBAC metadata
backup, err := cli.BackupRBAC(ctx, milvusclient.NewBackupRBACOption())
if err != nil {
	// handle error
}

// Restore the RBAC metadata from backup
err = cli.RestoreRBAC(ctx, milvusclient.NewRestoreRBACOption(backup))
if err != nil {
	// handle error
}
```

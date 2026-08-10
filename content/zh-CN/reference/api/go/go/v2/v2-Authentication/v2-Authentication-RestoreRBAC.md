---
title: "RestoreRBAC() | Go | v2"
slug: /go/go/v2-Authentication-RestoreRBAC
sidebar_label: "RestoreRBAC()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从先前创建的备份中恢复 RBAC 元数据。 | Go | v2"
type: docx
token: YYvkdK6o5ovGGsxVyEtcEGXnn6b
sidebar_position: 20
keywords: 
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - Annoy 向量搜索
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

此操作从先前创建的备份中恢复 RBAC 元数据。

```go
func (c *Client) RestoreRBAC(ctx context.Context, option RestoreRBACOption, callOptions ...grpc.CallOption) error
```

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    有关失败详情，请查看 `err != nil`。

## 示例\{#example}

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

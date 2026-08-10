---
title: "BackupRBAC() | Go | v2"
slug: /go/go/v2-Authentication-BackupRBAC
sidebar_label: "BackupRBAC()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会对 RBAC 元数据创建完整备份，包括用户、角色、授权和权限组。 | Go | v2"
type: docx
token: Iz1ZdJDWVo0uoUxQjlPcIbS2nMo
sidebar_position: 2
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
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

此操作会对 RBAC 元数据创建完整备份，包括用户、角色、授权和权限组。

```go
func (c *Client) BackupRBAC(ctx context.Context, option BackupRBACOption, callOptions ...grpc.CallOption) (*entity.RBACMeta, error)
```

**返回类型：**

**[entity.RBACMeta](./v2-Authentication-RBACMeta), error*

**返回：**

返回完整的 RBAC 元数据快照，包括用户、角色、授权和权限组。如果操作失败，则返回错误。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

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

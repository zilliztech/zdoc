---
title: "RestoreRBAC | Go | v2"
slug: /go/go/v2-Authentication-RestoreRBAC
sidebar_label: "RestoreRBAC"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会恢复 RBAC 元数据的完整备份，包括用户、角色、授权和权限组，这些元数据先前由 `BackupRBAC()` 捕获。 | Go | v2"
type: docx
token: UcL8dziUMoCFrDxhMu3ccOJMnUb
sidebar_position: 20
keywords: 
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - RestoreRBAC
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreRBAC

此操作会恢复 RBAC 元数据的完整备份，包括用户、角色、授权和权限组，这些元数据先前由 `BackupRBAC()` 捕获。

```go
func (c *Client) RestoreRBAC(ctx context.Context, option RestoreRBACOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 RestoreRBAC() 的请求。

```go
option := milvusclient.NewRestoreRBACOption(meta)

err := client.RestoreRBAC(ctx, option)
```

**参数：**

- **meta** (*Entity.RBACMeta*) -

    要恢复的 RBAC 元数据，通常是由 `BackupRBAC()` 返回的快照。

**构建器方法：**

- `NewRestoreRBACOption(meta *entity.RBACMeta)`

    使用要恢复的 RBAC 元数据创建一个新选项。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RestoreRBAC() 的用法。

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

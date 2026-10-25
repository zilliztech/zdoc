---
title: "BackupRBAC | Go | v2"
slug: /go/go/v2-Authentication-BackupRBAC
sidebar_label: "BackupRBAC"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建 RBAC 元数据的完整备份，包括用户、角色、授权和权限组。 | Go | v2"
type: docx
token: IXV9dcjNHoDBgXx5jJucsAbYnPd
sidebar_position: 2
keywords: 
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - 异常检测
  - Zilliz
  - Zilliz Cloud
  - 云
  - BackupRBAC
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# BackupRBAC

此操作会创建 RBAC 元数据的完整备份，包括用户、角色、授权和权限组。

```go
func (c *Client) BackupRBAC(ctx context.Context, option BackupRBACOption, callOptions ...grpc.CallOption) (*entity.RBACMeta, error)
```

## 请求语法\{#request-syntax}

创建 BackupRBAC() 的请求。

```go
option := milvusclient.NewBackupRBACOption()

backup, err := client.BackupRBAC(ctx, option)
```

**构建器方法：**

- `NewBackupRBACOption()`

    创建 BackupRBAC() 的请求。

**返回类型：**

&ast;*Entity.RBACMeta, error*

**返回值：**

完整 RBAC 元数据快照，包括用户、角色、授权和权限组。如果操作失败，则返回错误。

```go
type RBACMeta struct {
    Users []*UserInfo
    Roles []*Role
    RoleGrants []*RoleGrants
    PrivilegeGroups []*PrivilegeGroup
}
```

**参数：**

- **Users**（<em>[]</em>UserInfo&ast;） -

    用户。

- **Roles**（<em>[]</em>Role&ast;） -

    已分配角色的列表。

- **RoleGrants**（<em>[]</em>RoleGrants&ast;） -

    角色授权。

- **PrivilegeGroups**（<em>[]</em>PrivilegeGroup&ast;） -

    权限组。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 BackupRBAC() 的用法。

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

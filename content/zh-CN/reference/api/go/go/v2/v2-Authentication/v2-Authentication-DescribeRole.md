---
title: "DescribeRole | Go | v2"
slug: /go/go/v2-Authentication-DescribeRole
sidebar_label: "DescribeRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回角色的详细信息，包括其说明和权限。 | Go | v2"
type: docx
token: TfY6dRxjhoz0hexPK8xchxQ4nsh
sidebar_position: 6
keywords: 
  - LLM 评估
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - Zilliz
  - Zilliz Cloud
  - 云
  - DescribeRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeRole

此操作返回角色的详细信息，包括其说明和权限。

```go
func (c *Client) DescribeRole(ctx context.Context, option DescribeRoleOption, callOptions ...grpc.CallOption) (*entity.Role, error)
```

## 请求语法\{#request-syntax}

创建 DescribeRole() 的请求。

```go
option := milvusclient.NewDescribeRoleOption(roleName).
    WithDbName(dbName)

result, err := client.DescribeRole(ctx, option)
```

**参数：**

- **roleName** （*string*） -

    **[必需]**

    用于描述角色的选项。请使用 `NewDescribeRoleOption` 进行构建。

**构建器方法：**

- `NewDescribeRoleOption(roleName string)`

    创建用于描述角色的选项。`roleName` 指定要描述的角色。

- `WithDbName(dbName string)`

    指定此操作要使用的 Database。

**返回类型：**

&ast;*Entity.Role, error*

**返回：**

角色说明，包括角色名称、说明和权限。如果未找到角色或操作失败，则返回错误。

```go
type Role struct {
    RoleName string
    Privileges []GrantItem
}
```

**参数：**

- **RoleName** （*string*） -

    角色的名称。

- **Privileges** （*[]GrantItem*） -

    已授予权限的列表。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DescribeRole() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

role, err := cli.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("my_role"))
if err != nil {
	// handle error
}
log.Println(role)
```

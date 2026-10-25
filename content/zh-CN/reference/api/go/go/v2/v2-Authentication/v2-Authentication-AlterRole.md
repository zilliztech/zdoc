---
title: "AlterRole | Go | v2"
slug: /go/go/v2-Authentication-AlterRole
sidebar_label: "AlterRole"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会修改现有角色的描述。 | Go | v2"
type: docx
token: HvS9dO1v7ofQuhx49Q3ceroCnmI
sidebar_position: 27
keywords: 
  - NLP
  - 神经网络
  - 深度学习
  - 知识库
  - zilliz
  - zilliz cloud
  - 云
  - AlterRole
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AlterRole

此操作会修改现有角色的描述。

```go
func (c *Client) AlterRole(ctx context.Context, opt AlterRoleOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 AlterRole() 创建请求。

```go
option := milvusclient.NewAlterRoleOption(roleName).
    WithDescription(description)

err := client.AlterRole(ctx, option)
```

**参数：**

- **roleName** (*string*) -

    **[必需]**

    用于修改角色的选项。使用 `NewAlterRoleOption` 构建。

**构建器方法：**

- `NewAlterRoleOption(roleName string)`

    创建用于修改角色的选项。`roleName` 指定要修改的角色。

- `WithDescription(description string)`

    设置角色的描述。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回一个说明出错原因的错误。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 AlterRole() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.AlterRole(ctx, milvusclient.NewAlterRoleOption("my_role").
	WithDescription("read only role"))
if err != nil {
	// handle error
}
```

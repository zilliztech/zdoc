---
title: "CreateRole | Go | v2"
slug: /go/go/v2-Authentication-CreateRole
sidebar_label: "CreateRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作为访问控制创建一个新角色。 | Go | v2"
type: docx
token: P8PRdHt2soM6rfxHbJacm4iWnYf
sidebar_position: 4
keywords: 
  - 信息检索
  - 降维
  - hnsw 算法
  - 向量相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreateRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateRole

此操作为访问控制创建一个新角色。

```go
func (c *Client) CreateRole(ctx context.Context, opt CreateRoleOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 CreateRole() 的请求。

```go
option := milvusclient.NewCreateRoleOption(roleName)

err := client.CreateRole(ctx, option)
```

**参数：**

- **roleName** （*string*） -

    **[必需]**

    角色的名称。

**构建器方法：**

- `NewCreateRoleOption(roleName)`

    创建 CreateRole() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 CreateRole() 的用法。

```go
import (
	"context"

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

err = cli.CreateRole(ctx, milvusclient.NewCreateRoleOption("my_role"))
if err != nil {
	// handle error
}
```

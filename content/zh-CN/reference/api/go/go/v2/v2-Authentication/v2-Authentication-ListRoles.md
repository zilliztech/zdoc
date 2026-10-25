---
title: "ListRoles | Go | v2"
slug: /go/go/v2-Authentication-ListRoles
sidebar_label: "ListRoles"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回所有角色的名称。 | Go | v2"
type: docx
token: AwuYdyq81ob9TKx3BEPcww6fnxb
sidebar_position: 15
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListRoles
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListRoles

此操作返回所有角色的名称。

```go
func (c *Client) ListRoles(ctx context.Context, opt ListRoleOption, callOpts ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

创建 ListRoles() 的请求。

```go
option := milvusclient.NewListRoleOption()

result, err := client.ListRoles(ctx, option)
```

**参数：**

- **option**（*ListRoleOption*） -

    列出角色时使用的选项。使用 `NewListRoleOption` 构建。

**构建器方法：**

- `NewListRoleOption()`

    创建用于列出所有角色的选项。

**返回类型：**

*[]string, error*

**返回值：**

角色名称列表。如果操作失败，则返回错误。

**参数：**

- **result**（*[]string*） -

    ListRoles() 返回的 []string 值。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListRoles() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

roles, err := cli.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
	// handle error
}
fmt.Println(roles)
```

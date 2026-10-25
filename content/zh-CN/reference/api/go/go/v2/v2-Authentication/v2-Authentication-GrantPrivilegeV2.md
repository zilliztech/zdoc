---
title: "GrantPrivilegeV2 | Go | v2"
slug: /go/go/v2-Authentication-GrantPrivilegeV2
sidebar_label: "GrantPrivilegeV2"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用简化参数的 v2 API 为角色授予权限。 | Go | v2"
type: docx
token: SQmOdGshmoWjeexP0GLcZoCZnEc
sidebar_position: 12
keywords: 
  - 托管的 Milvus
  - Serverless 向量 Database
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz
  - Zilliz Cloud
  - 云
  - GrantPrivilegeV2
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GrantPrivilegeV2

此操作使用简化参数的 v2 API 为角色授予权限。

```go
func (c *Client) GrantPrivilegeV2(ctx context.Context, option GrantPrivilegeV2Option, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 GrantPrivilegeV2() 创建请求。

```go
option := milvusclient.NewGrantPrivilegeV2Option(roleName, privilegeName, collectionName).
    WithDbName(dbName)

err := client.GrantPrivilegeV2(ctx, option)
```

**参数：**

- **roleName**（*string*） -

    **[必需]**

    角色名称。

- **privilegeName**（*string*） -

    **[必需]**

    权限名称。

- **collectionName**（*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewGrantPrivilegeV2Option(roleName string, privilegeName string, collectionName string)`

    为 GrantPrivilegeV2() 创建请求。

- `WithDbName(dbName string)`

    指定用于该操作的 Database。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的错误。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GrantPrivilegeV2() 的用法。

```go
import (
	"context"

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

err = cli.GrantPrivilegeV2(ctx, milvusclient.NewGrantPrivilegeV2Option("my_role", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```

---
title: "GrantPrivilege | Go | v2"
slug: /go/go/v2-Authentication-GrantPrivilege
sidebar_label: "GrantPrivilege"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用 v1 API 向角色授予权限，并显式指定对象类型和对象名称。对于简化后的 v2 API，请使用 `GrantPrivilegeV2()`。 | Go | v2"
type: docx
token: DgJjdMnqgoBVB5xd6cgcMl4VnCh
sidebar_position: 11
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - GrantPrivilege
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilege

此操作使用 v1 API 向角色授予权限，并显式指定对象类型和对象名称。对于简化后的 v2 API，请使用 `GrantPrivilegeV2()`。

```go
func (c *Client) GrantPrivilege(ctx context.Context, option GrantPrivilegeOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 GrantPrivilege() 的请求。

```go
option := milvusclient.NewGrantPrivilegeOption(roleName, objectType, privilegeName, objectName).
    WithDbName(dbName)

err := client.GrantPrivilege(ctx, option)
```

**参数：**

- **roleName** （*string*） -

    **[必需]**

    角色的名称。

- **objectType** （*string*） -

    **[必需]**

    权限适用的对象类型（例如：Global、Collection）。

- **privilegeName** （*string*） -

    **[必需]**

    权限的名称。

- **objectName** （*string*） -

    **[必需]**

    权限适用的对象名称。

**构建器方法：**

- `NewGrantPrivilegeOption(roleName string, objectType string, privilegeName string, objectName string)`

    创建一个用于向角色授予权限的新选项。

- `WithDbName(dbName string)`

    指定此操作使用的 Database。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    操作失败。查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 GrantPrivilege() 的用法。

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

err = cli.GrantPrivilege(ctx, milvusclient.NewGrantPrivilegeOption("my_role", "Collection", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```

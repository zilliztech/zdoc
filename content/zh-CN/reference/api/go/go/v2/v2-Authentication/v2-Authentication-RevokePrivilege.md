---
title: "RevokePrivilege | Go | v2"
slug: /go/go/v2-Authentication-RevokePrivilege
sidebar_label: "RevokePrivilege"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会撤销角色中的特定权限。 | Go | v2"
type: docx
token: RPbodXeOeoeiH6xVLdVcZUsenlb
sidebar_position: 21
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - RevokePrivilege
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RevokePrivilege

此操作会撤销角色中的特定权限。

```go
func (c *Client) RevokePrivilege(ctx context.Context, option RevokePrivilegeOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 RevokePrivilege() 的请求。

```go
option := milvusclient.NewRevokePrivilegeOption(roleName, objectType, privilegeName, objectName).
    WithDbName(dbName)

err := client.RevokePrivilege(ctx, option)
```

**参数：**

- **roleName** （*string*） -

    **[必需]**

    角色的名称。

- **objectType** （*string*） -

    **[必需]**

    权限适用的对象类型（例如 Global、Collection）。

- **privilegeName** （*string*） -

    **[必需]**

    权限的名称。

- **objectName** （*string*） -

    **[必需]**

    权限适用的对象名称。

**构建器方法：**

- `NewRevokePrivilegeOption(roleName string, objectType string, privilegeName string, objectName string)`

    创建 RevokePrivilege() 的请求。

- `WithDbName(dbName string)`

    指定要用于此操作的 Database。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RevokePrivilege() 的用法。

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

err = cli.RevokePrivilege(ctx, milvusclient.NewRevokePrivilegeOption("my_role", "Collection", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```

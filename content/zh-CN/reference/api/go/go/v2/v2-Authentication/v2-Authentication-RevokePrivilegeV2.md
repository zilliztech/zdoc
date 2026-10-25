---
title: "RevokePrivilegeV2 | Go | v2"
slug: /go/go/v2-Authentication-RevokePrivilegeV2
sidebar_label: "RevokePrivilegeV2"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用 v2 API 从角色中撤销某项权限。 | Go | v2"
type: docx
token: LQj8d9Osgo8oNAx8yD2cmtYNnDc
sidebar_position: 22
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - RevokePrivilegeV2
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RevokePrivilegeV2

此操作使用 v2 API 从角色中撤销某项权限。

```go
func (c *Client) RevokePrivilegeV2(ctx context.Context, option RevokePrivilegeV2Option, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 RevokePrivilegeV2() 创建请求。

```go
option := milvusclient.NewRevokePrivilegeV2Option(roleName, privilegeName, collectionName).
    WithDbName(dbName)

err := client.RevokePrivilegeV2(ctx, option)
```

**参数：**

- **roleName** (*string*) -

    **[必需]**

    角色名称。

- **privilegeName** (*string*) -

    **[必需]**

    权限名称。

- **collectionName** (*string*) -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewRevokePrivilegeV2Option(roleName string, privilegeName string, collectionName string)`

    为 RevokePrivilegeV2() 创建请求。

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

演示 RevokePrivilegeV2() 的用法。

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

err = cli.RevokePrivilegeV2(ctx, milvusclient.NewRevokePrivilegeV2Option("my_role", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```

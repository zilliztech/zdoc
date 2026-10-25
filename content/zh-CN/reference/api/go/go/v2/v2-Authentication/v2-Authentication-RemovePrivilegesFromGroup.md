---
title: "RemovePrivilegesFromGroup | Go | v2"
slug: /go/go/v2-Authentication-RemovePrivilegesFromGroup
sidebar_label: "RemovePrivilegesFromGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从现有权限组中移除一个或多个权限。 | Go | v2"
type: docx
token: Dzrhd3WaMoODFkxhtcucUCvCn9c
sidebar_position: 19
keywords: 
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - RemovePrivilegesFromGroup
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RemovePrivilegesFromGroup

此操作会从现有权限组中移除一个或多个权限。

```go
func (c *Client) RemovePrivilegesFromGroup(ctx context.Context, option RemovePrivilegeFromGroupOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 RemovePrivilegesFromGroup() 创建请求。

```go
option := milvusclient.NewRemovePrivilegesFromGroupOption(groupName, privilegeNames...)

err := client.RemovePrivilegesFromGroup(ctx, option)
```

**参数：**

- **groupName** (*string*) -

    **[必需]**

    权限组的名称。

- **privileges** (*...string*) -

    **[必需]**

    要从该组中移除的权限的名称。

**构建器方法：**

- `NewRemovePrivilegesFromGroupOption(groupName string, privileges ...string)`

    创建一个用于从权限组中移除权限的新选项。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RemovePrivilegesFromGroup() 的用法。

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

err = cli.RemovePrivilegesFromGroup(ctx, milvusclient.NewRemovePrivilegesFromGroupOption("my_priv_group", "Query"))
if err != nil {
	// handle error
}
```

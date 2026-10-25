---
title: "RevokeRole | Go | v2"
slug: /go/go/v2-Authentication-RevokeRole
sidebar_label: "RevokeRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从用户中移除某个角色。 | Go | v2"
type: docx
token: OuG9dQJKJoMzmOxOoNNcdDRDnJd
sidebar_position: 23
keywords: 
  - Elastic 向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - Annoy 向量搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - RevokeRole
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RevokeRole

此操作会从用户中移除某个角色。

```go
func (c *Client) RevokeRole(ctx context.Context, opt RevokeRoleOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 RevokeRole() 的请求。

```go
option := milvusclient.NewRevokeRoleOption(userName, roleName)

err := client.RevokeRole(ctx, option)
```

**参数：**

- **userName**（*string*） -

    **[必需]**

    用户的名称。

- **roleName**（*string*） -

    **[必需]**

    角色的名称。

**构建器方法：**

- `NewRevokeRoleOption(userName string, roleName string)`

    创建 RevokeRole() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil；否则返回说明出错原因的错误。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RevokeRole() 的用法。

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

err = cli.RevokeRole(ctx, milvusclient.NewRevokeRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```

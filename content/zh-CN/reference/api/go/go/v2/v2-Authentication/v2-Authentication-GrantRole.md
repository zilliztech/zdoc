---
title: "GrantRole() | Go | v2"
slug: /go/go/v2-Authentication-GrantRole
sidebar_label: "GrantRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将角色分配给用户。 | Go | v2"
type: docx
token: OPfXdP02ZoeDIUxhBUOcU3vBngb
sidebar_position: 13
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GrantRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantRole()

此操作将角色分配给用户。

```go
func (c *Client) GrantRole(ctx context.Context, opt GrantRoleOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewGrantRoleOption(userName, roleName)

err := client.GrantRole(ctx, option)
```

**参数：**

- **userName** (*string*)

    用户名称。

- **roleName** (*string*)

    角色名称。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

## 示例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

err = cli.GrantRole(ctx, milvusclient.NewGrantRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```

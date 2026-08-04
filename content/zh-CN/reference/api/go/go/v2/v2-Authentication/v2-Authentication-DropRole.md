---
title: "DropRole() | Go | v2"
slug: /go/go/v2-Authentication-DropRole
sidebar_label: "DropRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从系统中删除一个角色。 | Go | v2"
type: docx
token: QKItdAf6HoDzMVxzWEbcDVL9n5r
sidebar_position: 9
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - DropRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropRole()

此操作会从系统中删除一个角色。

```go
func (c *Client) DropRole(ctx context.Context, opt DropRoleOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDropRoleOption("my_role").
    WithForce(true)

err := cli.DropRole(ctx, option)
```

**参数：**

- **opt** (*DropRoleOption*) -

    用于删除角色的选项。

**构建器方法：**

- `WithForce(force bool)`

    此方法会强制执行删除操作，即使该角色已分配给用户或已被授予权限，也会将其删除。

**返回类型：**

*error*

**返回：**

成功时返回 nil；如果失败，则返回描述错误原因的 error。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

// Drop a role normally
err = cli.DropRole(ctx, milvusclient.NewDropRoleOption("my_role"))
if err != nil {
	log.Fatal("failed to drop role: ", err.Error())
}

// Force drop a role that is still assigned
err = cli.DropRole(ctx, milvusclient.NewDropRoleOption("my_role").WithForce(true))
if err != nil {
	log.Fatal("failed to force drop role: ", err.Error())
}
```

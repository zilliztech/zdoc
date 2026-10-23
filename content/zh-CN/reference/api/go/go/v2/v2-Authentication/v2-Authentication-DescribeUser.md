---
title: "DescribeUser | Go | v2"
slug: /go/go/v2-Authentication-DescribeUser
sidebar_label: "DescribeUser"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回用户的详细信息，包括其分配的角色。 | Go | v2"
type: docx
token: PQHKdFLGXohyD3xIjALcEDa7n6g
sidebar_position: 7
keywords: 
  - Milvus Lite
  - Milvus 基准测试
  - 托管 Milvus
  - Serverless 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - DescribeUser
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeUser

此操作返回用户的详细信息，包括其分配的角色。

```go
func (c *Client) DescribeUser(ctx context.Context, opt DescribeUserOption, callOpts ...grpc.CallOption) (*entity.User, error)
```

## 请求语法\{#request-syntax}

创建 DescribeUser() 的请求。

```go
option := milvusclient.NewDescribeUserOption(userName)

result, err := client.DescribeUser(ctx, option)
```

**参数：**

- **userName** (*string*) -

    **[必需]**

    用户的名称。

**构建器方法：**

- `NewDescribeUserOption(userName)`

    创建 DescribeUser() 的请求。

**返回类型：**

&ast;*Entity.User, error*

**返回：**

返回用户的描述信息，包括已分配的角色。如果操作失败，则返回错误。

```go
type User struct {
    UserName string
    Roles []string
}
```

**参数：**

- **UserName** (*string*) -

    用户的名称。

- **Roles** (*[]string*) -

    已分配角色的列表。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DescribeUser() 的用法。

```go
import (
	"context"
	"fmt"

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

user, err := cli.DescribeUser(ctx, milvusclient.NewDescribeUserOption("my_user"))
if err != nil {
	// handle error
}
fmt.Println(user)
```

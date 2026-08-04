---
title: "DescribeUser() | Go | v2"
slug: /go/go/v2-Authentication-DescribeUser
sidebar_label: "DescribeUser()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回用户的详细信息，包括其分配的角色。 | Go | v2"
type: docx
token: EbOodxkWBoRvwAxzJOkcsM6lnic
sidebar_position: 7
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeUser()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeUser()

此操作返回用户的详细信息，包括其分配的角色。

```go
func (c *Client) DescribeUser(ctx context.Context, opt DescribeUserOption, callOpts ...grpc.CallOption) (*entity.User, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDescribeUserOption(userName)

result, err := client.DescribeUser(ctx, option)
```

**参数：**

- **userName** (*string*)

    用户名称。

**返回类型：**

**[entity.User](./v2-Authentication-User), error*

**返回：**

包含已分配角色的用户描述。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"

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

user, err := cli.DescribeUser(ctx, milvusclient.NewDescribeUserOption("my_user"))
if err != nil {
	// handle error
}
fmt.Println(user)
```

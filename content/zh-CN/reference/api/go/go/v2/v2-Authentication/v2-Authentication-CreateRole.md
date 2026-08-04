---
title: "CreateRole() | Go | v2"
slug: /go/go/v2-Authentication-CreateRole
sidebar_label: "CreateRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个新的角色用于访问控制。 | Go | v2"
type: docx
token: NMsddLaMUoGUxexlFIScnY0Knpg
sidebar_position: 4
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - CreateRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateRole()

此操作会创建一个新的角色用于访问控制。

```go
func (c *Client) CreateRole(ctx context.Context, opt CreateRoleOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewCreateRoleOption(roleName)

err := client.CreateRole(ctx, option)
```

**参数：**

- **roleName** (*string*)

    角色名称。

**返回类型：**

*error*

**返回值：**

成功时返回 nil；如果失败，则返回描述错误原因的 error。

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

err = cli.CreateRole(ctx, milvusclient.NewCreateRoleOption("my_role"))
if err != nil {
	// handle error
}
```

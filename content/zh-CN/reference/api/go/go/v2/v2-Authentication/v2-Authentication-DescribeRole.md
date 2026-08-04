---
title: "DescribeRole() | Go | v2"
slug: /go/go/v2-Authentication-DescribeRole
sidebar_label: "DescribeRole()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回角色的详细信息，包括其已授予的权限。 | Go | v2"
type: docx
token: EAs8dmRIuoMvW5xXLHdcDw2Gn0d
sidebar_position: 6
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeRole()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeRole()

此操作返回角色的详细信息，包括其已授予的权限。

```go
func (c *Client) DescribeRole(ctx context.Context, option DescribeRoleOption, callOptions ...grpc.CallOption) (*entity.Role, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDescribeRoleOption(roleName).
    WithDbName(dbName)

result, err := client.DescribeRole(ctx, option)
```

**参数：**

- **roleName** (*string*)

    角色名称。

**可选方法：**

- `WithDbName(dbName string)`

    指定操作使用的数据库。

**返回类型：**

**[entity.Role](./v2-Authentication-Role), error*

**返回：**

角色详细信息，包括已授予的权限。如果操作失败，则返回错误。

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

role, err := cli.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("my_role"))
if err != nil {
	// handle error
}
fmt.Println(role)
```

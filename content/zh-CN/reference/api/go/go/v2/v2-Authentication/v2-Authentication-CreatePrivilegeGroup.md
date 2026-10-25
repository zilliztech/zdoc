---
title: "CreatePrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-CreatePrivilegeGroup
sidebar_label: "CreatePrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个具名权限组，组内权限可以一并授予。 | Go | v2"
type: docx
token: CUNxd572AoblwWxPx5SclwaOn5f
sidebar_position: 3
keywords: 
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreatePrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreatePrivilegeGroup

此操作会创建一个具名权限组，组内权限可以一并授予。

```go
func (c *Client) CreatePrivilegeGroup(ctx context.Context, option CreatePrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 CreatePrivilegeGroup() 创建请求。

```go
option := milvusclient.NewCreatePrivilegeGroupOption(groupName)

err := client.CreatePrivilegeGroup(ctx, option)
```

**参数：**

- **groupName** （*string*） -

    **[必需]**

    权限组的名称。

**构建器方法：**

- `NewCreatePrivilegeGroupOption(groupName)`

    为 CreatePrivilegeGroup() 创建请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 CreatePrivilegeGroup() 的用法。

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

err = cli.CreatePrivilegeGroup(ctx, milvusclient.NewCreatePrivilegeGroupOption("my_priv_group"))
if err != nil {
	// handle error
}
```

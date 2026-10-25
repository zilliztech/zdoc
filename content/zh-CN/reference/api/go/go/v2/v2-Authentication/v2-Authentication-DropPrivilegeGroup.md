---
title: "DropPrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-DropPrivilegeGroup
sidebar_label: "DropPrivilegeGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会删除权限组。 | Go | v2"
type: docx
token: Vt7adLFyNoUVsJxfYpdcDdVanae
sidebar_position: 8
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropPrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropPrivilegeGroup

此操作会删除权限组。

```go
func (c *Client) DropPrivilegeGroup(ctx context.Context, option DropPrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 DropPrivilegeGroup() 创建请求。

```go
option := milvusclient.NewDropPrivilegeGroupOption(groupName)

err := client.DropPrivilegeGroup(ctx, option)
```

**参数：**

- **groupName** (*string*) -

    **[必填]**

    权限组的名称。

**构建器方法：**

- `NewDropPrivilegeGroupOption(groupName)`

    为 DropPrivilegeGroup() 创建请求。

**返回类型：**

*error*

**返回值：**

成功时返回 nil，失败时返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 DropPrivilegeGroup() 的用法。

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

err = cli.DropPrivilegeGroup(ctx, milvusclient.NewDropPrivilegeGroupOption("my_priv_group"))
if err != nil {
	// handle error
}
```

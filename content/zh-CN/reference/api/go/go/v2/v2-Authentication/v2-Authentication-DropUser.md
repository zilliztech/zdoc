---
title: "DropUser | Go | v2"
slug: /go/go/v2-Authentication-DropUser
sidebar_label: "DropUser"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从系统中删除一个用户。 | Go | v2"
type: docx
token: DwNPdAshLoAsYvxrs4lcQCe0n4g
sidebar_position: 10
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - zilliz
  - zilliz cloud
  - 云
  - DropUser
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropUser

此操作会从系统中删除一个用户。

```go
func (c *Client) DropUser(ctx context.Context, opt DropUserOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropUser() 的请求。

```go
option := milvusclient.NewDropUserOption(userName)

err := client.DropUser(ctx, option)
```

**参数：**

- **userName** （*string*） -

    **[必需]**

    用户的名称。

**构建器方法：**

- `NewDropUserOption(userName string)`

    创建 DropUser() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 DropUser() 的用法。

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

err = cli.DropUser(ctx, milvusclient.NewDropUserOption("my_user"))
if err != nil {
	// handle error
}
```

---
title: "UpdatePassword | Go | v2"
slug: /go/go/v2-Authentication-UpdatePassword
sidebar_label: "UpdatePassword"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新现有用户的密码。 | Go | v2"
type: docx
token: W0UgdXTMmoA1VVx5Cooc1Re8nnb
sidebar_position: 25
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - 多模态 RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - UpdatePassword
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# UpdatePassword

此操作会更新现有用户的密码。

```go
func (c *Client) UpdatePassword(ctx context.Context, opt UpdatePasswordOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 UpdatePassword() 创建请求。

```go
option := milvusclient.NewUpdatePasswordOption(userName, oldPassword, newPassword)

err := client.UpdatePassword(ctx, option)
```

**参数：**

- **userName**（*string*）-

    **[必需]**

    用户的名称。

- **oldPassword**（*string*）-

    **[必需]**

    用于验证的当前密码。

- **newPassword**（*string*）-

    **[必需]**

    要设置的新密码。

**构建器方法：**

- `NewUpdatePasswordOption(userName string, oldPassword string, newPassword string)`

    为 UpdatePassword() 创建请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    此操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 UpdatePassword() 的用法。

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

err = cli.UpdatePassword(ctx, milvusclient.NewUpdatePasswordOption("my_user", "P@ssw0rd", "NewP@ssw0rd"))
if err != nil {
	// handle error
}
```

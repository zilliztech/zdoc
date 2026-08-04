---
title: "UpdatePassword() | Go | v2"
slug: /go/go/v2-Authentication-UpdatePassword
sidebar_label: "UpdatePassword()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更新现有用户的密码。 | Go | v2"
type: docx
token: GKDQd15KkoiLPSxs8UYcFUamnIg
sidebar_position: 25
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - UpdatePassword()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UpdatePassword()

此操作会更新现有用户的密码。

```go
func (c *Client) UpdatePassword(ctx context.Context, opt UpdatePasswordOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewUpdatePasswordOption(userName, oldPassword, newPassword)

err := client.UpdatePassword(ctx, option)
```

**参数：**

- **userName** (*string*)

    用户名称。

- **oldPassword** (*string*)

    用于验证的当前密码。

- **newPassword** (*string*)

    要设置的新密码。

**返回类型：**

*error*

**返回：**

成功时返回 nil，失败时返回描述错误原因的 error。

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

err = cli.UpdatePassword(ctx, milvusclient.NewUpdatePasswordOption("my_user", "P@ssw0rd", "NewP@ssw0rd"))
if err != nil {
	// handle error
}
```

---
title: "GrantRole | Go | v2"
slug: /go/go/v2-Authentication-GrantRole
sidebar_label: "GrantRole"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会为用户授予角色。 | Go | v2"
type: docx
token: PXoWdX9cPoJapOxK9kbcE2S6nVh
sidebar_position: 13
keywords: 
  - 句子变换器
  - 推荐系统
  - 信息检索
  - 降维
  - Zilliz
  - Zilliz Cloud
  - 云
  - GrantRole
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantRole

此操作会为用户授予角色。

```go
func (c *Client) GrantRole(ctx context.Context, opt GrantRoleOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 GrantRole() 的请求。

```go
option := milvusclient.NewGrantRoleOption(userName, roleName)

err := client.GrantRole(ctx, option)
```

**参数：**

- **userName**（*string*） -

    **[必需]**

    用户的名称。

- **roleName**（*string*） -

    **[必需]**

    角色的名称。

**构建器方法：**

- `NewGrantRoleOption(userName string, roleName string)`

    创建 GrantRole() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的 error。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GrantRole() 的用法。

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

err = cli.GrantRole(ctx, milvusclient.NewGrantRoleOption("my_user", "my_role"))
if err != nil {
	// handle error
}
```

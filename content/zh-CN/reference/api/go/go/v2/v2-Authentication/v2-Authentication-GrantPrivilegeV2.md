---
title: "GrantPrivilegeV2() | Go | v2"
slug: /go/go/v2-Authentication-GrantPrivilegeV2
sidebar_label: "GrantPrivilegeV2()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用具有简化参数的 v2 API 为角色授予权限。 | Go | v2"
type: docx
token: ZO8adFZzAotVzfxEko2cKjHvnfb
sidebar_position: 12
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - GrantPrivilegeV2()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantPrivilegeV2()

此操作使用具有简化参数的 v2 API 为角色授予权限。

```go
func (c *Client) GrantPrivilegeV2(ctx context.Context, option GrantPrivilegeV2Option, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewGrantPrivilegeV2Option(roleName, privilegeName, collectionName).
    WithDbName(dbName)

err := client.GrantPrivilegeV2(ctx, option)
```

**参数：**

- **roleName** (*string*)

    角色名称。

- **privilegeName** (*string*)

    权限名称。

- **collectionName** (*string*)

    目标集合的名称。

**可选方法：**

- `WithDbName(dbName string)`

    指定用于该操作的数据库。

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述错误原因的 error。

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
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

err = cli.GrantPrivilegeV2(ctx, milvusclient.NewGrantPrivilegeV2Option("my_role", "Search", "quick_setup"))
if err != nil {
	// handle error
}
```

---
title: "GrantV2 | Go | v2"
slug: /go/go/v2-Authentication-GrantV2
sidebar_label: "GrantV2"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用 v2 API 向角色授予权限。 | Go | v2"
type: docx
token: UK3BdNpHNorHQPx0R2bcxyiQnTd
sidebar_position: 28
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - GrantV2
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GrantV2

此操作使用 v2 API 向角色授予权限。

<Admonition type="info" title="Notes">

此接口已弃用，请改用 GrantPrivilegeV2()。

</Admonition>

```go
func (c *Client) GrantV2(ctx context.Context, option GrantV2Option, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 GrantV2() 创建请求。

```go
option := milvusclient.NewGrantV2Option(roleName, privilegeName, dbName, collectionName).
    WithDbName(dbName)

err := client.GrantV2(ctx, option)
```

**参数：**

- **roleName** （*string*） -

    角色的名称。

- **privilegeName** （*string*） -

    权限的名称。

- **dbName** （*string*） -

    Database 的名称。

- **collectionName** （*string*） -

    目标 Collection 的名称。

**构建器方法：**

- `NewGrantV2Option(roleName string, privilegeName string, dbName string, collectionName string)`

    创建一个用于通过 v2 API 授予权限的新选项。已弃用，请改用 `NewGrantPrivilegeV2Option`。

- `WithDbName(dbName string)`

    指定要用于此操作的 Database。

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GrantV2() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

err = cli.GrantV2(ctx, milvusclient.NewGrantV2Option("my_role", "Search", "default", "quick_setup"))
if err != nil {
	// handle error
}
```

---
title: "RevokeV2 | Go | v2"
slug: /go/go/v2-Authentication-RevokeV2
sidebar_label: "RevokeV2"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用 v2 API 撤销角色的某项权限。 | Go | v2"
type: docx
token: NylxdfK4NoqbPPxPsZ4cOF14n1f
sidebar_position: 30
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - zilliz
  - Zilliz Cloud
  - 云
  - RevokeV2
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RevokeV2

此操作使用 v2 API 从角色撤销某项权限。

<Admonition type="info" title="Notes">

此接口已废弃，请改用 RevokePrivilegeV2()。

</Admonition>

```go
func (c *Client) RevokeV2(ctx context.Context, option RevokeV2Option, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 RevokeV2() 创建请求。

```go
option := milvusclient.NewRevokeV2Option(roleName, privilegeName, dbName, collectionName).
    WithDbName(dbName)

err := client.RevokeV2(ctx, option)
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

- `NewRevokeV2Option(roleName string, privilegeName string, dbName string, collectionName string)`

    使用 v2 API 创建一个用于撤销权限的新选项。已废弃，请改用 `NewRevokePrivilegeV2Option`。

- `WithDbName(dbName string)`

    指定此操作要使用的 Database。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RevokeV2() 的用法。

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

err = cli.RevokeV2(ctx, milvusclient.NewRevokeV2Option("my_role", "Search", "default", "quick_setup"))
if err != nil {
	// handle error
}
```

---
title: "AlterAlias | Go | v2"
slug: /go/go/v2-Collection-AlterAlias
sidebar_label: "AlterAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将现有别名重新分配给另一个 Collection。 | Go | v2"
type: docx
token: NOBpdRuf2oSRrJxZSYMcOLEcnAE
sidebar_position: 3
keywords: 
  - Milvus 向量 Database
  - Zilliz Cloud
  - 什么是 Milvus
  - Milvus Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - AlterAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterAlias

此操作会将现有别名重新分配给另一个 Collection。

```go
func (c *Client) AlterAlias(ctx context.Context, option AlterAliasOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AlterAlias() 的请求。

```go
option := milvusclient.NewAlterAliasOption(alias, collectionName)

err := client.AlterAlias(ctx, option)
```

**参数：**

- **alias**（*string*）-

    **[必需]**

    要分配的别名名称。

- **collectionName**（*string*）-

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewAlterAliasOption(alias string, collectionName string)`

    创建 AlterAlias() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil；否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 AlterAlias() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

err = cli.AlterAlias(ctx, milvusclient.NewAlterAliasOption("alice", "customized_setup_1"))
if err != nil {
	// handle error
}

aliases, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_1"))
if err != nil {
	// handle error
}
fmt.Println(aliases)

aliases, err = cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_2"))
if err != nil {
	// handle error
}
fmt.Println(aliases)
```

---
title: "DropAlias | Go | v2"
slug: /go/go/v2-Collection-DropAlias
sidebar_label: "DropAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会移除 Collection 别名。 | Go | v2"
type: docx
token: Y0S5dzY9coF6EDxHhBkcBKXhnJh
sidebar_position: 12
keywords: 
  - ANNS
  - 向量搜索
  - kNN 算法
  - HNSW
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropAlias
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropAlias

此操作会移除 Collection 别名。

```go
func (c *Client) DropAlias(ctx context.Context, option DropAliasOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropAlias() 的请求。

```go
option := milvusclient.NewDropAliasOption(alias)

err := client.DropAlias(ctx, option)
```

**参数：**

- **alias** (*string*) -

    **[必需]**

    要分配的别名名称。

**构建器方法：**

- `NewDropAliasOption(alias string)`

    创建 DropAlias() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 DropAlias() 的用法。

```go
import (
	"context"

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

err = cli.DropAlias(ctx, milvusclient.NewDropAliasOption("alice"))
if err != nil {
	// handle error
}
```

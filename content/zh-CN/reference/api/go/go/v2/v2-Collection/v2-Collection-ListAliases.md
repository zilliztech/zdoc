---
title: "ListAliases | Go | v2"
slug: /go/go/v2-Collection-ListAliases
sidebar_label: "ListAliases"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回指定 Collection 的别名。 | Go | v2"
type: docx
token: RXGLdpZ23o3178xZTb4cLZBmnQd
sidebar_position: 20
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - 多模态 RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListAliases
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases

此操作返回指定 Collection 的别名。

```go
func (c *Client) ListAliases(ctx context.Context, option ListAliasesOption, callOptions ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

为 ListAliases() 创建请求。

```go
option := milvusclient.NewListAliasesOption(collectionName)

result, err := client.ListAliases(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewListAliasesOption(collectionName string)`

    创建用于列出 Collection 别名的选项。`collectionName` 指定该 Collection。

**返回类型：**

*[]string, error*

**返回：**

Collection 的别名名称列表。如果操作失败，则返回错误。

**参数：**

- **result** （*[]string*） -

    ListAliases() 返回的 []string 值。

**异常：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListAliases() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

result, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("books"))
if err != nil {
	// handle error
}
fmt.Println(result)
```

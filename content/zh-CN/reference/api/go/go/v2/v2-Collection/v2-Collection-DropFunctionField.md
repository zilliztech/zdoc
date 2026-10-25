---
title: "DropFunctionField | Go | v2"
slug: /go/go/v2-Collection-DropFunctionField
sidebar_label: "DropFunctionField"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作按函数名称从现有 Collection 中移除函数。 | Go | v2"
type: docx
token: Gp7KdpBhUoFdH0xfPFUcy7A1n7e
sidebar_position: 29
keywords: 
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - NN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - DropFunctionField
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropFunctionField

此操作按函数名称从现有 Collection 中移除函数。

```go
func (c *Client) DropFunctionField(ctx context.Context, opt DropFunctionFieldOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropFunctionField() 的请求。

```go
option := milvusclient.NewDropFunctionFieldOption(collectionName, functionName)

err := client.DropFunctionField(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **functionName** （*string*） -

    **[必需]**

    DropFunctionField 使用的 functionName。

**构建器方法：**

- `NewDropFunctionFieldOption(collectionName string, functionName string)`

    创建按名称删除函数的选项。`collectionName` 指定 Collection，`functionName` 指定要移除的函数。

**返回类型：**

*error*

**返回：**

函数删除后返回 nil。当客户端校验或 RPC 失败时，返回错误。

**异常：**

- **error**

    操作失败。校验、请求构建或 RPC 失败。检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 DropFunctionField() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.DropFunctionField(ctx, milvusclient.NewDropFunctionFieldOption("books", "bm25_fn"))
if err != nil {
	// handle error
}
```

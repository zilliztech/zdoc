---
title: "ListFileResources | Go | v2"
slug: /go/go/v2-FileResources-ListFileResources
sidebar_label: "ListFileResources"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出在 Milvus 中注册的所有远程文件。 | Go | v2"
type: docx
token: Ubf9dGyiLoRBOyxHBktcvGAdndg
sidebar_position: 3
keywords: 
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - 向量化
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListFileResources
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListFileResources

此操作会列出在 Milvus 中注册的所有远程文件。

```go
func (c *Client) ListFileResources(ctx context.Context, option ListFileResourcesOption, callOptions ...grpc.CallOption) ([]*entity.FileResource, error)
```

## 请求语法\{#request-syntax}

创建 ListFileResources() 的请求。

```go
option := milvusclient.NewListFileResourcesOption()

resources, err := cli.ListFileResources(ctx, option)
```

**构建器方法：**

- `NewListFileResourcesOption()`

    创建一个用于列出已注册文件的新选项。

**返回类型：**

<em>[]</em>Entity.FileResource, error&ast;

**返回：**

一个 [Entity.FileResource](./v2-FileResources-FileResource) 记录列表，每条记录包含 `ID`、`Name` 和 `Path` 字段。如果操作失败，则返回错误。

```go
type FileResource struct {
    ID   int64
    Name string
    Path string
}
```

**参数：**

- **ID**（*int64*）-

    文件资源的唯一标识符。

- **Name**（*string*）-

    文件资源的名称。

- **Path**（*string*）-

    文件资源的路径。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListFileResources() 的用法。

```go
import (
	"context"
	"fmt"

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

resources, err := cli.ListFileResources(ctx, milvusclient.NewListFileResourcesOption())
if err != nil {
	// handle error
}

for _, resource := range resources {
	fmt.Printf("ID: %d, Name: %s, Path: %s\n", resource.ID, resource.Name, resource.Path)
}
```

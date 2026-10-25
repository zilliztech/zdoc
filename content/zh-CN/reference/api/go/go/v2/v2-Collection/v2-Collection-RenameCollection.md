---
title: "RenameCollection | Go | v2"
slug: /go/go/v2-Collection-RenameCollection
sidebar_label: "RenameCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会重命名现有 Collection。 | Go | v2"
type: docx
token: FgIgdfcnBoXz87xXstdcP0b5nFf
sidebar_position: 22
keywords: 
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - RenameCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RenameCollection

此操作会重命名现有 Collection。

```go
func (c *Client) RenameCollection(ctx context.Context, option RenameCollectionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 RenameCollection() 的请求。

```go
option := milvusclient.NewRenameCollectionOption(oldName, newName)

err := client.RenameCollection(ctx, option)
```

**参数：**

- **oldName** （*string*） -

    **[必需]**

    旧名称。

- **newName** （*string*） -

    **[必需]**

    Collection 的新名称。

**构建器方法：**

- `NewRenameCollectionOption(oldName string, newName string)`

    创建 RenameCollection() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回一个说明出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RenameCollection() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
	// handle error
}
```

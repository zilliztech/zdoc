---
title: "RemoveFileResource | Go | v2"
slug: /go/go/v2-FileResources-RemoveFileResource
sidebar_label: "RemoveFileResource"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从 Milvus 注销远程文件。可使用此操作清理不再被引用的文件资源。 | Go | v2"
type: docx
token: V6XSdI2msohQzaxLXNdch5ZJnP2
sidebar_position: 6
keywords: 
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Milvus 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - RemoveFileResource
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RemoveFileResource

此操作会从 Milvus 注销远程文件。可使用此操作清理不再被引用的文件资源。

```go
func (c *Client) RemoveFileResource(ctx context.Context, option RemoveFileResourceOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 RemoveFileResource() 的请求。

```go
option := milvusclient.NewRemoveFileResourceOption(name)

err := cli.RemoveFileResource(ctx, option)
```

**参数：**

- **name** (*string*) -

    **[必需]**

    要注销的文件资源的名称。

**构建器方法：**

- `NewRemoveFileResourceOption(name string)`

    创建一个用于注销远程文件的新选项。

**返回类型：**

*error*

**返回：**

成功时返回 nil，如果操作失败，则返回错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RemoveFileResource() 的用法。

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

err = cli.RemoveFileResource(ctx, milvusclient.NewRemoveFileResourceOption("embedding_model"))
if err != nil {
	// handle error
}
```

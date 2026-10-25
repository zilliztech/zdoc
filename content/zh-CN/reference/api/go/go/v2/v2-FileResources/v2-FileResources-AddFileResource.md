---
title: "AddFileResource | Go | v2"
slug: /go/go/v2-FileResources-AddFileResource
sidebar_label: "AddFileResource"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将远程文件注册到 Milvus，使其可通过命名引用供服务端功能使用。 | Go | v2"
type: docx
token: QDGzd5iVnoxc4jxfOGPcJDxVnKc
sidebar_position: 1
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - Zilliz
  - Zilliz Cloud
  - 云
  - AddFileResource
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddFileResource

此操作会将远程文件注册到 Milvus，使其可通过命名引用供服务端功能使用。

```go
func (c *Client) AddFileResource(ctx context.Context, option AddFileResourceOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AddFileResource() 的请求。

```go
option := milvusclient.NewAddFileResourceOption(name, path)

err := cli.AddFileResource(ctx, option)
```

**参数：**

- **name** (*string*) -

    **[必需]**

    用于引用文件资源的名称。

- **path** (*string*) -

    **[必需]**

    远程文件的路径。

**构建器方法：**

- `NewAddFileResourceOption(name string, path string)`

    创建一个用于注册远程文件的新选项。

**返回类型：**

*error*

**返回：**

成功时返回 nil，如果操作失败，则返回错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 AddFileResource() 的用法。

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

err = cli.AddFileResource(ctx, milvusclient.NewAddFileResourceOption("embedding_model", "/models/embedding.bin"))
if err != nil {
	// handle error
}
```

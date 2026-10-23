---
title: "GetServerVersion | Go | v2"
slug: /go/go/v2-Client-GetServerVersion
sidebar_label: "GetServerVersion"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回所连接的 Milvus 服务器的版本。 | Go | v2"
type: docx
token: ZZ1mdvZJVoi5egxObkncej3SnUc
sidebar_position: 3
keywords: 
  - 什么是向量 Database
  - 向量 Database
  - 多模态向量 Database 检索
  - 检索增强生成
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetServerVersion
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersion

此操作返回所连接的 Milvus 服务器的版本。

```go
func (c *Client) GetServerVersion(ctx context.Context, option GetServerVersionOption, callOptions ...grpc.CallOption) (string, error)
```

## 请求语法\{#request-syntax}

创建 GetServerVersion() 的请求。

```go
option := milvusclient.NewGetServerVersionOption()

version, err := client.GetServerVersion(ctx, option)
```

**构建器方法：**

- `NewGetServerVersionOption()`

    创建 GetServerVersion() 的请求。

**返回类型：**

*string, error*

**返回：**

返回所请求的字符串值。如果操作失败，则返回错误。

**参数：**

- **result** （*string*） -

    GetServerVersion() 返回的字符串值。

**异常处理：**

- **error**

    操作失败。查看 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 GetServerVersion() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

version, err := cli.GetServerVersion(ctx, milvusclient.NewGetServerVersionOption())
if err != nil {
	log.Fatal("failed to get server version:", err)
}
fmt.Println(version)
```

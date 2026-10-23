---
title: "CreateReplicateStream | Go | v2"
slug: /go/go/v2-CDC-CreateReplicateStream
sidebar_label: "CreateReplicateStream"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个复制流，用于传输复制消息。 | Go | v2"
type: docx
token: VUXQdmaliopQf9xzORCcEe3YntZ
sidebar_position: 1
keywords: 
  - 向量搜索算法
  - 问答系统
  - 以 LLM 作为评判者
  - 混合向量搜索
  - zilliz
  - zilliz cloud
  - 云
  - CreateReplicateStream
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateReplicateStream

此操作会创建一个复制流，用于传输复制消息。

<Admonition type="info" title="Notes">

此接口在 v3.0.0 中已弃用 — 它返回原始 gRPC 流句柄，而非 Milvus 操作。

</Admonition>

```go
func (c *Client) CreateReplicateStream(ctx context.Context, opts ...grpc.CallOption) (milvuspb.MilvusService_CreateReplicateStreamClient, error)
```

## 请求语法\{#request-syntax}

创建 CreateReplicateStream() 的请求。

```go
stream, err := cli.CreateReplicateStream(ctx)
```

**参数：**

- **opts** (*...grpc.CallOption*) -

    可选的 gRPC 调用选项。

**返回类型：**

*milvuspb.MilvusService_CreateReplicateStreamClient, error*

**返回：**

一个双向复制流。使用 `stream.Send(...)` 传输 `milvuspb.ReplicateMessage` 帧，并使用 `stream.Recv()` 接收响应。完成后，使用 `stream.CloseSend()` 关闭发送端。无法创建流时返回错误。

**参数：**

- **result** (*milvuspb.MilvusService_CreateReplicateStreamClient*) -

    CreateReplicateStream() 返回的 milvuspb.MilvusService_CreateReplicateStreamClient 值。

**异常：**

- **error**

    操作失败。无法创建流。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 CreateReplicateStream() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

stream, err := cli.CreateReplicateStream(ctx)
if err != nil {
	// handle error
}
defer stream.CloseSend()
```

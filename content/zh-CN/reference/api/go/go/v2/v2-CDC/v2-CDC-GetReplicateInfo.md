---
title: "GetReplicateInfo | Go | v2"
slug: /go/go/v2-CDC-GetReplicateInfo
sidebar_label: "GetReplicateInfo"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从 Milvus 集群获取复制信息，例如强制故障转移后使用的抢救检查点。 | Go | v2"
type: docx
token: QisddwwM3oTHT8x3No8cKfYNnVb
sidebar_position: 4
keywords: 
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - GetReplicateInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetReplicateInfo

此操作从 Milvus 集群获取复制信息，例如强制故障转移后使用的抢救检查点。

```go
func (c *Client) GetReplicateInfo(ctx context.Context, req *milvuspb.GetReplicateInfoRequest, opts ...grpc.CallOption) (*milvuspb.GetReplicateInfoResponse, error)
```

## 请求语法\{#request-syntax}

创建 GetReplicateInfo() 的请求。

```go
resp, err := cli.GetReplicateInfo(ctx, &milvuspb.GetReplicateInfoRequest{
	SourceClusterId: "source-cluster",
	TargetPchannel:  "source-channel-dml_0",
})
```

**参数：**

- **req** （*milvuspb.GetReplicateInfoRequest*） -

    复制信息请求，包含以下字段：

    - **SourceClusterId** （*string*） -

        源集群的 ID。

    - **TargetPchannel** （*string*） -

        要查询的物理通道。

- **opts** （*...grpc.CallOption*） -

    可选的 gRPC 调用选项。

**返回类型：**

&ast;*milvuspb.GetReplicateInfoResponse, error*

**返回：**

所请求源集群和通道的复制信息。使用 `resp.GetSalvageCheckpoint()` 获取检查点，以便在强制故障转移后从该检查点抢救未同步的消息。RPC 失败时返回错误。

**参数：**

- **result** （&ast;*milvuspb.GetReplicateInfoResponse*） -

    GetReplicateInfo() 返回的 &ast;milvuspb.GetReplicateInfoResponse 值。

**错误处理：**

- **error**

    操作失败。RPC 失败。请查看返回的错误以了解失败详情。

## 示例\{#example}

演示 GetReplicateInfo() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus-proto/go-api/v3/milvuspb"
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

resp, err := cli.GetReplicateInfo(ctx, &milvuspb.GetReplicateInfoRequest{
	SourceClusterId: "source-cluster",
	TargetPchannel:  "source-channel-dml_0",
})
if err != nil {
	// handle error
}
```

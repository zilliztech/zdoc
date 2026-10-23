---
title: "DumpMessages | Go | v2"
slug: /go/go/v2-CDC-DumpMessages
sidebar_label: "DumpMessages"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从 WAL 范围流式传输消息，用于数据抢救。它通常在强制故障转移后使用：从 `GetReplicateInfo` 获取抢救检查点，并将其消息 ID 作为请求的 `StartMessageId` 传入，以恢复尚未同步的消息。 | Go | v2"
type: docx
token: WytGd4yWxo2UfcxPlckcQcR5nWf
sidebar_position: 2
keywords: 
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - NLP 搜索
  - zilliz
  - Zilliz Cloud
  - 云
  - DumpMessages
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DumpMessages

此操作从 WAL 范围流式传输消息，用于数据抢救。它通常在强制故障转移后使用：从 `GetReplicateInfo` 获取抢救检查点，并将其消息 ID 作为请求的 `StartMessageId` 传入，以恢复尚未同步的消息。

```go
func (c *Client) DumpMessages(ctx context.Context, req *milvuspb.DumpMessagesRequest, opts ...grpc.CallOption) (milvuspb.MilvusService_DumpMessagesClient, error)
```

## 请求语法\{#request-syntax}

创建 DumpMessages() 的请求。

```go
stream, err := cli.DumpMessages(ctx, &milvuspb.DumpMessagesRequest{
	Pchannel:       ckpt.GetPchannel(),
	StartMessageId: ckpt.GetMessageId(),
	StartTimetick:  ckpt.GetTimeTick(),
})
```

**参数：**

- **req** （*milvuspb.DumpMessagesRequest*） -

    转储消息请求，包含以下字段：

    - **Pchannel** （*string*） -

        要转储其中消息的物理通道。

    - **StartMessageId** （*[]byte*） -

        转储起始位置的消息 ID；通常是 GetReplicateInfo() 返回的抢救检查点。

    - **StartTimetick** （*uint64*） -

        转储窗口的起始时间 tick。

    - **EndTimetick** （*uint64*） -

        转储窗口的结束时间 tick。

- **opts** （*...grpc.CallOption*） -

    可选的 gRPC 调用选项。

**返回类型：**

*milvuspb.MilvusService_DumpMessagesClient, error*

**返回：**

服务器流式客户端。`stream.Recv()` 产出的每一帧都是一个 `DumpMessagesResponse`，其中包含错误状态或非系统消息。使用 `stream.Recv()` 迭代，直到遇到 `io.EOF`。如果无法创建流，则返回错误。

**参数：**

- **result** （*milvuspb.MilvusService_DumpMessagesClient*） -

    DumpMessages() 返回的 milvuspb.MilvusService_DumpMessagesClient 值。

**错误处理：**

- **error**

    操作失败。无法创建流。请查看返回的错误以了解失败详情。

## 示例\{#example}

演示 DumpMessages() 的用法。

```go
import (
	"context"
	"io"

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

info, err := cli.GetReplicateInfo(ctx, &milvuspb.GetReplicateInfoRequest{
	SourceClusterId: "source-cluster",
	TargetPchannel:  "source-channel-dml_0",
})
if err != nil {
	// handle error
}
ckpt := info.GetSalvageCheckpoint()
if ckpt == nil {
	// no salvage checkpoint available
}

stream, err := cli.DumpMessages(ctx, &milvuspb.DumpMessagesRequest{
	Pchannel:       ckpt.GetPchannel(),
	StartMessageId: ckpt.GetMessageId(),
	StartTimetick:  ckpt.GetTimeTick(),
})
if err != nil {
	// handle error
}

for {
	resp, err := stream.Recv()
	if err == io.EOF {
		break
	}
	if err != nil {
		// handle error
	}
	if msg := resp.GetMessage(); msg != nil {
		// process dumped message
	} else if status := resp.GetStatus(); status != nil {
		// handle error status
		break
	}
}
```

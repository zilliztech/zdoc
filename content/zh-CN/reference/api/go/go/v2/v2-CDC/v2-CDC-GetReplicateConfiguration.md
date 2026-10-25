---
title: "GetReplicateConfiguration | Go | v2"
slug: /go/go/v2-CDC-GetReplicateConfiguration
sidebar_label: "GetReplicateConfiguration"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从 Milvus 集群获取当前的复制配置。 | Go | v2"
type: docx
token: Lq8pdeqGwoAMt0xCa7HctMHznig
sidebar_position: 3
keywords: 
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - GetReplicateConfiguration
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetReplicateConfiguration

此操作会从 Milvus 集群获取当前的复制配置。

```go
func (c *Client) GetReplicateConfiguration(ctx context.Context, opts ...grpc.CallOption) (*commonpb.ReplicateConfiguration, error)
```

## 请求语法\{#request-syntax}

为 GetReplicateConfiguration() 创建请求。

```go
config, err := cli.GetReplicateConfiguration(ctx)
```

**参数：**

- **opts** （*...grpc.CallOption*） -

    可选的 gRPC 调用选项。

**返回类型：**

&ast;*commonpb.ReplicateConfiguration, error*

**返回：**

集群当前的复制配置，包括已配置的集群和复制拓扑。当 RPC 失败时，会返回错误。

**参数：**

- **result** （&ast;*commonpb.ReplicateConfiguration*） -

    GetReplicateConfiguration() 返回的 &ast;commonpb.ReplicateConfiguration 值。

**异常：**

- **error**

    操作失败。RPC 失败。请查看返回的错误以了解失败详情。

## 示例\{#example}

演示 GetReplicateConfiguration() 的用法。

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

config, err := cli.GetReplicateConfiguration(ctx)
if err != nil {
	// handle error
}
```

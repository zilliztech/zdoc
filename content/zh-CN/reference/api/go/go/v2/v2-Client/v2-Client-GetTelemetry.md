---
title: "GetTelemetry() | Go | v2"
slug: /go/go/v2-Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回客户端遥测管理器，用于收集和报告客户端指标。 | Go | v2"
type: docx
token: DfoBdvU6SoC16Yx8zuEcwgw0nHh
sidebar_position: 5
keywords: 
  - hnsw 算法
  - 向量相似度搜索
  - 近似最近邻搜索
  - DiskANN
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetTelemetry()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetTelemetry()

此操作返回客户端遥测管理器，用于收集和报告客户端指标。

```go
func (c *Client) GetTelemetry() *ClientTelemetryManager
```

**返回类型：**

*ClientTelemetryManager*

**返回：**

与此客户端关联的遥测管理器；如果未启用遥测，则返回 nil。

**方法：**

- **GetClientID** （*string*） -

    返回分配给此客户端的唯一客户端 ID（UUID）；在客户端的整个生命周期内，即使跨 gRPC 重连，该 ID 也保持不变。

- **GetConfigHash** （*string*） -

    返回当前生效的遥测配置的哈希。

- **GetMetricsSnapshots** (<em>[]</em>MetricsSnapshot&ast;) -

    返回管理器收集的所有历史指标快照。

- **GetLatestSnapshot** (&ast;*MetricsSnapshot*) -

    返回最新的指标快照；如果不存在，则返回 nil。

- **GetRecentErrors** (<em>[]</em>ErrorInfo&ast;) -

    返回为调试而收集的最近错误，数量最多为请求的数量。

- **IsReady** （*bool*） -

    报告客户端是否已完成初始遥测设置。

- **IsSupported** （*bool*） -

    根据最新的心跳结果，报告所连接的 Milvus 服务器是否支持客户端遥测。

- **LastHeartbeatError** （*error*） -

    返回最近一次心跳失败的错误；如果上一次心跳成功，则返回 nil。

**错误处理：**

- **error**

    验证、请求构建或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 GetTelemetry() 的用法。

```go
import (
	"context"
	"fmt"
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

telemetry := cli.GetTelemetry()
if telemetry != nil {
	fmt.Println("Telemetry client ID:", telemetry.GetClientID())
}
```

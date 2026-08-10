---
title: "GetTelemetry() | Go | v2"
slug: /go/go/v2-Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回客户端遥测管理器，用于收集和报告客户端指标。 | Go | v2"
type: docx
token: DfoBdvU6SoC16Yx8zuEcwgw0nHh
sidebar_position: 5
keywords: 
  - hnsw 算法
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - zilliz
  - zilliz cloud
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

**返回值：**

与此客户端关联的遥测管理器；如果未启用遥测，则返回 nil。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

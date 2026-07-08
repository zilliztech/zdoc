---
title: "GetTelemetry() | Go | v2"
slug: /go/go/v2-Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the client telemetry manager for collecting and reporting client-side metrics. | Go | v2"
type: docx
token: DfoBdvU6SoC16Yx8zuEcwgw0nHh
sidebar_position: 5
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - GetTelemetry()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetTelemetry()

This operation returns the client telemetry manager for collecting and reporting client-side metrics.

```go
func (c *Client) GetTelemetry() *ClientTelemetryManager
```

**RETURN TYPE:**

*ClientTelemetryManager*

**RETURNS:**

The telemetry manager associated with this client, or nil if telemetry is not enabled.

## Example\{#example}

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

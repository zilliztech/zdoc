---
title: "GetTelemetry() | Go | v2"
slug: /go/go/v2-Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
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

**METHODS:**

- **GetClientID** (*string*) -

    Returns the unique client ID (UUID) assigned to this client; it stays stable for the lifetime of the client across gRPC reconnects.

- **GetConfigHash** (*string*) -

    Returns the hash of the telemetry configuration currently in effect.

- **GetMetricsSnapshots** (<em>[]</em>MetricsSnapshot&ast;) -

    Returns all historical metrics snapshots collected by the manager.

- **GetLatestSnapshot** (&ast;*MetricsSnapshot*) -

    Returns the most recent metrics snapshot, or nil when none exists.

- **GetRecentErrors** (<em>[]</em>ErrorInfo&ast;) -

    Returns the most recent errors collected for debugging, up to the requested count.

- **IsReady** (*bool*) -

    Reports whether the client has completed its initial telemetry setup.

- **IsSupported** (*bool*) -

    Reports whether the connected Milvus server supports client-side telemetry, based on the latest heartbeat outcome.

- **LastHeartbeatError** (*error*) -

    Returns the most recent heartbeat failure, or nil when the last heartbeat succeeded.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates GetTelemetry() usage.

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

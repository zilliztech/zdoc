---
title: "GetReplicateConfiguration | Go | v2"
slug: /go/go/v2-CDC-GetReplicateConfiguration
sidebar_label: "GetReplicateConfiguration"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the current replicate configuration from the Milvus cluster. | Go | v2"
type: docx
token: Lq8pdeqGwoAMt0xCa7HctMHznig
sidebar_position: 3
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - GetReplicateConfiguration
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetReplicateConfiguration

This operation gets the current replicate configuration from the Milvus cluster.

```go
func (c *Client) GetReplicateConfiguration(ctx context.Context, opts ...grpc.CallOption) (*commonpb.ReplicateConfiguration, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetReplicateConfiguration().

```go
config, err := cli.GetReplicateConfiguration(ctx)
```

**PARAMETERS:**

- **opts** (*...grpc.CallOption*) -

    Optional gRPC call options.

**RETURN TYPE:**

&ast;*commonpb.ReplicateConfiguration, error*

**RETURNS:**

The current replicate configuration of the cluster, including the configured clusters and replication topologies. Returns an error when the RPC fails.

**PARAMETERS:**

- **result** (&ast;*commonpb.ReplicateConfiguration*) -

    The &ast;commonpb.ReplicateConfiguration value returned by GetReplicateConfiguration().

**ERROR HANDLING:**

- **error**

    The operation fails. The RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates GetReplicateConfiguration() usage.

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

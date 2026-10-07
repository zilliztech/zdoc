---
title: "GetReplicateInfo | Go | v2"
slug: /go/go/v2-CDC-GetReplicateInfo
sidebar_label: "GetReplicateInfo"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets replicate information from the Milvus cluster, such as the salvage checkpoint used after a force failover. | Go | v2"
type: docx
token: QisddwwM3oTHT8x3No8cKfYNnVb
sidebar_position: 4
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - GetReplicateInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetReplicateInfo

This operation gets replicate information from the Milvus cluster, such as the salvage checkpoint used after a force failover.

```go
func (c *Client) GetReplicateInfo(ctx context.Context, req *milvuspb.GetReplicateInfoRequest, opts ...grpc.CallOption) (*milvuspb.GetReplicateInfoResponse, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetReplicateInfo().

```go
resp, err := cli.GetReplicateInfo(ctx, &milvuspb.GetReplicateInfoRequest{
	SourceClusterId: "source-cluster",
	TargetPchannel:  "source-channel-dml_0",
})
```

**PARAMETERS:**

- **req** (*milvuspb.GetReplicateInfoRequest*) -

    The replicate-info request, with the following fields:

    - **SourceClusterId** (*string*) -

        The ID of the source cluster.

    - **TargetPchannel** (*string*) -

        The physical channel to query.

- **opts** (*...grpc.CallOption*) -

    Optional gRPC call options.

**RETURN TYPE:**

&ast;*milvuspb.GetReplicateInfoResponse, error*

**RETURNS:**

The replicate information of the requested source cluster and channel. Use `resp.GetSalvageCheckpoint()` to obtain the checkpoint from which to salvage unsynchronized messages after a force failover. Returns an error when the RPC fails.

**PARAMETERS:**

- **result** (&ast;*milvuspb.GetReplicateInfoResponse*) -

    The &ast;milvuspb.GetReplicateInfoResponse value returned by GetReplicateInfo().

**ERROR HANDLING:**

- **error**

    The operation fails. The RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates GetReplicateInfo() usage.

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

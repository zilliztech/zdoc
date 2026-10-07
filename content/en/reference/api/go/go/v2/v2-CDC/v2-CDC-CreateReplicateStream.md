---
title: "CreateReplicateStream | Go | v2"
slug: /go/go/v2-CDC-CreateReplicateStream
sidebar_label: "CreateReplicateStream"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a replicate stream to transmit replication messages. | Go | v2"
type: docx
token: VUXQdmaliopQf9xzORCcEe3YntZ
sidebar_position: 1
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - CreateReplicateStream
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateReplicateStream

This operation creates a replicate stream to transmit replication messages.

<Admonition type="info" title="Notes">

This interface is deprecated in v3.0.0 — it returns a raw gRPC stream handle, not a Milvus operation.

</Admonition>

```go
func (c *Client) CreateReplicateStream(ctx context.Context, opts ...grpc.CallOption) (milvuspb.MilvusService_CreateReplicateStreamClient, error)
```

## Request Syntax\{#request-syntax}

Creates the request for CreateReplicateStream().

```go
stream, err := cli.CreateReplicateStream(ctx)
```

**PARAMETERS:**

- **opts** (*...grpc.CallOption*) -

    Optional gRPC call options.

**RETURN TYPE:**

*milvuspb.MilvusService_CreateReplicateStreamClient, error*

**RETURNS:**

A bidirectional replicate stream. Use `stream.Send(...)` to transmit `milvuspb.ReplicateMessage` frames and `stream.Recv()` to receive responses. Close the send side with `stream.CloseSend()` when done. Returns an error when the stream cannot be created.

**PARAMETERS:**

- **result** (*milvuspb.MilvusService_CreateReplicateStreamClient*) -

    The milvuspb.MilvusService_CreateReplicateStreamClient value returned by CreateReplicateStream().

**ERROR HANDLING:**

- **error**

    The operation fails. The stream cannot be created. Check the returned error for failure details.

## Example\{#example}

Demonstrates CreateReplicateStream() usage.

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

---
title: "Flush | Go | v2"
slug: /go/go/v2-Management-Flush
sidebar_label: "Flush"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation flushes all inserted data to persistent storage, ensuring data durability. | Go | v2"
type: docx
token: JhQ6djjqiocqgYxLmQOcdgQqnJb
sidebar_position: 9
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - Flush
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Flush

This operation flushes all inserted data to persistent storage, ensuring data durability.

```go
func (c *Client) Flush(ctx context.Context, option FlushOption, callOptions ...grpc.CallOption) (*FlushTask, error)
```

## Request Syntax\{#request-syntax}

Creates the request for Flush().

```go
option := milvusclient.NewFlushOption(collName)

result, err := client.Flush(ctx, option)
```

**PARAMETERS:**

- **collName** (*string*) -

    **[REQUIRED]**

    The coll name.

**BUILDER METHODS:**

- `NewFlushOption(collName string)`

    Creates the request for Flush().

**RETURN TYPE:**

&ast;*FlushTask, error*

**RETURNS:**

A FlushTask that can be used to wait for the flush to complete. Returns an error if the operation fails.

**METHODS:**

- **Await** (*error*) -

    Blocks until the flush is confirmed complete, polling the server at the task's check interval until the collection reports flushed or the context is cancelled.

- **GetFlushStats** (<em>(segIDs []int64, flushSegIDs []int64, flushTs uint64, channelCheckpoints map[string]</em>msgpb.MsgPosition)&ast;) -

    Returns the segment IDs requested for flush, the segment IDs already flushed, the flush timestamp, and the channel checkpoints reported by the server.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates Flush() usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

collectionName := `customized_setup_1`

task, err := cli.Flush(ctx, milvusclient.NewFlushOption(collectionName))
if err != nil {
	// handle err
}

err = task.Await(ctx)
if err != nil {
	// handle err
}
```

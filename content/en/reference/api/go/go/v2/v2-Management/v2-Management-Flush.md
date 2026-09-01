---
title: "Flush() | Go | v2"
slug: /go/go/v2-Management-Flush
sidebar_label: "Flush()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation flushes all inserted data to persistent storage, ensuring data durability. | Go | v2"
type: docx
token: VUaadf505oQMTDx14XgcwJyNnDf
sidebar_position: 9
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - Flush()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Flush()

This operation flushes all inserted data to persistent storage, ensuring data durability.

```go
func (c *Client) Flush(ctx context.Context, option FlushOption, callOptions ...grpc.CallOption) (*FlushTask, error)
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewFlushOption(collName)

result, err := client.Flush(ctx, option)
```

**PARAMETERS:**

- **collName** (*string*)

    The coll name.

**RETURN TYPE:**

**[FlushTask](./v2-Management-FlushTask), error*

**RETURNS:**

A FlushTask that can be used to wait for the flush to complete. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

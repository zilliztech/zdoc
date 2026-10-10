---
title: "GetCompactionState | Go | v2"
slug: /go/go/v2-Management-GetCompactionState
sidebar_label: "GetCompactionState"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the current state of a compaction operation. | Go | v2"
type: docx
token: Uql8dQNxAoemIOxWgoLcORJenKe
sidebar_position: 11
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - GetCompactionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionState

This operation returns the current state of a compaction operation.

```go
func (c *Client) GetCompactionState(ctx context.Context, option GetCompactionStateOption, callOptions ...grpc.CallOption) (entity.CompactionState, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetCompactionState().

```go
option := milvusclient.NewGetCompactionStateOption(compactionID)

result, err := client.GetCompactionState(ctx, option)
```

**PARAMETERS:**

- **compactionID** (*int64*) -

    **[REQUIRED]**

    The compaction ID value.

**BUILDER METHODS:**

- `NewGetCompactionStateOption(compactionID int64)`

    Creates the request for GetCompactionState().

**RETURN TYPE:**

*entity.CompactionState, error*

**RETURNS:**

The current state of the compaction operation. Returns an error if the operation fails.

**PARAMETERS:**

- **CompactionStateRunning** (*entity.CompactionState*) -

    Compaction is currently executing (maps to the underlying CompactionState_Executing state).

- **CompactionStateCompleted** (*entity.CompactionState*) -

    Compaction has completed (maps to the underlying CompactionState_Completed state).

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates GetCompactionState() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

compactID := int64(123)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

state, err := cli.GetCompactionState(ctx, milvusclient.NewGetCompactionStateOption(compactID))
if err != nil {
	// handle err
}
fmt.Println(state)
```

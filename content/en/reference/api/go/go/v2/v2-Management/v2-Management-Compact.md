---
title: "Compact | Go | v2"
slug: /go/go/v2-Management-Compact
sidebar_label: "Compact"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation triggers compaction to merge small data segments into larger ones for better performance. | Go | v2"
type: docx
token: Tex5dSQ3FoaEWGxTo7xcMPISndc
sidebar_position: 2
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - Compact
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Compact

This operation triggers compaction to merge small data segments into larger ones for better performance.

```go
func (c *Client) Compact(ctx context.Context, option CompactOption, callOptions ...grpc.CallOption) (int64, error)
```

## Request Syntax\{#request-syntax}

Creates the request for Compact().

```go
option := milvusclient.NewCompactOption(collectionName)

result, err := client.Compact(ctx, option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

**BUILDER METHODS:**

- `NewCompactOption(collectionName string)`

    Creates the request for Compact().

**RETURN TYPE:**

*int64, error*

**RETURNS:**

The numeric result value. Returns an error if the operation fails.

**PARAMETERS:**

- **result** (*int64*) -

    The int64 value returned by Compact().

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates Compact() usage.

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

compactID, err := cli.Compact(ctx, milvusclient.NewCompactOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(compactID)
```

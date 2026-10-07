---
title: "Close | Go | v2"
slug: /go/go/v2-Client-Close
sidebar_label: "Close"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation closes the client's gRPC connection and releases its resources. Call it when the client is no longer needed, typically via `defer`. | Go | v2"
type: docx
token: W1r5dHqUioRaR7xOyWVcrYPLnvg
sidebar_position: 2
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - Close
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Close

This operation closes the client's gRPC connection and releases its resources. Call it when the client is no longer needed, typically via `defer`.

```go
func (c *Client) Close(ctx context.Context) error
```

## Request Syntax\{#request-syntax}

Creates the request for Close().

````go
func (c *Client) Close(ctx context.Context) error
```

**PARAMETERS:**

- **ctx** (*context.Context*)

    The context for the closing operation. The context is used for cancellation and deadlines.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error if the underlying connection failed to close.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.
````

**PARAMETERS:**

- **ctx** (*context.Context*) -

    The context for the closing operation. The context is used for cancellation and deadlines.

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error if the underlying connection failed to close.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details.

## Example\{#example}

Demonstrates Close() usage.

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
	// handle error
}

defer cli.Close(ctx)
```

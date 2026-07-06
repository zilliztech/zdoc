---
title: "Close() | Go | v2"
slug: /go/go/v2-Client-Close
sidebar_label: "Close()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation closes the client connection and releases associated resources. | Go | v2"
type: docx
token: UN5Yd5ojPoTYrJxAtYzcgFs9nYe
sidebar_position: 2
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - Close()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Close()

This operation closes the client connection and releases associated resources.

```go
func (c *Client) Close(ctx context.Context) error
```

**RETURN TYPE:**

*error*

**RETURNS:**

Returns nil on success, or an error describing what went wrong.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}

err = cli.Close(ctx)
if err != nil {
	log.Fatal("failed to close client:", err)
}
```

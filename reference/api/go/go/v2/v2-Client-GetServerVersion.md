---
title: "GetServerVersion() | Go | v2"
slug: /go/go/v2-Client-GetServerVersion
sidebar_label: "GetServerVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the version of the connected Zilliz Cloud cluster. | Go | v2"
type: docx
token: TUYsd2ko4oAlB4xa9nxc6rhRnpc
sidebar_position: 3
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - GetServerVersion()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersion()

This operation returns the version of the connected Zilliz Cloud cluster.

```go
func (c *Client) GetServerVersion(ctx context.Context, option GetServerVersionOption, callOptions ...grpc.CallOption) (string, error)
```

**RETURN TYPE:**

*string, error*

**RETURNS:**

The requested string value. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

```go
import (
	"context"
	"fmt"
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
defer cli.Close(ctx)

version, err := cli.GetServerVersion(ctx, milvusclient.NewGetServerVersionOption())
if err != nil {
	log.Fatal("failed to get server version:", err)
}
fmt.Println(version)
```

---
title: "FileResource | Go | v2"
slug: /go/go/v2-FileResources-FileResource
sidebar_label: "FileResource"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A FileResource instance represents a file resource in the system, returned by ListFileResources. | Go | v2"
type: docx
token: FyjHdFDWBolmHNxYQ5rcGunqn6d
sidebar_position: 2
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - FileResource
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# FileResource

A FileResource instance represents a file resource in the system, returned by ListFileResources.

```go
type FileResource struct {
    ID int64
    Name string
    Path string
}
```

**FIELDS:**

- **ID** (*int64*) -

    The unique identifier of the file resource.

- **Name** (*string*) -

    The name of the file resource.

- **Path** (*string*) -

    The path of the file resource.

## Example\{#example}

Demonstrates FileResource usage.

```go
import (
	"context"
	"fmt"

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

resources, err := cli.ListFileResources(ctx, milvusclient.NewListFileResourcesOption())
if err != nil {
	// handle error
}

for _, resource := range resources {
	fmt.Println(resource.ID, resource.Name, resource.Path)
}
if err != nil {
	// handle error
}
```

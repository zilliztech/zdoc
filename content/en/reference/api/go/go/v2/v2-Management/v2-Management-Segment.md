---
title: "Segment | Go | v2"
slug: /go/go/v2-Management-Segment
sidebar_label: "Segment"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Segment instance represents a persistent data segment in Milvus. Returned by `GetPersistentSegmentInfo()`. | Go | v2"
type: docx
token: CTUCd5vxBoEyEYxrzgrc58EsnJc
sidebar_position: 25
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - Segment
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Segment

A Segment instance represents a persistent data segment in Milvus. Returned by `GetPersistentSegmentInfo()`.

```go
type Segment struct {
    ID int64
    CollectionID int64
    ParititionID int64
    NumRows int64
    State commonpb.SegmentState
}
```

**FIELDS:**

- **ID** (*int64*) -

    The unique identifier of the segment.

- **CollectionID** (*int64*) -

    The identifier of the collection the segment belongs to.

- **ParititionID** (*int64*) -

    The identifier of the partition the segment belongs to.

- **NumRows** (*int64*) -

    The number of rows in the segment.

- **State** (*commonpb.SegmentState*) -

    The current segment state.

**BUILDER METHODS:**

- `Flushed() bool`

    Returns true when the segment is in the flushed state.

## Example\{#example}

Demonstrates Segment usage.

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

segments, err := cli.GetPersistentSegmentInfo(ctx, milvusclient.NewGetPersistentSegmentInfoOption("books"))
if err != nil {
	// handle error
}
for _, segment := range segments {
	fmt.Println(segment.ID, segment.NumRows)
}
```

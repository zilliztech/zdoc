---
title: "ConsistencyLevel | Go | v2"
slug: /go/go/v2-Collection-ConsistencyLevel
sidebar_label: "ConsistencyLevel"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Specifies the consistency guarantee level for read operations on a collection. | Go | v2"
type: docx
token: CBg7dbZZ7oxxvJx1eV4cJXWGnbe
sidebar_position: 7
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - ConsistencyLevel
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ConsistencyLevel

Specifies the consistency guarantee level for read operations on a collection.

```go
type ConsistencyLevel commonpb
```

**VALUES:**

- **ClStrong** = ConsistencyLevel(commonpb.ConsistencyLevel_Strong)

    Strong consistency. All operations are immediately visible.

- **ClBounded** = ConsistencyLevel(commonpb.ConsistencyLevel_Bounded)

    Bounded staleness with a default 5-second tolerance window.

- **ClSession** = ConsistencyLevel(commonpb.ConsistencyLevel_Session)

    Session consistency. Reads see writes from the same session.

- **ClEventually** = ConsistencyLevel(commonpb.ConsistencyLevel_Eventually)

    Eventually consistent. Best query performance.

- **ClCustomized** = ConsistencyLevel(commonpb.ConsistencyLevel_Customized)

    Custom consistency with a user-specified guarantee timestamp.

## Example\{#example}

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle error
}

defer cli.Close(ctx)

// Use ConsistencyLevel in search to control read freshness
queryVector := []float32{0.1, 0.2, 0.3, 0.4, 0.5}
results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", 10, []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong))
if err != nil {
    // handle error
}
fmt.Println(results)
```

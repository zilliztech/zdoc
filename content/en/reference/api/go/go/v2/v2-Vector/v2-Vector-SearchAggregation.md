---
title: "SearchAggregation | Go | v2"
slug: /go/go/v2-Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation describes one level of bucket aggregation for `Search()`. Use `NewSearchAggregation()` to create an aggregation spec and pass it to a search option via `WithSearchAggregation()`. | Go | v2"
type: docx
token: MSU5d8sIDonFYFxLv0Cc88dvnqL
sidebar_position: 24
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - SearchAggregation
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# SearchAggregation

This operation describes one level of bucket aggregation for `Search()`. Use `NewSearchAggregation()` to create an aggregation spec and pass it to a search option via `WithSearchAggregation()`.

```go
type SearchAggregation struct {
}
```

**BUILDER METHODS:**

- `WithSort(fieldName, direction string)`

    Appends a top hits sorting criterion. `direction` is `asc` or `desc`.

**METHODS:**

- `Validate() error`

## Example\{#example}

Demonstrates SearchAggregation usage.

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
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

agg := milvusclient.NewSearchAggregation([]string{"category"}, 10).
	WithMetric("avg_score", "avg", "score").
	WithOrder("_count", "desc")

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
	"quick_setup",
	100,
	[]entity.Vector{entity.FloatVector{0.1, 0.2, 0.3}},
).WithSearchAggregation(agg))
if err != nil {
	// handle error
}
_ = resultSets
```

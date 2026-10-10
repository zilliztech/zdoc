---
title: "ResultSet | Go | v2"
slug: /go/go/v2-Vector-ResultSet
sidebar_label: "ResultSet"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A ResultSet instance is a search or query result set returned by `Search()`, `HybridSearch()`, `Query()`, and `Get()`. It holds the returned entry count, primary keys, output fields, and scores. | Go | v2"
type: docx
token: N4dudTInDoPuE4xPup5c0a60ngO
sidebar_position: 14
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - ResultSet
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ResultSet

A ResultSet instance is a search or query result set returned by `Search()`, `HybridSearch()`, `Query()`, and `Get()`. It holds the returned entry count, primary keys, output fields, and scores.

```go
type ResultSet struct {
    ResultCount int
    GroupByValue column.Column
    IDs column.Column
    Fields DataSet
    AggregationBuckets []AggregationBucket
    Scores []float32
    Recall float32
    Err error
}
```

**FIELDS:**

- **ResultCount** (*int*) -

    The number of returned entries.

- **GroupByValue** (*column.Column*) -

    The group-by column value when the search/query used grouping.

- **IDs** (*column.Column*) -

    The primary-key column of the matched entities.

- **Fields** (*DataSet*) -

    The output field columns.

- **AggregationBuckets** (*[]AggregationBucket*) -

    Search aggregation results for this query, when an aggregation was requested.

- **Scores** (*[]float32*) -

    The distance to the target vector for each match.

- **Recall** (*float32*) -

    The estimated recall of the search result (estimated by Zilliz Cloud).

- **Err** (*error*) -

    The search error, if any.

**BUILDER METHODS:**

- `GetColumn(fieldName string) column.Column`

    Returns the column with the provided field name.

- `Len() int`

    Returns the number of returned entries.

- `Slice(start, end int) ResultSet`

    Returns a sub-set of the result between the given start and end indexes.

- `Unmarshal(receiver any) error`

    Unmarshals the data set into a slice of pointers to model structs in a row-based way. Note that distance/score is not unmarshaled here.

## Example\{#example}

Demonstrates ResultSet usage.

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

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors))
if err != nil {
	// handle error
}
resultSet := resultSets[0]
fmt.Println(resultSet.ResultCount, resultSet.Scores)
```

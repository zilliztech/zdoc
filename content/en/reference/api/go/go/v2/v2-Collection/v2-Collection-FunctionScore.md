---
title: "FunctionScore | Go | v2"
slug: /go/go/v2-Collection-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A FunctionScore instance models the search-time FunctionScore message a set of scoring Functions (e.g. boost rankers) plus score-option params such as `boostmode` and `functionmode`. Pass it to a search option via `WithFunctionScore()`. | Go | v2"
type: docx
token: XNZ5dgPuHo1PD8xMlAycMzjxnrc
sidebar_position: 30
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionScore
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

A FunctionScore instance models the search-time FunctionScore message: a set of scoring Functions (e.g. boost rankers) plus score-option params such as `boost_mode` and `function_mode`. Pass it to a search option via `WithFunctionScore()`.

```go
type FunctionScore struct {
    Functions []*Function
    Params map[string]string
}
```

**FIELDS:**

- **Functions** (<em>[]</em>Function&ast;) -

    The scoring functions applied during the search.

- **Params** (*map[string]string*) -

    The score-option parameters, such as boost_mode or function_mode.

**BUILDER METHODS:**

- `AddFunction(f *[Function](Function.md)) *FunctionScore`

    Appends a scoring function to the score.

- `WithParam(key string, value any) *FunctionScore`

    Sets a score-option parameter key-value pair, converting the value to its string representation.

**METHODS:**

- `Clone() *FunctionScore`

    Returns a deep copy of fs: functions and params are copied so the returned score does not share mutable state with the source.

## Example\{#example}

Demonstrates FunctionScore usage.

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

rerank := entity.NewFunction().
	WithName("boost").
	WithType(entity.FunctionTypeRerank)

functionScore := entity.NewFunctionScore().AddFunction(rerank).
	WithParam("boost_mode", "sum").
	WithParam("function_mode", "multiply")

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors).
	WithFunctionScore(functionScore))
if err != nil {
	// handle error
}
```

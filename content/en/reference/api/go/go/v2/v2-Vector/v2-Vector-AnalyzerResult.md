---
title: "AnalyzerResult | Go | v2"
slug: /go/go/v2-Vector-AnalyzerResult
sidebar_label: "AnalyzerResult"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "An AnalyzerResult instance represents the tokenized output of a text analyzer, returned by RunAnalyzer. Each result holds the tokens produced from one input text. | Go | v2"
type: docx
token: UnYWdCXhjoKpCbxN8eEcYfB2neO
sidebar_position: 21
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - AnalyzerResult
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AnalyzerResult

An AnalyzerResult instance represents the tokenized output of a text analyzer, returned by RunAnalyzer. Each result holds the tokens produced from one input text.

```go
type AnalyzerResult struct {
    Tokens []*Token
}
```

**FIELDS:**

- **Text** (*string*) -

    The text of the token.

- **StartOffset** (*int64*) -

    The start offset of the token in the input text.

- **EndOffset** (*int64*) -

    The end offset of the token in the input text.

- **Position** (*int64*) -

    The position of the token.

- **PositionLength** (*int64*) -

    The length of the token position.

- **Hash** (*uint32*) -

    The hash of the token.

## Example\{#example}

Demonstrates AnalyzerResult usage.

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

results, err := cli.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption([]string{"Milvus vector database"}))
if err != nil {
	// handle error
}
for _, result := range results {
	for _, token := range result.Tokens {
		fmt.Println(token.Text)
	}
}
```

---
title: "CommitImportResponse | Go | v2"
slug: /go/go/v2-DataImport-CommitImportResponse
sidebar_label: "CommitImportResponse"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A CommitImportResponse instance is the response returned by the `CommitImport()` package function. It embeds `ResponseBase` for the common `Status` and `Message` fields. Use the embedded `CheckStatus()` method to verify the call succeeded. | Go | v2"
type: docx
token: LW1QdbAnlocdjuxaVa8c401Wnyv
sidebar_position: 15
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - CommitImportResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CommitImportResponse

A CommitImportResponse instance is the response returned by the `CommitImport()` package function. It embeds `ResponseBase` for the common `Status` and `Message` fields. Use the embedded `CheckStatus()` method to verify the call succeeded.

```go
type CommitImportResponse struct {
    ResponseBase
}
```

**FIELDS:**

- **Status** (*int*) -

    Inherited from `ResponseBase`. A value of `0` indicates success; any other value indicates an error.

- **Message** (*string*) -

    Inherited from `ResponseBase`. Human-readable error description when `Status` is non-zero.

**BUILDER METHODS:**

- `CheckStatus()`

    This validates the response status. Returns nil when `Status == 0`; otherwise returns a formatted error containing `Status` and `Message`.

## Example\{#example}

Demonstrates CommitImportResponse usage.

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

resp, err := milvusclient.CommitImport(ctx, milvusclient.NewCommitImportOption("<jobId>", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
if err := resp.CheckStatus(); err != nil {
	// handle non-zero status
}
```

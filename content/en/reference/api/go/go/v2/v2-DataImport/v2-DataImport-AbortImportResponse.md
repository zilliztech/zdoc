---
title: "AbortImportResponse | Go | v2"
slug: /go/go/v2-DataImport-AbortImportResponse
sidebar_label: "AbortImportResponse"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "An AbortImportResponse instance is the response returned by the `AbortImport()` package function. It embeds `ResponseBase` for the common `Status` and `Message` fields. Use the embedded `CheckStatus()` method to verify the call succeeded. | Go | v2"
type: docx
token: Qle2dHiIuozcv4x6la2cZr7cnWe
sidebar_position: 12
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - AbortImportResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AbortImportResponse

An AbortImportResponse instance is the response returned by the `AbortImport()` package function. It embeds `ResponseBase` for the common `Status` and `Message` fields. Use the embedded `CheckStatus()` method to verify the call succeeded.

```go
type AbortImportResponse struct {
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

Demonstrates AbortImportResponse usage.

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

resp, err := milvusclient.AbortImport(ctx, milvusclient.NewAbortImportOption("<jobId>"))
if err != nil {
	// handle error
}
if err := resp.CheckStatus(); err != nil {
	// handle non-zero status
}
```

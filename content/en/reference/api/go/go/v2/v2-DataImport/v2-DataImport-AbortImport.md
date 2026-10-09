---
title: "AbortImport | Go | v2"
slug: /go/go/v2-DataImport-AbortImport
sidebar_label: "AbortImport"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation aborts a bulk import job via the RESTful import API. | Go | v2"
type: docx
token: MYVqdXiLjoYbB2xQeQHcjrf1nmu
sidebar_position: 10
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - AbortImport
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AbortImport

This operation aborts a bulk import job via the RESTful import API.

<Admonition type="info" title="Notes">

Use it to stop an in-flight import job and discard the data staged so far.

</Admonition>

<Admonition type="info" title="Notes">

`AbortImport()` is a package-level function in `github.com/milvus-io/milvus/client/v3/bulkwriter`, not a method on `*milvusclient.Client`. It speaks the REST `/v2/vectordb/jobs/import/abort` endpoint directly, so it works with both Milvus open-source clusters (use `NewAbortImportOption`) and Zilliz Cloud (use `NewCloudAbortImportOption`).

</Admonition>

```go
func AbortImport(ctx context.Context, option *AbortImportOption) (*AbortImportResponse, error)
```

## Request Syntax\{#request-syntax}

Creates the request for AbortImport().

```go
option := bulkwriter.NewAbortImportOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.AbortImport(ctx, option)
```

**PARAMETERS:**

- **ctx** (*context.Context*) -

    The context for cancellation and deadlines. The HTTP request inherits this context, so canceling it aborts the in-flight call.

- **option** (*AbortImportOption*) -

    The abort option created with `NewAbortImportOption()` for self-hosted Milvus or `NewCloudAbortImportOption()` for Zilliz Cloud. The job ID returned by `BulkImport()` is required.

**RETURN TYPE:**

&ast;*AbortImportResponse, error*

**RETURNS:**

An `AbortImportResponse` embedding the common `Status` and `Message` fields. Returns an error if the request cannot be marshaled, the HTTP call fails, or the server returns a non-zero status.

```go
type AbortImportResponse struct {
    ResponseBase
}
```

**PARAMETERS:**

- **Status** (*int*) -

    Inherited from `ResponseBase`. A value of `0` indicates success; any other value indicates an error.

- **Message** (*string*) -

    Inherited from `ResponseBase`. Human-readable error description when `Status` is non-zero.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details. Common failures include malformed option payloads, network errors, authentication rejection (when `WithAPIKey` is set incorrectly), and server-side validation errors surfaced through the response status.

## Example\{#example}

Demonstrates AbortImport() usage.

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
jobID := "453291002847301"

option := bulkwriter.NewAbortImportOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.AbortImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

if resp.Status != 0 {
	log.Fatalf("abort import failed: %s", resp.Message)
}
```

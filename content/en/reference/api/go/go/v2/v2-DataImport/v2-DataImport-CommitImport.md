---
title: "CommitImport | Go | v2"
slug: /go/go/v2-DataImport-CommitImport
sidebar_label: "CommitImport"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation commits a bulk import job via the RESTful import API. Use it for import modes that stage data first and commit at the end, such as when the import job requires an explicit final commit before the imported data becomes queryable. | Go | v2"
type: docx
token: YimZdGvFVoS8k6xn4yWczFxqnwg
sidebar_position: 13
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - CommitImport
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CommitImport

This operation commits a bulk import job via the RESTful import API. Use it for import modes that stage data first and commit at the end, such as when the import job requires an explicit final commit before the imported data becomes queryable. 

<Admonition type="info" title="Notes">

`CommitImport()` is a package-level function in `github.com/milvus-io/milvus/client/v3/bulkwriter`, not a method on `*milvusclient.Client`. It speaks the REST `/v2/vectordb/jobs/import/commit` endpoint directly, so it works with both Milvus open-source clusters (use `NewCommitImportOption`) and Zilliz Cloud (use `NewCloudCommitImportOption`).

</Admonition>

```go
func CommitImport(ctx context.Context, option *CommitImportOption) (*CommitImportResponse, error)
```

## Request Syntax\{#request-syntax}

Creates the request for CommitImport().

```go
option := bulkwriter.NewCommitImportOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.CommitImport(ctx, option)
```

**PARAMETERS:**

- **ctx** (*context.Context*) -

    The context for cancellation and deadlines. The HTTP request inherits this context, so canceling it aborts the in-flight call.

- **option** (*CommitImportOption*) -

    The commit option created with `NewCommitImportOption()` for self-hosted Milvus or `NewCloudCommitImportOption()` for Zilliz Cloud. The job ID returned by `BulkImport()` is required.

**RETURN TYPE:**

&ast;*CommitImportResponse, error*

**RETURNS:**

A `CommitImportResponse` embedding the common `Status` and `Message` fields. Returns an error if the request cannot be marshaled, the HTTP call fails, or the server returns a non-zero status.

```go
type CommitImportResponse struct {
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

Demonstrates CommitImport() usage.

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

option := bulkwriter.NewCommitImportOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

resp, err := bulkwriter.CommitImport(ctx, option)
if err != nil {
	log.Fatal(err)
}

if resp.Status != 0 {
	log.Fatalf("commit import failed: %s", resp.Message)
}
```

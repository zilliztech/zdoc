---
title: "GetImportProgress() | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgress
sidebar_label: "GetImportProgress()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This function retrieves detailed progress for a single bulk import job via the RESTful API. Use it to poll a job submitted by `BulkImport()` until its `State` reaches `Completed` or `Failed`. The response includes overall progress, total imported/expected rows, file size, and per-file progress details. | Go | v2"
type: docx
token: V05sd0bGjo33Cux0j9DcrNKTndh
sidebar_position: 4
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportProgress()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetImportProgress()

This function retrieves detailed progress for a single bulk import job via the RESTful API. Use it to poll a job submitted by `BulkImport()` until its `State` reaches `Completed` or `Failed`. The response includes overall progress, total imported/expected rows, file size, and per-file progress details.

<Admonition type="info" icon="📘" title="Notes">

`GetImportProgress()` is a package-level function in `github.com/milvus-io/milvus/client/v2/bulkwriter`. It calls the REST `/v2/vectordb/jobs/import/describe` endpoint and works with both Milvus open-source clusters (use `NewGetImportProgressOption`) and Zilliz Cloud (use `NewCloudGetImportProgressOption`).

</Admonition>

```go
func GetImportProgress(ctx context.Context, option *GetImportProgressOption) (*GetImportProgressResponse, error)
```

## Request Syntax\{#request-syntax}

```go
option := bulkwriter.NewGetImportProgressOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.GetImportProgress(ctx, option)
```

**PARAMETERS:**

- **ctx** (*context.Context*) -
The context for cancellation and deadlines. The HTTP request inherits this context, so canceling it aborts the in-flight call.

- **option** (*GetImportProgressOption*) -
The progress option created with `NewGetImportProgressOption()` for self-hosted Milvus or `NewCloudGetImportProgressOption()` for Zilliz Cloud. The job ID returned by `BulkImport()` is required. Required.

**RETURN TYPE:**

*\*GetImportProgressResponse, error*

**RETURNS:**

A `GetImportProgressResponse` whose `Data` field contains an `ImportProgressData` with overall progress, row counts, completion time, and per-file `Details`. Returns an error if the request cannot be marshaled, the HTTP call fails, or the server returns a non-zero status.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details. Failures include malformed options, network issues, an unknown or expired job ID, and server-side errors reported through the response status.

## Example\{#example}

```go
import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/milvus-io/milvus/client/v2/bulkwriter"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "http://YOUR_CLUSTER_ENDPOINT"
jobID := "453291002847301"

option := bulkwriter.NewGetImportProgressOption(milvusAddr, jobID).
	WithAPIKey("YOUR_CLUSTER_TOKEN")

for {
	resp, err := bulkwriter.GetImportProgress(ctx, option)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("State=%s Progress=%d%% Rows=%d/%d\n",
		resp.Data.State, resp.Data.Progress, resp.Data.ImportedRows, resp.Data.TotalRows)

	if resp.Data.State == "Completed" || resp.Data.State == "Failed" {
		break
	}
	time.Sleep(2 * time.Second)
}
```

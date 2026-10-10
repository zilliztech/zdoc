---
title: "GetImportProgress | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgress
sidebar_label: "GetImportProgress"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves detailed progress for a single bulk import job via the RESTful API. Use it to poll a job submitted by `BulkImport()` until its `State` reaches `Completed` or `Failed`. The response includes overall progress, total imported/expected rows, file size, and per-file progress details. | Go | v2"
type: docx
token: XwEZdXtExoaU4IxWu4yc6HiQnph
sidebar_position: 4
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportProgress
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetImportProgress

This operation retrieves detailed progress for a single bulk import job via the RESTful API. Use it to poll a job submitted by `BulkImport()` until its `State` reaches `Completed` or `Failed`. The response includes overall progress, total imported/expected rows, file size, and per-file progress details. 

<Admonition type="info" title="Notes">

`GetImportProgress()` is a package-level function in `github.com/milvus-io/milvus/client/v3/bulkwriter`. It calls the REST `/v2/vectordb/jobs/import/describe` endpoint and works with both Milvus open-source clusters (use `NewGetImportProgressOption`) and Zilliz Cloud (use `NewCloudGetImportProgressOption`).

</Admonition>

```go
func GetImportProgress(ctx context.Context, option *GetImportProgressOption) (*GetImportProgressResponse, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetImportProgress().

```go
option := bulkwriter.NewGetImportProgressOption(uri, jobID).
    WithAPIKey(apiKey)

resp, err := bulkwriter.GetImportProgress(ctx, option)
```

**PARAMETERS:**

- **ctx** (*context.Context*) -

    The context for cancellation and deadlines. The HTTP request inherits this context, so canceling it aborts the in-flight call.

- **option** ([GetImportProgressOption](./v2-DataImport-GetImportProgressOption)) -

    The progress option created with `NewGetImportProgressOption()` for self-hosted Milvus or `NewCloudGetImportProgressOption()` for Zilliz Cloud. The job ID returned by `BulkImport()` is required. Required.

**BUILDER METHODS:**

- `NewGetImportProgressOption(uri string, jobID string)`

    Creates the request for GetImportProgress().

- `NewCloudGetImportProgressOption(uri string, jobID string, apiKey string, clusterID string)`

    Creates the request for GetImportProgress() against Zilliz Cloud.

**RETURN TYPE:**

&ast;*GetImportProgressResponse, error*

**RETURNS:**

A `GetImportProgressResponse` whose `Data` field contains an `ImportProgressData` with overall progress, row counts, completion time, and per-file `Details`. Returns an error if the request cannot be marshaled, the HTTP call fails, or the server returns a non-zero status.

```go
type GetImportProgressResponse struct {
    ResponseBase
    Data *ImportProgressData `json:"data"`
}

type ImportProgressData struct {
    CollectionName string                  `json:"collectionName"`
    JobID          string                  `json:"jobId"`
    CompleteTime   string                  `json:"completeTime"`
    State          string                  `json:"state"`
    Progress       int64                   `json:"progress"`
    ImportedRows   int64                   `json:"importedRows"`
    TotalRows      int64                   `json:"totalRows"`
    Reason         string                  `json:"reason"`
    FileSize       int64                   `json:"fileSize"`
    Details        []*ImportProgressDetail `json:"details"`
}

type ImportProgressDetail struct {
    FileName     string `json:"fileName"`
    FileSize     int64  `json:"fileSize"`
    Progress     int64  `json:"progress"`
    CompleteTime string `json:"completeTime"`
    State        string `json:"state"`
    ImportedRows int64  `json:"importedRows"`
    TotalRows    int64  `json:"totalRows"`
}
```

**PARAMETERS:**

- **Status** (*int*) -

    Inherited from `ResponseBase`. A value of `0` indicates success.

- **Message** (*string*) -

    Inherited from `ResponseBase`. Error description when `Status` is non-zero.

- **Data** (&ast;*ImportProgressData*) -

    The progress payload for the requested job. **ImportProgressData fields:**.

- **CollectionName** (*string*) -

    The collection the job targets.

- **JobID** (*string*) -

    The unique identifier of the import job.

- **State** (*string*) -

    The current job state. Common values include `Pending`, `Importing`, `Completed`, and `Failed`.

- **Progress** (*int64*) -

    The overall completion percentage in the range `[0, 100]`.

- **ImportedRows** (*int64*) -

    The number of rows already imported into the collection.

- **TotalRows** (*int64*) -

    The total number of rows expected from all source files.

- **FileSize** (*int64*) -

    The aggregate size in bytes of all source files.

- **CompleteTime** (*string*) -

    The job completion timestamp; empty until the job reaches a terminal state.

- **Reason** (*string*) -

    Failure reason when `State == "Failed"`; empty otherwise.

- **Details** (*[]\ImportProgressDetail*) -

    Per-file progress entries with the same shape as the parent fields, scoped to one source file each.

**ERROR HANDLING:**

- **error**

    The operation fails. Check `err != nil` for failure details. Failures include malformed options, network issues, an unknown or expired job ID, and server-side errors reported through the response status.

## Example\{#example}

Demonstrates GetImportProgress() usage.

```go
import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/milvus-io/milvus/client/v3/bulkwriter"
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

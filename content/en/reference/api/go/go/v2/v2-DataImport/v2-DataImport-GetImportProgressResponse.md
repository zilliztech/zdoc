---
title: "GetImportProgressResponse | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgressResponse
sidebar_label: "GetImportProgressResponse"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A GetImportProgressResponse instance is the response returned by the `GetImportProgress()` package function. It embeds `ResponseBase` and exposes the detailed progress payload through `ImportProgressData`, which includes both overall job statistics and a per-file `Details` slice. | Go | v2"
type: docx
token: UATqdiZsKo3HahxZYhQcZp6GnKg
sidebar_position: 6
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportProgressResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetImportProgressResponse

A GetImportProgressResponse instance is the response returned by the `GetImportProgress()` package function. It embeds `ResponseBase` and exposes the detailed progress payload through `ImportProgressData`, which includes both overall job statistics and a per-file `Details` slice.

```go
type GetImportProgressResponse struct {
    ResponseBase
    Data *ImportProgressData
}
```

**FIELDS:**

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

## Example\{#example}

Demonstrates GetImportProgressResponse usage.

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

progress, err := milvusclient.GetImportProgress(ctx, milvusclient.NewGetImportProgressOption("<jobId>"))
if err != nil {
	// handle error
}
fmt.Println(progress.Data.State, progress.Data.ImportedRows, progress.Data.TotalRows)
```

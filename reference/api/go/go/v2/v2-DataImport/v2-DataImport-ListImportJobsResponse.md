---
title: "ListImportJobsResponse | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsResponse
sidebar_label: "ListImportJobsResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This class represents the response returned by the `ListImportJobs()` package function. It embeds `ResponseBase` for status fields and exposes the paginated job list through a nested `ListImportJobData` struct. Each entry in `Data.Records` is an `ImportJobRecord` describing one bulk import job. | Go | v2"
type: docx
token: C6WkdFvLuon9i8xlu3FcomiDn0b
sidebar_position: 9
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobsResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobsResponse

This class represents the response returned by the `ListImportJobs()` package function. It embeds `ResponseBase` for status fields and exposes the paginated job list through a nested `ListImportJobData` struct. Each entry in `Data.Records` is an `ImportJobRecord` describing one bulk import job.

```go
type ListImportJobsResponse struct {
    ResponseBase
    Data *ListImportJobData `json:"data"`
}

type ListImportJobData struct {
    Records []*ImportJobRecord `json:"records"`
}

type ImportJobRecord struct {
    JobID          string `json:"jobId"`
    CollectionName string `json:"collectionName"`
    State          string `json:"state"`
    Progress       int64  `json:"progress"`
    Reason         string `json:"reason"`
}
```

**FIELDS:**

- **Status** (*int*) -
Inherited from `ResponseBase`. A value of `0` indicates success.

- **Message** (*string*) -
Inherited from `ResponseBase`. Error description when `Status` is non-zero.

- **Data.Records** (*[]\*ImportJobRecord*) -
The slice of job records returned for the current page. May be empty when no jobs match the filter.

**ImportJobRecord fields:**

- **JobID** (*string*) -
The unique identifier of the import job.

- **CollectionName** (*string*) -
The collection the job targets.

- **State** (*string*) -
The current job state. Common values include `Pending`, `Importing`, `Completed`, and `Failed`.

- **Progress** (*int64*) -
The completion percentage in the range `[0, 100]`.

- **Reason** (*string*) -
Failure reason when `State == "Failed"`; empty otherwise.


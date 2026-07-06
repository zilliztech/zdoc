---
title: "BulkImportResponse | Go | v2"
slug: /go/go/v2-DataImport-BulkImportResponse
sidebar_label: "BulkImportResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This class represents the response returned by the `BulkImport()` package function. It embeds `ResponseBase` for the common `Status` and `Message` fields, and exposes the assigned import job ID under `Data.JobID`. Use the embedded `CheckStatus()` method to verify the call succeeded before reading `Data`. | Go | v2"
type: docx
token: A3WWdqm52oLqtuxaR9EcjmybnwT
sidebar_position: 3
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImportResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImportResponse

This class represents the response returned by the `BulkImport()` package function. It embeds `ResponseBase` for the common `Status` and `Message` fields, and exposes the assigned import job ID under `Data.JobID`. Use the embedded `CheckStatus()` method to verify the call succeeded before reading `Data`.

```go
type BulkImportResponse struct {
    ResponseBase
    Data struct {
        JobID string `json:"jobId"`
    } `json:"data"`
}
```

**FIELDS:**

- **Status** (*int*) -
Inherited from `ResponseBase`. A value of `0` indicates success; any other value indicates an error.

- **Message** (*string*) -
Inherited from `ResponseBase`. Human-readable error description when `Status` is non-zero.

- **Data.JobID** (*string*) -
The unique identifier assigned to the submitted bulk import job. Pass this to `GetImportProgress()` to track completion.

**METHODS:**

- `CheckStatus()`

    This validates the response status. Returns nil when `Status == 0`; otherwise returns a formatted error containing `Status` and `Message`.
---
title: "GetRefreshExternalCollectionProgress() | Go | v2"
slug: /go/go/v2-Collection-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the progress of a specified external collection refresh job. | Go | v2"
type: docx
token: OTM3db7aroAXAYxrTy4cyVbwnGG
sidebar_position: 31
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - GetRefreshExternalCollectionProgress()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

This operation returns the progress of a specified external collection refresh job.

```go
func (c *Client) GetRefreshExternalCollectionProgress(ctx context.Context, option GetRefreshExternalCollectionProgressOption, callOptions ...grpc.CallOption) (*entity.RefreshExternalCollectionJobInfo, error)
```

## Request Syntax\{#request-syntax}

Creates the request for GetRefreshExternalCollectionProgress().

```go
option := client.NewGetRefreshExternalCollectionProgressOption(jobID)

result, err := client.GetRefreshExternalCollectionProgress(option)
```

**PARAMETERS:**

- **jobID** (*int64*) -

    **[REQUIRED]**

**RETURN TYPE:**

&ast;*entity.RefreshExternalCollectionJobInfo*

**RETURNS:**

A type struct that records the details of the specified external collection refresh job.

```go
type RefreshExternalCollectionJobInfo struct {
    JobID          int64
    CollectionName string
    State          RefreshExternalCollectionState
    Progress       int64
    Reason         string
    ExternalSource string
    StartTime      int64
    EndTime        int64
}
```

**PARAMETERS:**

- **JobID** (*int64*) -

    The unique identifier of the refresh job.

- **CollectionName** (*string*) -

    The name of the collection being refreshed.

- **State** ([RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)) -

    The current state of the refresh job.

- **Progress** (*int64*) -

    The progress percentage of the refresh job.

- **Reason** (*string*) -

    Additional information or reason for the current state.

- **ExternalSource** (*string*) -

    The external data source identifier.

- **ExternalSpec** (*string*) -

    The external data source specification (JSON), describing the file format and object storage settings.

- **StartTime** (*int64*) -

    The Unix timestamp when the job started.

- **EndTime** (*int64*) -

    The Unix timestamp when the job completed.

**ERROR HANDLING:**

- **error**

    Validation, request construction, or the RPC fails. Check the returned error for failure details.

## Example\{#example}

Demonstrates GetRefreshExternalCollectionProgress() usage.

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))

jobID := refreshResult.JobID

for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))

    fmt.Printf("State: %s\n", progress.State)

    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```

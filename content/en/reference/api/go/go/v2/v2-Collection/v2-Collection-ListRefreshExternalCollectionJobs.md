---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the external collection refresh jobs of all or specified collections. | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 26
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - ListRefreshExternalCollectionJobs()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

This operation lists the external collection refresh jobs of all or specified collections.

```go
func (c *Client) ListRefreshExternalCollectionJobs(ctx context.Context, option ListRefreshExternalCollectionJobsOption, callOptions ...grpc.CallOption) ([]*entity.RefreshExternalCollectionJobInfo, error) {
```

## Request Syntax\{#request-syntax}

```go
option := client.NewListRefreshExternalCollectionJobsOption(collectionName)

result, err := client.ListRefreshExternalCollectionJobs(option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    The name of the target collection. If this parameter is left unspecified, the refresh jobs of all external collections are turned.

**RETURN TYPE:**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**RETURNS:**

A list of *entity.RefreshExternalCollectionJobInfo* struct, each recording the details of the an external collection refresh job.

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

PARAMETERS:

**PARAMETERS:**

- **JobID** (*int64*) -

    The job ID specified in the current request.

- **CollectionName** (*string*) -

    The name of the external collection specified in `RefreshExternalCollection()`.

- **State** (*string*) -

    The current state of the specified job. Possible values are:

    - RefreshPending

    - RefreshInProgress

    - RefreshFailed

    - RefreshCompleted

- **Progress** (*int64*) -

    The current progress of the specified job. The value is an integer ranging from 0 to 100.

- **Reason** (*string*) -

    The error prompt if the refresh operation failed. It is an empty string in normal cases.

- **ExternalSource** (*string*) -

    The external source URI specified in `RefreshExternalCollection()`.

- **StartTime** (*int64*) -

    The timestamp in milliseconds at which the specified job starts.

- **EndTime** (*int64*) -  

    The timestamp in milliseconds at which the specified job ends.

## Example\{#example}

```go
// List refresh jobs of a specified collection
option := client.NewListRefreshExternalCollectionJobsOption("test_collection")

// List refresh jobs of all external collections
option = client.NewListRefreshExternalCollectionJobsOption()

result, err = client.ListRefreshExternalCollectionJobs(option)
```

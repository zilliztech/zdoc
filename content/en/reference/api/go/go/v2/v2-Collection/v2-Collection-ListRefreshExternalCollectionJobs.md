---
title: "ListRefreshExternalCollectionJobs() | Go | v2"
slug: /go/go/v2-Collection-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the external collection refresh jobs of all or specified collections. | Go | v2"
type: docx
token: KTeqdqUI2o3YO1xg3EXcJqGcnbe
sidebar_position: 32
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
func (c *Client) ListRefreshExternalCollectionJobs(ctx context.Context, option ListRefreshExternalCollectionJobsOption, callOptions ...grpc.CallOption) ([]*entity.RefreshExternalCollectionJobInfo, error)
```

## Request Syntax\{#request-syntax}

Creates the request for ListRefreshExternalCollectionJobs().

```go
option := client.NewListRefreshExternalCollectionJobsOption(collectionName)

result, err := client.ListRefreshExternalCollectionJobs(option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    The name of the target collection. If this parameter is left unspecified, the refresh jobs of all external collections are turned.

**RETURN TYPE:**

*[]&ast;entity.RefreshExternalCollectionJobInfo*

**RETURNS:**

A list of *entity.RefreshExternalCollectionJobInfo* struct, each recording the details of the an external collection refresh job.

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

Demonstrates ListRefreshExternalCollectionJobs() usage.

```go
// List refresh jobs of a specified collection
option := client.NewListRefreshExternalCollectionJobsOption("test_collection")

result, err = client.ListRefreshExternalCollectionJobs(option)
```

---
title: "RefreshExternalCollection() | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation scans the data files in the schema-defined external storage and generates metadata files that record their mapping relationship to those data files. | Go | v2"
type: docx
token: Mw42dp2VZoN4gFxdiSYcxDB8n0g
sidebar_position: 27
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

This operation scans the data files in the schema-defined external storage and generates metadata files that record their mapping relationship to those data files.

```go
func (c *Client) RefreshExternalCollection(ctx context.Context, option RefreshExternalCollectionOption, callOptions ...grpc.CallOption) (*RefreshExternalCollectionResult, error)
```

## Request Syntax\{#request-syntax}

```go
option := client.NewRefreshExternalCollectionOption(collectionName).
    WithExternalSource(externalSource string).
    WithExternalSpec(externalSpec string).
    WithDbName(dbName string)
    
result, err := client.RefreshExternalCollection(option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    The name of an existing external collection.

**BUILDER METHODS:**

- `WithExternalSource(externalSource string)`

    This sets the source data URI, which should be the name of an accessible external volume..

- `WithExternalSpec(externalSpec string)`

    The external source specifications, which are a set of secondary parameters:

    - **format** (*string*) - 

        The format of the target source data files.

        Possible values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

- `WithDbName(dbName string)`

    The name of the database to which the target external collection belongs.

**RETURN TYPE:**

*&ast;RefreshExternalCollectionResult*

**RETURNS:**

A type struct of the following shape.

```go
type RefreshExternalCollectionResult struct {
    JobID int64
}
```

**PARAMETERS:**

- **JobID** (*int64*) -

    An integer that indicates an asynchronous job that has been created.

## Examples\{#examples}

```python
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

---
title: "AbortImportOption | Go | v2"
slug: /go/go/v2-DataImport-AbortImportOption
sidebar_label: "AbortImportOption"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "An AbortImportOption instance configures a request to abort a bulk import job via the RESTful API. | Go | v2"
type: docx
token: DJ3VdUmf7o3QCdx1mTecsDaunHf
sidebar_position: 11
keywords: 
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - AbortImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AbortImportOption

An AbortImportOption instance configures a request to abort a bulk import job via the RESTful API.

<Admonition type="info" title="Notes">

Construct it with `NewAbortImportOption()` for self-hosted Milvus, or `NewCloudAbortImportOption()` for Zilliz Cloud.

</Admonition>

<Admonition type="info" title="Notes">

Chain `WithAPIKey()` to add an authorization token.

</Admonition>

```go
type AbortImportOption struct {
    URL string
    JobID string
    ClusterID string
    APIKey string
}
```

**FIELDS:**

- **URL** (*string*) -

    The base URL of the Milvus or Zilliz Cloud cluster. Do not include the path; the function appends `/v2/vectordb/jobs/import/abort` automatically.

- **JobID** (*string*) -

    The unique identifier of the import job to abort. Pass the value returned by `BulkImport()`. Required.

- **ClusterID** (*string*) -

    The Zilliz Cloud cluster ID. Optional; used only for cloud imports.

- **APIKey** (*string*) -

    The authorization token sent as a `Bearer` header. Optional; required when the server enforces token-based auth.

**BUILDER METHODS:**

- `WithAPIKey(key string)`

    This sets the authorization token sent as a `Bearer` header.

- `NewAbortImportOption(uri string, jobID string)`

    Creates the request for AbortImport().

- `NewCloudAbortImportOption(uri string, jobID string, apiKey string, clusterID string)`

    Creates the request for AbortImport() against Zilliz Cloud.

**METHODS:**

- `GetRequest() ([]byte, error)`

## Example\{#example}

Demonstrates AbortImportOption usage.

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

err := cli.AbortImport(ctx, milvusclient.NewAbortImportOption("<jobId>"))
if err != nil {
	// handle error
}
```

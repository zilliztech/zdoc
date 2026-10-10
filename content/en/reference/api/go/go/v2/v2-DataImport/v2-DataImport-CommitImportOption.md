---
title: "CommitImportOption | Go | v2"
slug: /go/go/v2-DataImport-CommitImportOption
sidebar_label: "CommitImportOption"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A CommitImportOption instance configures a request to commit a bulk import job via the RESTful API. Construct it with `NewCommitImportOption()` for self-hosted Milvus, or `NewCloudCommitImportOption()` for Zilliz Cloud. Chain `WithAPIKey()` to add an authorization token. | Go | v2"
type: docx
token: BS6adI4NSoFJgyxp7dDcSbitnnb
sidebar_position: 14
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - CommitImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CommitImportOption

A CommitImportOption instance configures a request to commit a bulk import job via the RESTful API. Construct it with `NewCommitImportOption()` for self-hosted Milvus, or `NewCloudCommitImportOption()` for Zilliz Cloud. Chain `WithAPIKey()` to add an authorization token.

```go
type CommitImportOption struct {
    URL string
    JobID string
    ClusterID string
    APIKey string
}
```

**FIELDS:**

- **URL** (*string*) -

    The base URL of the Milvus or Zilliz Cloud cluster. Do not include the path; the function appends `/v2/vectordb/jobs/import/commit` automatically.

- **JobID** (*string*) -

    The unique identifier of the import job to commit. Pass the value returned by `BulkImport()`. Required.

- **ClusterID** (*string*) -

    The Zilliz Cloud cluster ID. Optional; used only for cloud imports.

- **APIKey** (*string*) -

    The authorization token sent as a `Bearer` header. Optional; required when the server enforces token-based auth.

**BUILDER METHODS:**

- `WithAPIKey(key string)`

    This sets the authorization token sent as a `Bearer` header.

- `NewCommitImportOption(uri string, jobID string)`

    Creates the request for CommitImport().

- `NewCloudCommitImportOption(uri string, jobID string, apiKey string, clusterID string)`

    Creates the request for CommitImport() against Zilliz Cloud.

**METHODS:**

- `GetRequest() ([]byte, error)`

## Example\{#example}

Demonstrates CommitImportOption usage.

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

err := cli.CommitImport(ctx, milvusclient.NewCommitImportOption("<jobId>", "https://example.com/rows.json"))
if err != nil {
	// handle error
}
```

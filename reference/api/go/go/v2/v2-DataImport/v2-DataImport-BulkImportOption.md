---
title: "BulkImportOption | Go | v2"
slug: /go/go/v2-DataImport-BulkImportOption
sidebar_label: "BulkImportOption"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "BulkImportOption | Go | v2"
type: docx
token: ZG2ndWgIwogyOAxAzH5ciWY3nlb
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImportOption

BulkImportOption

This type configures a bulk import request for the RESTful import API. Construct it with `NewBulkImportOption()` for self-hosted Milvus, or `NewCloudBulkImportOption()` for Zilliz Cloud. After construction, chain `With*` builder methods to supply optional fields such as partition name, API key, and extra options.

```go
type BulkImportOption struct {
    URL            string
    CollectionName string
    Files          [][]string
    PartitionName  string
    APIKey         string
    ObjectURL      string
    ClusterID      string
    AccessKey      string
    SecretKey      string
    Options        map[string]string
}
```

**FIELDS:**

- **URL** (*string*) -<br/>
  The base URL of the Milvus or Zilliz Cloud cluster. Do not include the path; the function appends `/v2/vectordb/jobs/import/create` automatically.

- **CollectionName** (*string*) -<br/>
  The name of the target collection. Required.

- **Files** (*[][]string*) -<br/>
  The list of file paths to import. Each inner slice represents a batch of files that will be imported together. Used with `NewBulkImportOption()`. Optional for cloud imports.

- **PartitionName** (*string*) -<br/>
  The target partition within the collection. Optional; if omitted, data lands in the default partition.

- **APIKey** (*string*) -<br/>
  The authorization token sent as a `Bearer` header. Optional; required when the server enforces token-based auth.

- **ObjectURL** (*string*) -<br/>
  The S3 or compatible object URL for cloud imports. Used with `NewCloudBulkImportOption()`. Optional.

- **ClusterID** (*string*) -<br/>
  The Zilliz Cloud cluster ID. Used with `NewCloudBulkImportOption()`. Optional.

- **AccessKey** (*string*) -<br/>
  The access key for the object store. Optional.

- **SecretKey** (*string*) -<br/>
  The secret key for the object store. Optional.

- **Options** (*map[string]string*) -<br/>
  Extra key-value parameters forwarded to the import API. Use `WithOption()` to add entries.

**BUILDER METHODS:**

- `WithPartition(partitionName string)`<br/>
  This sets the target partition for the imported data.

- `WithAPIKey(key string)`<br/>
  This sets the authorization token sent as a `Bearer` header.

- `WithOption(key, value string)`<br/>
  This adds an extra key-value parameter to the request payload. Call multiple times to add more entries.

**CONSTRUCTORS:**

- `NewBulkImportOption(uri string, collectionName string, files [][]string)`<br/>
  This creates a BulkImportOption for self-hosted Milvus clusters. The `files` argument is a list of batches, where each batch is a slice of file paths.

- `NewCloudBulkImportOption(uri string, collectionName string, apiKey string, objectURL string, clusterID string, accessKey string, secretKey string)`<br/>
  This creates a BulkImportOption for Zilliz Cloud clusters. Uses `ObjectURL` instead of `Files` for cloud object storage.


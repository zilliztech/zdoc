---
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Lists bulk import jobs in Milvus or Zilliz Cloud. | Java | v2"
type: docx
token: KZc2dLt74oh6VzxS4EYc7cEsn3d
sidebar_position: 4
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listImportJobs()

Lists bulk import jobs in Milvus or Zilliz Cloud.

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## Request Syntax\{#request-syntax}

Use this request to list import jobs in Zilliz Cloud.

```java
CloudListImportJobsRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .pageSize(pageSize)
    .currentPage(currentPage)
    .build();
```

**PARAMETERS:**

- **apiKey** (*String*) -<br/>
  Authentication credential. Use the Zilliz Cloud API key for Cloud requests or `username:password` for Milvus requests.

- **clusterId** (*String*) -<br/>
  Cluster identifier for cluster-based deployments. For project database deployments, use `projectId` and `regionId` instead.

- **projectId** (*String*) -<br/>
  Project identifier for project database deployments. Use with `regionId` instead of `clusterId`.

- **regionId** (*String*) -<br/>
  Region identifier for project database deployments. Use with `projectId` instead of `clusterId`.

- **pageSize** (*Integer*) -<br/>
  Number of import jobs to return per page.

- **currentPage** (*Integer*) -<br/>
  One-based page number to return.

**RETURNS:**

*String*

A JSON response containing the matching import jobs and pagination details.

## Example\{#example}

Lists import jobs for a Zilliz Cloud project database.

```java
CloudListImportJobsRequest request = CloudListImportJobsRequest.builder()
    .projectId(PROJECT_ID)
    .regionId(REGION_ID)
    .currentPage(1)
    .pageSize(10)
    .apiKey(API_KEY)
    .build();
String response = BulkImportUtils.listImportJobs("https://api.cloud.zilliz.com", request);
```


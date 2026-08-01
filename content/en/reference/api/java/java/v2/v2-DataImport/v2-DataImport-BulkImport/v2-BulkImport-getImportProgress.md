---
title: "getImportProgress() | Java | v2"
slug: /java/java/v2-BulkImport-getImportProgress
sidebar_label: "getImportProgress()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "Retrieves the current state and progress of a bulk import job in Milvus or Zilliz Cloud. | Java | v2"
type: docx
token: OFZ3dUGwmoarOBx6FHScZwwtn8f
sidebar_position: 3
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - getImportProgress()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getImportProgress()

Retrieves the current state and progress of a bulk import job in Milvus or Zilliz Cloud.

```java
public static String getImportProgress(String url, BaseDescribeImportRequest request)
```

## Request Syntax\{#request-syntax}

Use this request for an import job created in Zilliz Cloud.

```java
CloudDescribeImportRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .jobId(jobId)
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

- **jobId** (*String*) -<br/>
  Identifier of the import job to inspect.

**RETURNS:**

*String*

A JSON response containing the import job state, progress, and related details.

## Example\{#example}

Gets import progress with project and region identifiers.

```java
CloudDescribeImportRequest request = CloudDescribeImportRequest.builder()
    .projectId(PROJECT_ID)
    .regionId(REGION_ID)
    .jobId(jobId)
    .apiKey(API_KEY)
    .build();
String response = BulkImportUtils.getImportProgress("https://api.cloud.zilliz.com", request);
```


---
title: "commitImport() | Java | v2"
slug: /java/java/v2-BulkImport-commitImport
sidebar_label: "commitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation commits a prepared bulk-import job. | Java | v2"
type: docx
token: DFyndL57goJMr0xAcMEcVq5Lnhh
sidebar_position: 6
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - commitImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# commitImport()

This operation commits a prepared bulk-import job.

```java
public static String commitImport(String url, BaseDescribeImportRequest request)
```

## Request Syntax\{#request-syntax}

```java
CloudDescribeImportRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .jobId(jobId)
    .build();
```

### CloudDescribeImportRequest\{#clouddescribeimportrequest}

Uses `CloudDescribeImportRequest` for Zilliz Cloud. Set `clusterId`, or set both `projectId` and `regionId` for a project database deployment.

**BUILDER METHODS:**

- `apiKey(String apiKey)`

    The authentication credential. Use `userName:password` for Milvus or a Zilliz Cloud API key.

- `clusterId(String clusterId)`

    The cluster ID for a Zilliz Cloud cluster deployment.

- `projectId(String projectId)`

    The project ID for a Zilliz Cloud project database deployment.

- `regionId(String regionId)`

    The region ID for a Zilliz Cloud project database deployment.

- `jobId(String jobId)`

    The import job identifier to commit.

**RETURN TYPE:**

*String*

**RETURNS:**

The JSON response body returned by the import endpoint.

**PARAMETERS:**

- **response** (*String*) -

    The JSON response body of the commit-import call.

**EXCEPTIONS:**

- **Exception**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

Demonstrates commitImport() against Zilliz Cloud.

```java
String response = BulkImportUtils.commitImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```

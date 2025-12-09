---
title: "getImportProgress() | Java | v2"
slug: /java/java/v2-BulkImport-getImportProgress
sidebar_label: "getImportProgress()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the progress of the specified bulk-import job. | Java | v2"
type: docx
token: EjnFdC5EfoIkoExSBOxcEC2hnbg
sidebar_position: 3
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - getImportProgress()
  - javaV226
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getImportProgress()

This operation gets the progress of the specified bulk-import job.

```java
public static String getImportProgress(String url, BaseDescribeImportRequest request)
```

## Request Syntax\{#request-syntax}

```java
bulkImport.getImportProgress(
    url,
    request
)
```

**PARAMETERS:**

- **url** (*String*) -

    Zilliz Cloud's Control Plane API endpoint. The endpoint URL should be in the following format:

    ```python
    https://api.cloud.zilliz.com
    # https://api.cloud.zilliz.com.cn 
    ```

- **request** (*[BaseDescribeImportRequest](./v2-BulkImport-getImportProgress#basedescribeimportrequest)*) -  

    A **BaseImportRequest** instance.

**RETURN TYPE:**

*String*

**RETURNS:**

The import progress of the specified import job.

## BaseDescribeImportRequest\{#basedescribeimportrequest}

A **BaseDescribeImportRequest** instance is implemented in **CloudDescribeImportRequest**.

### CloudDescribeImportRequest\{#clouddescribeimportrequest}

```java
CloudDescribeImportRequest.builder()
    .apiKey(String apiKey)
    .jobId(String jobId)
    .build()
```

**BUILDER METHODS:**

- `apiKey(String apiKey)`

    A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.

- `jobId(String jobId)`

    The ID of an existing import job.

## Example\{#example}

```java

```


---
displayed_sidbar: javaSidebar
title: "getImportProgress() | Java | v2"
slug: /java/java/v2-BulkImport-getImportProgress
sidebar_label: "getImportProgress()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets the progress of the specified bulk-import job. | Java | v2"
type: docx
token: EjnFdC5EfoIkoExSBOxcEC2hnbg
sidebar_position: 3
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - getImportProgress()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getImportProgress()

This operation gets the progress of the specified bulk-import job.

```java
public static String getImportProgress(String url, BaseDescribeImportRequest request)
```

## Request Syntax

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

## BaseDescribeImportRequest

A **BaseDescribeImportRequest** instance is implemented in **CloudDescribeImportRequest**.

### CloudDescribeImportRequest

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

## Example

```java

```


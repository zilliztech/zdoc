---
displayed_sidbar: javaSidebar
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all existing import jobs regarding the specified collection. | Java | v2"
type: docx
token: CN9sdiCicoERZpx9GhmcLa4Wn7g
sidebar_position: 4
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listImportJobs()

This operation lists all existing import jobs regarding the specified collection.

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## Request Syntax

```java
bulkImport.listImportJobs(
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

- **request** (*[BaseListImportRequest](./v2-BulkImport-listImportJobs#baselistimportrequest)*) -  

    A **BaseImportRequest** instance.

**RETURN TYPE:**

*String*

**RETURNS:**

A list of import job IDs of the specified collection.

## BaseListImportRequest

A **BaseListImportRequest** instance is implemented in **CloudListImportRequest**.

### CloudListImportRequest

```java
CloudListImportRequest.builder()
    .apiKey(String apiKey)
    .collectionName(String collectionName)
    .build()
```

**BUILDER METHODS:**

- `apiKey(String apiKey)`

    A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.

- `collectionName(String collectionName)`

    The name of the target collection of this operation.

## Example

```java

```


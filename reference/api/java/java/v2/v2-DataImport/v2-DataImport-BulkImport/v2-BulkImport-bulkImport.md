---
displayed_sidbar: javaSidebar
title: "bulkImport() | Java | v2"
slug: /java/java/v2-BulkImport-bulkImport
sidebar_label: "bulkImport()"
beta: false
notebook: false
description: "This operation imports the prepared data files to Zilliz Cloud. To learn how to prepare your data files, read Prepare Data Import. | Java | v2"
type: docx
token: S0ITdsnpYoDpH9xKv9fcBhe5nWA
sidebar_position: 2
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - bulkImport()
  - javaV225
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# bulkImport()

This operation imports the prepared data files to Zilliz Cloud. To learn how to prepare your data files, read [Prepare Data Import](/docs/prepare-data-import).

```java
public static String bulkImport(String url, BaseImportRequest request)
```

## Request Syntax{#request-syntax}

```java
bulkImport.bulkImport(
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

- **request** (*[BaseImportRequest](./v2-BulkImport-bulkImport#baseimportrequest)*) -  

    A **BaseImportRequest** instance.

**RETURN TYPE:**

*String*

**RETURNS:**

The ID of the created import job.

## BaseImportRequest{#baseimportrequest}

A **BaseImportRequest** instance is implemented in **CloudImportRequest**.

### CloudImportRequest{#cloudimportrequest}

```java
CloudImportRequest.builder()
    .apiKey(String apiKey)
    .objectUrl(String objectUrl)
    .accessKey(String accessKey)
    .secrectKey(String secrectKey)
    .clusterId(String clusterId)
    .dbName(String dbName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
```

**BUILDER METHODS:**

- `apiKey(String apiKey)`

    A valid Zilliz Cloud API key with sufficient permissions to manipulate the cluster.

- `objectUrl(String objectUrl)`

    The URL of your data files in one of your block storage buckets. The following are some examples of some renowned block storage services:

    ```python
    # Google Cloud Storage
    gs://{bucket-name}/{object-path}/
    
    # AWS S3
    s3://{bucket-name}/{object-path}/
    ```

- `accessKey(String accessKey)`

    The access key that is used to authenticate access to your data files.

- `secrectKey(String secrectKey)`

    The secret key that is used to authenticate access to your data files.

- `clusterId(String clusterId)`

    The instance ID of the target cluster of this operation.

    You can get the instance ID of a cluster on its details page from the Zilliz Cloud console.

- `dbName(String dbName)`

    The name of the target database. The value of this parameter defaults to `default`.

- `collectionName(String collectionName)`

    The name of a collection in the target cluster of this operation.

- `partitionName(String partitionName)`

    The name of the partition in the target cluster of this operation. The value defaults to `default`.

## Example{#example}

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.BulkImport;
import io.milvus.bulkwriter.request.import_.MilvusImportRequest;

List<List<String>> batchFiles = new ArrayList<>();
batchFiles.add(Collections.singletonList("bulk_data/1.parquet"));
batchFiles.add(Collections.singletonList("bulk_data/2.parquet"));
MilvusImportRequest milvusImportRequest = MilvusImportRequest.builder()
        .collectionName(collectionName)
        .files(batchFiles)
        .build();
String bulkImportResult = BulkImport.bulkImport(url, milvusImportRequest);

Gson GSON_INSTANCE = new Gson()
JsonObject result = GSON_INSTANCE.fromJson(bulkImportResult, JsonObject.class);
String jobId = result.getAsJsonObject("data").get("jobId").getAsString();
System.out.println("Create a bulkInert task, job id: " + jobId);
```


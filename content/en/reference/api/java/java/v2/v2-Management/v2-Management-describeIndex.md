---
title: "describeIndex() | Java | v2"
slug: /java/java/v2-Management-describeIndex
sidebar_label: "describeIndex()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes a specific index. | Java | v2"
type: docx
token: HH9bdZvbuoblNfxXeLycoHsSn9g
sidebar_position: 4
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describeIndex()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeIndex()

This operation describes a specific index.

```java
public DescribeIndexResp describeIndex(DescribeIndexReq request)
```

## Request Syntax\{#request-syntax}

```java
describeIndex(DescribeIndexReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .timestamp(Long timestamp)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The name of the target collection.

- `fieldName(String fieldName)` -

    The name of the target field.

- `indexName(String indexName)` -

    The name of the target index.

- `timestamp(Long timestamp)` -

    A timestamp for time-travel queries. Defaults to `0L`.

**RETURN TYPE:**

*DescribeIndexResp*

**RETURNS:**

A **DescribeIndexResp** object that contains the details of the specified index.

**PARAMETERS:**

- **indexDescriptions** (*List&lt;IndexDesc&gt;*) -

    A list of index descriptions, each of which is an **IndexDesc** object that contains the following fields:

    - **fieldName** (*String*) -

        The name of the field on which the index is built.

    - **indexName** (*String*) -

        The name of the index.

    - **id** (*long*) -

        The ID of the index.

    - **indexType** (*IndexParam.IndexType*) -

        The type of the index.

    - **metricType** (*IndexParam.MetricType*) -

        The metric type used to measure vector similarity with this index.

    - **extraParams** (*Map&lt;String, String&gt;*) -

        The extra parameters of the index.

    - **indexedRows** (*long*) -

        The number of rows that have been indexed.

    - **totalRows** (*long*) -

        The total number of rows in the target field.

    - **pendingIndexRows** (*long*) -

        The number of rows waiting to be indexed.

    - **indexState** (*IndexBuildState*) -

        The state of the index build task. Possible values are: `IndexStateNone`, `Unissued`, `InProgress`, `Finished`, `Failed`, `Retry`.

    - **indexFailedReason** (*String*) -

        The reason why the index build task failed.

    - **properties** (*Map&lt;String, String&gt;*) -

        The index properties. Deprecated: index properties are now dispatched to `extraParams`.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe the index for the field "vector"
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);
```

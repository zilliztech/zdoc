---
title: "describeSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets detailed metadata for a snapshot. | Java | v2"
type: docx
token: CJEzd0riyoJkcUxdYvjcKPoWn3c
sidebar_position: 2
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - describeSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeSnapshot()

This operation gets detailed metadata for a snapshot.

```java
public DescribeSnapshotResp describeSnapshot(DescribeSnapshotReq request)
```

## Request Syntax\{#request-syntax}

```java
describeSnapshot(DescribeSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database that contains the collection. If omitted, the current database is used.

- `collectionName(String collectionName)`

    The name of the collection associated with the snapshot operation.

- `snapshotName(String snapshotName)`

    The name of the snapshot.

**RETURNS:**

*DescribeSnapshotResp*

A response containing snapshot metadata, including snapshot name, description, collection name, partition names, create timestamp, and storage location.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.DescribeSnapshotReq;
import io.milvus.v2.service.snapshot.response.DescribeSnapshotResp;

DescribeSnapshotReq request = DescribeSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .build();

DescribeSnapshotResp response = client.describeSnapshot(request);
```

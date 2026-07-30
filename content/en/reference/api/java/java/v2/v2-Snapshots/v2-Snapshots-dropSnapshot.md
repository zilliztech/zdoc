---
title: "dropSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation permanently drops a snapshot from a collection. | Java | v2"
type: docx
token: EeWldhw4AoT5WqxO8GgcSfjEnpb
sidebar_position: 3
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - dropSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropSnapshot()

This operation permanently drops a snapshot from a collection.

```java
public void dropSnapshot(DropSnapshotReq request)
```

## Request Syntax\{#request-syntax}

```java
dropSnapshot(DropSnapshotReq.builder()
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

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.DropSnapshotReq;

DropSnapshotReq request = DropSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .build();

client.dropSnapshot(request);
```

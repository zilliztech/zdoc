---
title: "restoreSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-restoreSnapshot
sidebar_label: "restoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation starts an asynchronous job to restore a snapshot into a target collection. | Java | v2"
type: docx
token: SF5wdcArioRIsxxVzNjcgIhJnrc
sidebar_position: 8
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - restoreSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# restoreSnapshot()

This operation starts an asynchronous job to restore a snapshot into a target collection.

```java
public RestoreSnapshotResp restoreSnapshot(RestoreSnapshotReq request)
```

## Request Syntax\{#request-syntax}

```java
restoreSnapshot(RestoreSnapshotReq.builder()
    .snapshotName(String snapshotName)
    .sourceCollectionName(String sourceCollectionName)
    .targetCollectionName(String targetCollectionName)
    .sourceDbName(String sourceDbName)
    .targetDbName(String targetDbName)
    .build()
)
```

**BUILDER METHODS:**

- `snapshotName(String snapshotName)`

    The name of the snapshot.

- `sourceCollectionName(String sourceCollectionName)`

    The name of the collection from which the snapshot was created.

- `targetCollectionName(String targetCollectionName)`

    The name of the collection to restore the snapshot into.

- `sourceDbName(String sourceDbName)`

    The database that contains the source collection. If omitted, the current database is used.

- `targetDbName(String targetDbName)`

    The database in which to create the restored collection. If omitted, the current database is used.

**RETURNS:**

*RestoreSnapshotResp*

A response containing the restore snapshot job ID.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.RestoreSnapshotReq;
import io.milvus.v2.service.snapshot.response.RestoreSnapshotResp;

RestoreSnapshotReq request = RestoreSnapshotReq.builder()
    .snapshotName("book_chunks_backup")
    .sourceCollectionName("book_chunks")
    .targetCollectionName("book_chunks_restored")
    .sourceDbName("default")
    .targetDbName("default")
    .build();

RestoreSnapshotResp response = client.restoreSnapshot(request);
```

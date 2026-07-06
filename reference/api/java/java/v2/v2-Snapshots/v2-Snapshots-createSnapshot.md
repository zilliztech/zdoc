---
title: "createSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a snapshot for a collection. | Java | v2"
type: docx
token: JhCEdppKrowJIqxFusBc2TXsnSg
sidebar_position: 1
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - createSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createSnapshot()

This operation creates a snapshot for a collection.

```java
public void createSnapshot(CreateSnapshotReq request)
```

## Request Syntax\{#request-syntax}

```java
createSnapshot(CreateSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .description(String description)
    .compactionProtectionSeconds(Long compactionProtectionSeconds)
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

- `description(String description)`

    A human-readable description for the snapshot.

- `compactionProtectionSeconds(Long compactionProtectionSeconds)`

    The number of seconds to protect the snapshot from compaction. Use `0L` when no protection window is needed.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.CreateSnapshotReq;

CreateSnapshotReq request = CreateSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .description("Backup before schema migration")
    .compactionProtectionSeconds(3600L)
    .build();

client.createSnapshot(request);
```

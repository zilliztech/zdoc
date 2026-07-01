---
title: "unpinSnapshotData() | Java | v2"
slug: /java/java/v2-Snapshots-unpinSnapshotData
sidebar_key: java/v2-Snapshots-unpinSnapshotData
sidebar_label: "unpinSnapshotData()"
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
beta: false
notebook: false
description: "This operation releases a snapshot data pin created by `pinSnapshotData()`. | Java | v2"
type: docx
token: SachdJS5AopAZyxEfloceBnnnqg
sidebar_position: 9
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - unpinSnapshotData()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# unpinSnapshotData()

This operation releases a snapshot data pin created by `pinSnapshotData()`.

```java
public void unpinSnapshotData(UnpinSnapshotDataReq request)
```

## Request Syntax\{#request-syntax}

```java
unpinSnapshotData(UnpinSnapshotDataReq.builder()
    .pinId(Long pinId)
    .build()
)
```

**BUILDER METHODS:**

- `pinId(Long pinId)`

    The pin ID returned by `pinSnapshotData()`.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.UnpinSnapshotDataReq;

UnpinSnapshotDataReq request = UnpinSnapshotDataReq.builder()
    .pinId(987654321L)
    .build();

client.unpinSnapshotData(request);
```

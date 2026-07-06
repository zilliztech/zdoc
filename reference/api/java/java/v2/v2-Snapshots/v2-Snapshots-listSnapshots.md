---
title: "listSnapshots() | Java | v2"
slug: /java/java/v2-Snapshots-listSnapshots
sidebar_label: "listSnapshots()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists snapshots, optionally scoped to a database and collection. | Java | v2"
type: docx
token: ZhiOdVH0uoMI0axpcYMcfhQXnkf
sidebar_position: 6
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - listSnapshots()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listSnapshots()

This operation lists snapshots, optionally scoped to a database and collection.

```java
public ListSnapshotsResp listSnapshots(ListSnapshotsReq request)
```

## Request Syntax\{#request-syntax}

```java
listSnapshots(ListSnapshotsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database that contains the collection. If omitted, the current database is used.

- `collectionName(String collectionName)`

    The name of the collection associated with the snapshot operation.

**RETURNS:**

*ListSnapshotsResp*

A response containing the snapshot names that match the request filter.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.ListSnapshotsReq;
import io.milvus.v2.service.snapshot.response.ListSnapshotsResp;

ListSnapshotsReq request = ListSnapshotsReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .build();

ListSnapshotsResp response = client.listSnapshots(request);
```

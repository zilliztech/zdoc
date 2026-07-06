---
title: "getRestoreSnapshotState() | Java | v2"
slug: /java/java/v2-Snapshots-getRestoreSnapshotState
sidebar_label: "getRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets the state and progress of a restore snapshot job. | Java | v2"
type: docx
token: KXdUdGpt7oD3dkxHZcfcIAQBnNg
sidebar_position: 4
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getRestoreSnapshotState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getRestoreSnapshotState()

This operation gets the state and progress of a restore snapshot job.

```java
public GetRestoreSnapshotStateResp getRestoreSnapshotState(GetRestoreSnapshotStateReq request)
```

## Request Syntax\{#request-syntax}

```java
getRestoreSnapshotState(GetRestoreSnapshotStateReq.builder()
    .jobId(Long jobId)
    .build()
)
```

**BUILDER METHODS:**

- `jobId(Long jobId)`

    The restore snapshot job ID returned by `restoreSnapshot()`.

**RETURNS:**

*GetRestoreSnapshotStateResp*

A response containing restore job state, progress, reason, timing, and collection metadata.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.GetRestoreSnapshotStateReq;
import io.milvus.v2.service.snapshot.response.GetRestoreSnapshotStateResp;

GetRestoreSnapshotStateReq request = GetRestoreSnapshotStateReq.builder()
    .jobId(123456789L)
    .build();

GetRestoreSnapshotStateResp response = client.getRestoreSnapshotState(request);
```

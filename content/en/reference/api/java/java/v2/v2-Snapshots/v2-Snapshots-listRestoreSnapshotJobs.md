---
title: "listRestoreSnapshotJobs() | Java | v2"
slug: /java/java/v2-Snapshots-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists restore snapshot jobs, optionally scoped to a database and collection. | Java | v2"
type: docx
token: I98vddTeco48kYxHEkOccG9ynYe
sidebar_position: 5
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - listRestoreSnapshotJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listRestoreSnapshotJobs()

This operation lists restore snapshot jobs, optionally scoped to a database and collection.

```java
public ListRestoreSnapshotJobsResp listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq request)
```

## Request Syntax\{#request-syntax}

```java
listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq.builder()
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

**RETURN TYPE:**

*ListRestoreSnapshotJobsResp*

**RETURNS:**

A response containing restore snapshot jobs that match the request filter.

**PARAMETERS:**

- **jobs** (*List&lt;RestoreSnapshotJobInfo&gt;*) -

    A list of restore snapshot jobs, each of which is a **RestoreSnapshotJobInfo** object that contains the following fields:

    - **jobId** (*Long*) -

        The ID of the restore snapshot job.

    - **snapshotName** (*String*) -

        The name of the snapshot being restored.

    - **dbName** (*String*) -

        The name of the target database.

    - **collectionName** (*String*) -

        The name of the target collection.

    - **state** (*String*) -

        The current state of the restore job: RestoreSnapshotNone, RestoreSnapshotPending, RestoreSnapshotExecuting, RestoreSnapshotCompleted, or RestoreSnapshotFailed.

    - **progress** (*Integer*) -

        The progress of the restore job as a percentage.

    - **reason** (*String*) -

        The failure reason when the job has failed.

    - **startTime** (*Long*) -

        The start time of the restore job.

    - **timeCost** (*Long*) -

        The time cost of the restore job.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception is raised when required parameters are missing, numeric parameters are out of range, or the server returns an error for this operation.

## Example\{#example}

```java
import io.milvus.v2.service.snapshot.request.ListRestoreSnapshotJobsReq;
import io.milvus.v2.service.snapshot.response.ListRestoreSnapshotJobsResp;

ListRestoreSnapshotJobsReq request = ListRestoreSnapshotJobsReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .build();

ListRestoreSnapshotJobsResp response = client.listRestoreSnapshotJobs(request);
```

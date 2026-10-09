---
title: "listRefreshExternalCollectionJobs() | Java | v2"
slug: /java/java/v2-Management-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all external-collection refresh jobs, optionally filtered by collection name. | Java | v2"
type: docx
token: P9MFdEHMKoAfshxQhamcWrGknWg
sidebar_position: 30
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - listRefreshExternalCollectionJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listRefreshExternalCollectionJobs()

This operation lists all external-collection refresh jobs, optionally filtered by collection name.

```java
public ListRefreshExternalCollectionJobsResp listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq request)
```

## Request Syntax\{#request-syntax}

```java
listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    The collection name to filter by. If empty, jobs across all collections in the database are returned.

**RETURN TYPE:**

*ListRefreshExternalCollectionJobsResp*

**RETURNS:**

A **ListRefreshExternalCollectionJobsResp** object wraps a `List<RefreshExternalCollectionJobInfo>` accessible via `getJobs()`. Each job info entry exposes the fields of a **RefreshExternalCollectionJobInfo** object.

**PARAMETERS:**

- **jobs** (*List&lt;RefreshExternalCollectionJobInfo&gt;*) -

    A list of refresh external collection jobs, each of which is a **RefreshExternalCollectionJobInfo** object with the following fields:

    - **jobId** (*long*) -

        The ID of the refresh job.

    - **collectionName** (*String*) -

        The name of the target collection.

    - **state** (*String*) -

        The current job state (e.g., `"PENDING"`, `"RUNNING"`, `"SUCCEEDED"`, `"FAILED"`).

    - **progress** (*int*) -

        The completion percentage (0-100).

    - **reason** (*String*) -

        The failure reason if the job state is `"FAILED"`; empty otherwise.

    - **externalSource** (*String*) -

        The external source used by the job.

    - **externalSpec** (*String*) -

        The specification of the external data source.

    - **startTime** (*long*) -

        The job start timestamp (epoch milliseconds).

    - **endTime** (*long*) -

        The job end timestamp (epoch milliseconds), or 0 if still running.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.utility.request.ListRefreshExternalCollectionJobsReq;
import io.milvus.v2.service.utility.response.ListRefreshExternalCollectionJobsResp;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionJobInfo;

ListRefreshExternalCollectionJobsResp resp = client.listRefreshExternalCollectionJobs(
    ListRefreshExternalCollectionJobsReq.builder()
        .collectionName("my_collection")
        .build()
);
for (RefreshExternalCollectionJobInfo job : resp.getJobs()) {
    System.out.println(job.getJobId() + " " + job.getState());
}
```

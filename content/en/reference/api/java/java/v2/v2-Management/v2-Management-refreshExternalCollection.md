---
title: "refreshExternalCollection() | Java | v2"
slug: /java/java/v2-Management-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation triggers a refresh job that pulls data from an external source into a Milvus collection. Returns a job ID that can be passed to `getRefreshExternalCollectionProgress()` to track progress. | Java | v2"
type: docx
token: G8JydoIzPoKb2MxASemcW2spnbe
sidebar_position: 32
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - refreshExternalCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

This operation triggers a refresh job that pulls data from an external source into a Milvus collection. Returns a job ID that can be passed to `getRefreshExternalCollectionProgress()` to track progress.

```java
public RefreshExternalCollectionResp refreshExternalCollection(RefreshExternalCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
refreshExternalCollection(RefreshExternalCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .externalSource(String externalSource)
    .externalSpec(JsonObject externalSpec)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    The name of the collection to refresh.

- `externalSource(String externalSource)` -

    The external source URI.

    Provide `externalSource` and `externalSpec` together, or omit both; when both are omitted, the refresh reuses the persisted source and spec.

    On Zilliz Cloud, `externalSource` accepts two schemes: `volume://<volume_name>/<path>` and `milvus://<instance_id>/<db_name>/<collection_name>`. For a `volume://` URI, the rule above applies. For a `milvus://` source, the same rule applies — omitting it reuses the persisted source, and the refresh still syncs the latest data.

- `externalSpec(JsonObject externalSpec)` -

    A JSON object that carries the external source specifications, such as `format`. Possible `format` values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

    On Zilliz Cloud, `milvus-table` sources are used with the `milvus://` scheme; `format` can be omitted and defaults to `milvus-table` for a `milvus://` source.

**RETURN TYPE:**

*RefreshExternalCollectionResp*

**RETURNS:**

A **RefreshExternalCollectionResp** object carries the ID of the newly started refresh job.

**PARAMETERS:**

- **jobId** (*long*) -

    The numeric ID of the newly started refresh job. Persist this value to query progress with `getRefreshExternalCollectionProgress()`.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

JsonObject spec = new JsonObject();
spec.addProperty("endpoint", "https://s3.amazonaws.com");
spec.addProperty("bucket", "my-bucket");
spec.addProperty("path", "data/snapshots/2026-05-01/");

RefreshExternalCollectionResp resp = client.refreshExternalCollection(
    RefreshExternalCollectionReq.builder()
        .collectionName("my_collection")
        .externalSource("s3")
        .externalSpec(spec)
        .build()
);
long jobId = resp.getJobId();
System.out.println("Started refresh job: " + jobId);
```

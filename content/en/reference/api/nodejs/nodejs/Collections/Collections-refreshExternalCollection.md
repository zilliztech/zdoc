---
title: "refreshExternalCollection() | Node.js"
slug: /node/node/Collections-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation triggers a data refresh for an external collection. Use this when the external data source has been updated and you want Milvus to reload the data. | Node.js"
type: docx
token: JoiWdRIFcojRI4xVXnCclEoVnh2
sidebar_position: 31
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - refreshExternalCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# refreshExternalCollection()

This operation triggers a data refresh for an external collection. Use this when the external data source has been updated and you want Milvus to reload the data.

```javascript
await milvusClient.refreshExternalCollection(data: RefreshExternalCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.refreshExternalCollection({
    collection_name: string,
    external_source?: string,
    external_spec?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[REQUIRED]**
The name of the external collection to refresh.

- **external_source** (*string*) -
Optional new external source path. If provided, the collection will be refreshed from this new source.

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[REQUIRED]**
The name of the external collection to refresh.

- **external_source** (*string*) -
Optional new external source path. If provided, the collection will be refreshed from this new source. Provide `external_source` and `external_spec` together, or omit both; when both are omitted, the refresh reuses the persisted source and spec.

</NextChannel>

On Zilliz Cloud, `external_source` accepts two schemes: `volume://<volume_name>/<path>` and `milvus://<instance_id>/<db_name>/<collection_name>`. For a `volume://` source, `external_source` and `external_spec` must be both provided or both omitted; when both are omitted, the refresh reuses the previously persisted source configuration and still syncs the latest data. For a `milvus://` source, the same rule applies — omitting it reuses the persisted source, and the refresh re-snapshots the source cluster before syncing.

<NextChannel action="exclude">

- **external_spec** (*string*) -
Optional new external spec configuration. If provided, the collection will use this new spec.

</NextChannel>

<NextChannel action="include">

- **external_spec** (*string*) -
Optional new external spec configuration. If provided, the collection will use this new spec. Possible `format` values are `parquet`, `vortex`, `lance-table`, `iceberg-table`, and `milvus-table`. For `milvus-table`, set `external_source` to a Milvus snapshot metadata JSON path, for example `s3://bucket/snapshots/{collection_id}/metadata/{snapshot_id}.json`.

</NextChannel>

On Zilliz Cloud, for a `milvus://` source, `format` must be `milvus-table` (or omitted); for other sources, provide the spec with the matching `format` (`parquet`, `vortex`, `lance-table`, `iceberg-table`).

<NextChannel action="exclude">

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

</NextChannel>

<NextChannel action="include">

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
An optional, caller-supplied ID for request tracking and log or trace correlation. The SDK sends it as the `client-request-id` gRPC metadata header and never generates one. Use a unique value per request, such as a UUID. A value in OpenTelemetry trace-ID form (32 lowercase hexadecimal characters) is also used by client telemetry as a trace ID.

</NextChannel>

**RETURNS:**

*Promise&lt;RefreshExternalCollectionResponse&gt;*

This method returns a promise that resolves to a **RefreshExternalCollectionResponse** object.

```javascript
{
    job_id: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **job_id** (*string*) -
The identifier of the asynchronous refresh job. Pass this value to `getRefreshExternalCollectionProgress()` to poll for completion.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.refreshExternalCollection({
    collection_name: 'my_external_collection',
    external_source: 's3://bucket/path',
});
```

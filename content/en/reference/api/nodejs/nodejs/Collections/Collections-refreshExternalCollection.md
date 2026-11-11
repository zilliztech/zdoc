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
sidebar_position: 35
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

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

This operation triggers a data refresh for an external collection. Use this when the external data source has been updated and you want Milvus to reload the data.

```typescript
await milvusClient.refreshExternalCollection(data: RefreshExternalCollectionReq)
```

## Request Syntax\{#request-syntax}

```typescript
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

- **collection_name** (*string*) -<br/>
  **[REQUIRED]**<br/>
  The name of the external collection to refresh.

- **external_source** (*string*) -<br/>
  Optional new external source path. If provided, the collection will be refreshed from this new source. Provide `external_source` and `external_spec` together, or omit both; when both are omitted, the refresh reuses the persisted source and spec. On Zilliz Cloud, `external_source` accepts two schemes: `volume://<volume_name>/<path>` and `milvus://<instance_id>/<db_name>/<collection_name>`. For a `volume://` URI, the rule above applies. For a `milvus://` source, the same rule applies — omitting it reuses the persisted source, and the refresh still syncs the latest data.

- **external_spec** (*string*) -<br/>
  Optional new external spec configuration. If provided, the collection will use this new spec. Possible `format` values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`. On Zilliz Cloud, `milvus-table` sources are used with the `milvus://` scheme; `format` can be omitted and defaults to `milvus-table` for a `milvus://` source.

- **db_name** (*string*) -<br/>
  The name of the database. Optional.

- **timeout** (*number*) -<br/>
  An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -<br/>
  A trace ID for request tracking. Optional.

**RETURNS** *Promise&lt;RefreshExternalCollectionResponse&gt;*

This method returns a promise that resolves to a **RefreshExternalCollectionResponse** object.

```typescript
{
    job_id: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **job_id** (*string*) -<br/>
  The identifier of the asynchronous refresh job. Pass this value to `getRefreshExternalCollectionProgress()` to poll for completion.

- **ResStatus**<br/>
  A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

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

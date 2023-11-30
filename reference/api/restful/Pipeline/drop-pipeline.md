---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /drop-pipeline
title: Drop Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Drop a specific pipeline

<RestHeader method="delete" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/{PIPELINE_ID}" />

---

## Example


Drop a pipeline that is no longer in need.

```curl
curl --http1.1 --request DELETE \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/pipe-71e95af38d958f50d8178b"
```


## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `PIPELINE_ID`  | **string**(required)<br/>|

### Request Body

No request body required

## Response

成功

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "pipelineId": "integer",
        "name": "string",
        "type": "string",
        "description": "string",
        "status": "string",
        "clusterID": "string",
        "collectionName": "string"
    }
}
```

- Response body if we failed to process your request

```json
{
    "code": integer,
    "message": string
}
```

### Properties

The properties in the returned response are listed in the following table.

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `code`   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| `data`    | **object**<br/>A data object. |
| `data.pipelineId`   | **integer**<br/>A pipeline ID. |
| `data.name`   | **string**<br/>Name of the pipeline. |
| `data.type`   | **string**<br/>Type of the pipeline. For an ingestion pipeline, the value should be `INGESTION`. |
| `data.description`   | **string**<br/>Description of the pipeline. |
| `data.status`   | **string**<br/>Current status of the pipeline. If the value is other than `SERVING`, the pipeline is not working. |
| `data.functions`   | ****<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| `data.clusterID`   | **string**<br/>The target cluster to which the pipeline applies. |
| `data.collectionName`   | **string**<br/>The target collection to which the pipeline applies. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
|  | (to be added) |


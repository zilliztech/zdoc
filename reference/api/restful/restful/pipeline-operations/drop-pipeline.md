---
displayed_sidebar: referenceSidebar
sidebar_position: 23
slug: /drop-pipeline
title: Drop Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Drop a specific pipeline

<RestHeader method="delete" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/{PIPELINE_ID}" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::

```shell
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${API_KEY}" \
    --url "https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines/pipe-**********************"
```

Possible response

```shell
{
    "code": 200,
    "data": {
        "pipelineId": "pipe-**********************",
        "name": "my_doc_ingestion_pipeline",
        "type": "INGESTION",
        "description": "A pipeline that splits a text file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
        "status": "SERVING",
        "functions": [
            {
                "action": "INDEX_DOC",
                "name": "index_my_doc",
                "inputField": "doc_url",
                "language": "ENGLISH"
            },
            {
                "action": "PRESERVE",
                "name": "keep_doc_info",
                "inputField": "publish_year",
                "outputField": "publish_year",
                "fieldType": "Int16"
            }
        ],
        "clusterId": "in03-***************",
        "newCollectionName": "my_new_collection"
    }
}

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

Returns information of a specific pipeline just dropped.

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
        "totalTokenUsage": "integer",
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
| `data.totalTokenUsage`   | **integer**<br/>Number of consumed tokens in this operation. |
| `data.functions`   | ****<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| `data.clusterID`   | **string**<br/>The target cluster to which the pipeline applies. |
| `data.collectionName`   | **string**<br/>The target collection to which the pipeline applies. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 10041 | (Possible pipeline errors are all under this error code.) |


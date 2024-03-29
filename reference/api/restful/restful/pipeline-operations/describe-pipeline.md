---
displayed_sidebar: restfulSidebar
sidebar_position: 22
slug: /restful/describe-pipeline
title: Describe Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Describe a specific pipeline by its name.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/{PIPELINE_ID}" />

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
        "totalTokenUsage": 0,
        "functions": [
            {
                "action": "INDEX_DOC",
                "name": "index_my_doc",
                "inputField": "doc_url",
                "language": "ENGLISH",
                "chunkSize": 500
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
    | `PIPELINE_ID`  | **string**(required)<br/>A valid pipeline ID obtained from either the list-pipelines API endpoints or Zilliz Cloud console.|

### Request Body

No request body required

## Response

Returns a pipeline in detail.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "oneOf": [
            {
                "pipelineId": "integer",
                "name": "string",
                "type": "string",
                "description": "string",
                "status": "string",
                "clusterID": "string",
                "collectionName": "string"
            },
            {
                "pipelineId": "integer",
                "name": "string",
                "type": "string",
                "description": "string",
                "status": "string",
                "functions": [
                    {
                        "name": "string",
                        "action": "string",
                        "inputField": "string",
                        "clusterID": "string",
                        "collectionName": "string"
                    }
                ]
            },
            {
                "pipelineId": "integer",
                "name": "string",
                "type": "string",
                "description": "string",
                "status": "string",
                "functions": [
                    {
                        "name": "string",
                        "action": "string",
                        "inputField": "string"
                    }
                ],
                "clusterID": "string",
                "collectionName": "string"
            }
        ]
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
| __code__ | integer  <br/>  |
| __data__ | object | object | object<br/> |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 10041 | (Possible pipeline errors are all under this error code.) |

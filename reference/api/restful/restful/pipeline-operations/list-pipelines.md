---
displayed_sidebar: restfulSidebar
sidebar_position: 25
slug: /restful/list-pipelines
title: List Pipelines
---

import RestHeader from '@site/src/components/RestHeader';

List all pipelines in a project.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" />

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
    --url "https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines?projectId=proj-**********************"
```

Possible response

```shell
{
  "code": 200,
  "data": [
    {
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
    },
    {
        "pipelineId": "pipe-**********************",
        "name": "my_text_search_pipeline",
        "type": "SEARCH",
        "description": "A pipeline that receives text and search for semantically similar doc chunks",
        "status": "SERVING",
        "functions": [
            {
                "action": "SEARCH_DOC_CHUNK",
                "name": "search_chunk_text_and_title",
                "inputField": null,
                "clusterId": "in03-***************",
                "collectionName": "my_new_collection"
            }
        ]
    },
    {
        "pipelineId": "pipe-**********************",
        "name": "my_doc_deletion_pipeline",
        "type": "DELETION",
        "description": "A pipeline that deletes all info associated with a doc",
        "status": "SERVING",
        "functions": [
            {
            "action": "PURGE_DOC_INDEX",
            "name": "purge_chunks_by_doc_name",
            "inputField": "doc_name"
            }
        ],
        "clusterId": "in03-***************",
        "collectionName": "my_new_collection"
    }
  ]
}
```


## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `projectId`  | **integer**(required)<br/>ID of the project in which this operation is performed.|

- No path parameters required

### Request Body

No request body required

## Response

Returns a list of pipelines in detail.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "string",
    "data": [
        {}
    ]
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
| __code__ | string  <br/>  |
| __data__ | array<br/> |
| __data[]__ | object<br/> |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 10041 | (Possible pipeline errors are all under this error code.) |

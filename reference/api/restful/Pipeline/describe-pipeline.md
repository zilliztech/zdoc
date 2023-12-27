---
displayed_sidebar: referenceSidebar
sidebar_position: 22
slug: /describe-pipeline
title: Describe Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Describe a specific pipeline by its name.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/{PIPELINE_ID}" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-**********************"
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
| `data`  | **oneOf**<br/>A set of multiple possible values. |
| **[Option 1]** | |
| `data.pipelineId`   | **integer**<br/>A pipeline ID. |
| `data.name`   | **string**<br/>Name of the pipeline. |
| `data.type`   | **string**<br/>Type of the pipeline. For an ingestion pipeline, the value should be `INGESTION`. |
| `data.description`   | **string**<br/>Description of the pipeline. |
| `data.status`   | **string**<br/>Current status of the pipeline. If the value is other than `SERVING`, the pipeline is not working. |
| `data.functions`   | ****<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| `data.clusterID`   | **string**<br/>The target cluster to which the pipeline applies. |
| `data.collectionName`   | **string**<br/>The target collection to which the pipeline applies. |
| **[Option 2]** | |
| `data.pipelineId`   | **integer**<br/>A pipeline ID. |
| `data.name`   | **string**<br/>Name of the pipeline |
| `data.type`   | **string**<br/>Type of the pipeline. For a search pipeline, the value should be `SEARCH`. |
| `data.description`   | **string**<br/>Description of the pipeline. |
| `data.status`   | **string**<br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working. |
| `data.functions`   | **array**<br/>Functions in the pipeline. For a search pipeline, each of its member functions targets at a different collection. |
| `data.functions[].name`   | **string**<br/>Name of the function. |
| `data.functions[].action`   | **string**<br/>Type of the function. For a search function, the value should be `SEARCH_DOC_CHUNKS`. |
| `data.functions[].inputField`   | **string**<br/>Name of the input field. For a `SEARCH_DOC_CHUNKS` function, the value should be your query text. |
| `data.functions[].clusterID`   | **string**<br/>Target cluster of this function. |
| `data.functions[].collectionName`   | **string**<br/>Target collection of this function. |
| **[Option 3]** | |
| `data.pipelineId`   | **integer**<br/>A pipeline ID. |
| `data.name`   | **string**<br/>Name of the pipeline. |
| `data.type`   | **string**<br/>Type of the pipeline. For a deletion pipeline, the value should be `DELETION`. |
| `data.description`   | **string**<br/>Description of the pipeline. |
| `data.status`   | **string**<br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working. |
| `data.functions`   | **array**<br/>Functions in the pipeline. For a deletion pipeline, there can be multiple member functions with each representing a deletion request. |
| `data.functions[].name`   | **string**<br/>Name of the function. |
| `data.functions[].action`   | **string**<br/>Type of the function. For a deletion pipeline, its member functions should be of `PURGE_DOC_INDEX`. |
| `data.functions[].inputField`   | **string**<br/>Name of the input field. For a `PURGE_DOC_INDEX` function, the value should be the name of the doc to delete. |
| `data.clusterID`   | **string**<br/>Target cluster of the pipeline. |
| `data.collectionName`   | **string**<br/>Target collection of the pipeline. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 10041 | (Possible pipeline errors are all under this error code.) |


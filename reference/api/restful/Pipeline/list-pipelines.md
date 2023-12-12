---
displayed_sidebar: referenceSidebar
sidebar_position: 25
slug: /list-pipelines
title: List Pipelines
---

import RestHeader from '@site/src/components/RestHeader';

List all pipelines in a project.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" />

---

## Example


List all pipelines in detail.

```shell
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines"
```

Possible response

```shell
{
  "code": 200,
  "data": [
    {
     "pipelineId": "pipe-6ca5dd1b4672659d3c3487",
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
    },
    {
     "pipelineId": "pipe-26a18a66ffc8c0edfdb874",
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
     "pipelineId": "pipe-7227d0729d73e63002ed46",
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

- No query parameters required

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
| `data`  | **array**<br/>A data array of s. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 10041 | (Possible pipeline errors are all under this error code.) |


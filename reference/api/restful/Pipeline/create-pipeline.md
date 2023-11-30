---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /create-pipeline
title: Create Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Create a pipeline.

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" />

---

## Example


Create a pipeline that aims to transform your unstructured data into a searchable vector collection.

- Create a data ingestion pipeline.

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "name": "my_doc_ingestion_pipeline",
            "description": "A pipeline that splits a text file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
            "type": "INGESTION",  
            "functions": [
                { 
                    "name": "index_my_doc",
                    "action": "INDEX_DOC", 
                    "inputField": "doc_url", 
                    "language": "ENGLISH"
                },
                {
                    "name": "keep_doc_info",
                    "action": "PRESERVE", 
                    "inputField": "publish_year", 
                    "outputField": "publish_year",
                    "fieldType": "Int16" 
                }
            ],
            "clusterId": "${CLUSTER_ID}",
            "newCollectionName": "my_new_collection"
        }'
    ```

    Possible response:

    ```shell
    {
        "code": 200,
        "data": {
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
        }
    }   
    ```  

- Create a search pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "name": "my_text_search_pipeline",
            "description": "A pipeline that receives text and search for semantically similar doc chunks",
            "type": "SEARCH",
            "functions": [
                {
                    "name": "search_chunk_text_and_title",
                    "action": "SEARCH_DOC_CHUNK",
                    "inputField": "query_text",
                    "clusterId": "${CLUSTER_ID}",
                    "collectionName": "my_new_collection"
                }
            ]
        }'
    ```

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "pipelineId": "pipe-26a18a66ffc8c0edfdb874",
            "name": "my_text_search_pipeline",
            "type": "SEARCH",
            "description": "A pipeline that receives text and search for semantically similar doc chunks",
            "status": "SERVING",
            "functions": [
                {
                    "action": "SEARCH_DOC_CHUNK",
                    "name": "search_chunk_text_and_title",
                    "inputField": "query_text",
                    "clusterId": "in03-***************",
                    "collectionName": "my_new_collection"
                }
            ]
        }
    }
    ```

- Create a deletion pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "name": "my_doc_deletion_pipeline",
            "description": "A pipeline that deletes all info associated with a doc",
            "type": "DELETION",
            "functions": [
                {
                    "name": "purge_chunks_by_doc_name",
                    "action": "PURGE_DOC_INDEX",
                    "inputField": "doc_name"
                }
            ],
        
            "clusterId": "${CLUSTER_ID}",
            "collectionName": "my_new_collection"
        }'
    ```

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
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
    }
    ```


## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

```json
{
    "name": "string",
    "type": "string",
    "description": "string",
    "functions": [
        {
            "name": "string",
            "action": "string",
            "inputField": "string",
            "outputField": "string",
            "fieldType": "string"
        }
    ],
    "clusterId": "string",
    "newCollectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `name`  | **string**(required)<br/>Name of the pipeline to create.|
| `type`  | **string**(required)<br/>Type of the pipeline to create. For an ingestion pipeline, the value should be `INGESTION`.|
| `description`  | **string**(required)<br/>Description of the pipeline to create.|
| `functions`  | **array**(required)<br/>Actions to take in the pipeline to create. For an ingestion pipeline, you can add only one doc-indexing function and multilpe preserve functions.|
| `clusterId`  | **string**(required)<br/>ID of a target cluster. You can find it in cluster details on Zilliz Cloud console.|
| `newCollectionName`  | **string**(required)<br/>Name of the collection to create in the specified cluster. Zilliz Cloud creates a new collection and name it using this value.|

```json
{
    "name": "string",
    "description": "string",
    "type": "string",
    "functions": [
        {
            "name": "string",
            "action": "string",
            "clusterId": "string",
            "collectionName": "string"
        }
    ]
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `name`  | **string**(required)<br/>Name of the pipeline to create.|
| `description`  | **string**(required)<br/>Description of the pipeline to create.|
| `type`  | **string**(required)<br/>Type of the pipeline to create. For a search pipeline, the value should be `SEARCH`.|
| `functions`  | **array**(required)<br/>Actions to take in the search pipeline to create. You can define multiple functions to retrieve results from different collections.|

```json
{
    "name": "string",
    "description": "string",
    "type": "string",
    "functions": [
        {
            "name": "string",
            "action": "string",
            "inputField": "string"
        }
    ],
    "clusterId": "string",
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `name`  | **string**(required)<br/>Name of the pipeline to create.|
| `description`  | **string**(required)<br/>Description of the pipeline to create.|
| `type`  | **string**(required)<br/>Type of the pipeline to create. For a deletion pipeline, the value should be `DELETION`|
| `functions`  | **array**(required)<br/>Actions to take in the pipeline to create.|
| `clusterId`  | **string**(required)<br/>ID of a target cluster. You can find it in cluster details on Zilliz Cloud console.|
| `collectionName`  | **string**(required)<br/>Name of the collection to create in the specified cluster. Zilliz Cloud creates a new collection and name it using this value.|

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
| 10041 | (Possible pipeline errors are all under this error code.) |


---
displayed_sidebar: restfulSidebar
sidebar_position: 16
slug: /restful/create-pipeline
title: Create Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Create a pipeline.

<RestHeader method="post" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/pipelines" />

---

## Example




:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::

- Create a data ingestion pipeline.

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${API_KEY}" \
        --url "https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines" \
        -d '{
            "projectId": "proj-**********************",
            "name": "my_doc_ingestion_pipeline",
            "description": "A pipeline that splits a text file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
            "type": "INGESTION",  
            "functions": [
                { 
                    "name": "index_my_doc",
                    "action": "INDEX_DOC", 
                    "inputField": "doc_url", 
                    "language": "ENGLISH",
                    "chunkSize": 500
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

- Create a search pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${API_KEY}" \
        --url "https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines" \
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
            "pipelineId": "pipe-**********************",
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
        --header "Authorization: Bearer ${API_KEY}" \
        --url "https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines" \
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
    "collectionName": "string",
    "projectId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __name__ | string  <br/>Name of the pipeline to create.  |
| __type__ | string  <br/>Type of the pipeline to create. For an ingestion pipeline, the value should be `INGESTION`.  |
| __description__ | string  <br/>Description of the pipeline to create.  |
| __functions__ | array<br/>Actions to take in the pipeline to create. For an ingestion pipeline, you can add only one doc-indexing function and multilpe preserve functions. |
| __functions[]__ | object | object | object | object<br/> |
| __clusterId__ | string  <br/>ID of a target cluster. You can find it in cluster details on Zilliz Cloud console.  |
| __collectionName__ | string  <br/>Name of the collection to create in the specified cluster. Zilliz Cloud creates a new collection and name it using this value.  |
| __projectId__ | string  <br/>ID of the project to which the target cluster belongs.  |

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
            "collectionName": "string",
            "embedding": "string",
            "reranker": "string"
        }
    ],
    "projectId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __name__ | string  <br/>Name of the pipeline to create.  |
| __description__ | string  <br/>Description of the pipeline to create.  |
| __type__ | string  <br/>Type of the pipeline to create. For a search pipeline, the value should be `SEARCH`.  |
| __functions__ | array<br/>Actions to take in the search pipeline to create. You can define multiple functions to retrieve results from different collections. |
| __functions[]__ | object<br/> |
| __functions[].name__ | string  <br/>Name of the function to create.  |
| __functions[].action__ | string  <br/>Type of the function to create. For a search pipeline, possible value is `SEARCH_TEXT`, `SEARCH_DOC_CHUNK`, and `SEARCH_IMAGE_BY_IMAGE`.  |
| __functions[].clusterId__ | string  <br/>ID of a target collection in which Zilliz Cloud concducts the search.  |
| __functions[].collectionName__ | string  <br/>Name of the collection in which ZIlliz Cloud conducts the search.  |
| __functions[].embedding__ | string  <br/>The embedding model used during vector search. The model should be consistent with the one chosen in the compatible collection.  |
| __functions[].reranker__ | string  <br/>If you need to reorder or rank a set of candidate outputs to improve the quality of the search results, set this parameter to a reranker model. This parameter applies only to pipelines for Text and Doc Data. Currently, only `zilliz/bge-reranker-base` is available as the parameter value.  |
| __projectId__ | string  <br/>ID of the project to which the target cluster belongs  |

```json
{
    "name": "string",
    "description": "string",
    "type": "string",
    "functions": [
        {
            "name": "string",
            "action": "string"
        }
    ],
    "clusterId": "string",
    "collectionName": "string",
    "projectId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __name__ | string  <br/>Name of the pipeline to create.  |
| __description__ | string  <br/>Description of the pipeline to create.  |
| __type__ | string  <br/>Type of the pipeline to create. For a deletion pipeline, the value should be `DELETION`  |
| __functions__ | array<br/>Actions to take in the pipeline to create. |
| __functions[]__ | object<br/> |
| __functions[].name__ | string  <br/>Name of the function to create.  |
| __functions[].action__ | string  <br/>Type of the function to create. For a delete pipeline, possible value is `PURGE_BY_EXPRESSION`, `PURGE_DOC_INDEX`, and `PURGE_IMAGE_INDEX`.  |
| __clusterId__ | string  <br/>ID of a target cluster. You can find it in cluster details on Zilliz Cloud console.  |
| __collectionName__ | string  <br/>Name of the collection to create in the specified cluster. Zilliz Cloud creates a new collection and name it using this value.  |
| __projectId__ | string  <br/>ID of the project to which the target cluster belongs.  |

## Response

Returns information about the pipeline just created.

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
| __code__ | integer  <br/>  |
| __data__ | object<br/> |
| __data.pipelineId__ | integer  <br/>A pipeline ID.  |
| __data.name__ | string  <br/>Name of the pipeline.  |
| __data.type__ | string  <br/>Type of the pipeline. For an ingestion pipeline, the value should be `INGESTION`.  |
| __data.description__ | string  <br/>Description of the pipeline.  |
| __data.status__ | string  <br/>Current status of the pipeline. If the value is other than `SERVING`, the pipeline is not working.  |
| __functions__ | object | object | object | object<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| __data.clusterID__ | string  <br/>The target cluster to which the pipeline applies.  |
| __data.collectionName__ | string  <br/>The target collection to which the pipeline applies.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

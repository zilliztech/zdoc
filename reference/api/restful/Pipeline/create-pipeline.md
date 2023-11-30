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
     curl --http1.1 --request POST \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
     --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/" \
     -d '{
     "name": "medium_articles_ingestion",
     "description": "Ingestion of medium articles",
     "type": "INGESTION",
     "functions": [
          {
               "name": "medium_articles_index_func",
               "action": "INDEX_DOC",
               "inputField": "signed_url",
               "language": "ENGLISH"
          },
          {
               "name": "medium_articles_index_preserve_title",
               "action": "PRESERVE",
               "inputField": "title",
               "outputField": "title",
               "fieldType": "VarChar"
          },
          {
               "name": "medium_articles_index_preserve_link",
               "action": "PRESERVE",
               "inputField": "link",
               "outputField": "link",
               "fieldType": "VarChar"
          },
          {
               "name": "medium_articles_index_preserve_publication",
               "action": "PRESERVE",
               "inputField": "publication",
               "outputField": "publication",
               "fieldType": "VarChar"
          }
     ],
     "clusterId": "in03-db58c34c4cc4dd2",
     "newCollectionName": "medium_articles"
     }'
     ```

- Create a search pipeline

     ```shell
     curl --http1.1 --request POST \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
     --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/" \
     -d '{
     "name": "medium_articles_search",
     "description": "Ingestion of medium articles",
     "type": "SEARCH",
     "functions": [
          {
               "name": "medium_articles_search_func",
               "action": "SEARCH_DOC_CHUNK",
               "clusterId": "in03-db58c34c4cc4dd2",
               "inputField": "query_text",
               "collectionName": "medium_articles"
          }
     ]
     }'
     ```

- Create a deletion pipeline

     ```shell
     curl --http1.1 --request POST \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
     --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/" \
     -d '{
     "name": "medium_articles_deletion",
     "description": "Ingestion of medium articles",
     "type": "DELETION",
     "functions": [
          {
               "name": "medium_articles_deletion_func",
               "action": "PURGE_DOC_INDEX",
               "inputField": "doc_name",
          }
     ],
     "clusterId": "in03-db58c34c4cc4dd2",
     "collectionName": "medium_articles"
     }'
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
|  | (to be added) |


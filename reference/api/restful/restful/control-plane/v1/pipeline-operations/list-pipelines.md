---
displayed_sidebar: restfulSidebar
sidebar_position: 17
slug: /restful/list-pipelines
title: List Pipelines
---

import RestHeader from '@site/src/components/RestHeader';

List all pipelines in a project.

<RestHeader method="get" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/pipelines" />

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
    --url "https://controller.api.{CLOUD_REGION}.zillizcloud.com/v1/pipelines?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx"
```

Possible response

```shell
{
  "code": 200,
  "data": [
    {
     "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxxxx",
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
     "clusterId": "inxx-xxxxxxxxxxxxxxx",
     "newCollectionName": "my_new_collection"
    },
    {
        "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "my_text_search_pipeline",
        "type": "SEARCH",
        "description": "A pipeline that receives text and search for semantically similar doc chunks",
        "status": "SERVING",
        "functions": [
            {
                "action": "SEARCH_DOC_CHUNK",
                "name": "search_chunk_text_and_title",
                "inputField": null,
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_new_collection"
            }
        ]
    },
    {
        "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxxxx",
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
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "my_new_collection"
    }
  ]
}
```




## Request

### Parameters

- No query parameters required

- No path parameters required

- No header parameters required

### Request Body

No request body required

## Response

Returns a list of pipelines in detail.

### Response Body

```json
{
    "code": "string",
    "data": [
        {}
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |
| __data[][opt_1]__ | __object__<br/> |
| __data[][opt_1].pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data[][opt_1].name__ | __string__  <br/>Name of the pipeline.  |
| __data[][opt_1].type__ | __string__  <br/>Type of the pipeline. For an ingestion pipeline, the value should be `INGESTION`.  |
| __data[][opt_1].description__ | __string__  <br/>Description of the pipeline.  |
| __data[][opt_1].status__ | __string__  <br/>Current status of the pipeline. If the value is other than `SERVING`, the pipeline is not working.  |
| __data[][opt_1][].functions__ | __array__<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| __data[][opt_1][].functions[]__ | __object__ \| __object__ \| __object__ \| __object__<br/> |
| __data[][opt_1][].functions[].[opt_1]__ | __object__<br/> |
| __data[][opt_1][].functions[].[opt_1].name__ | __string__  <br/>Name of the function to create.  |
| __data[][opt_1][].functions[].[opt_1].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __data[][opt_1][].functions[].[opt_1][].inputFields__ | __array__<br/>Names the fields according to your needs. In an `INDEX_TEXT` function of an ingestion pipeline, use them for the user-provided texts. |
| __data[][opt_1][].functions[].[opt_1][].inputFields[]__ | __string__  <br/>An input field.  |
| __data[][opt_1][].functions[].[opt_1].langauge__ | __string__  <br/>Language that your document is in. Possible values are `english` or `chinese`. The parameter applies only to ingestion pipelines.  |
| __data[][opt_1][].functions[].[opt_1].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __data[][opt_1][].functions[].[opt_2]__ | __object__<br/> |
| __data[][opt_1][].functions[].[opt_3]__ | __object__<br/> |
| __data[][opt_1][].functions[].[opt_3].name__ | __string__  <br/>Name of the function to create.  |
| __data[][opt_1][].functions[].[opt_3].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __data[][opt_1][].functions[].[opt_3][].inputFields__ | __array__<br/>Names the fields according to your needs. In an `INDEX_IMAGE` function of an ingestion pipeline: `image_url` stands for pre-signed image URLs in GCS or AWS S3 buckets, and `image_id` stands for the image ID. |
| __data[][opt_1][].functions[].[opt_3][].inputFields[]__ | __string__  <br/>An input field.  |
| __data[][opt_1][].functions[].[opt_3].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __data[][opt_1][].functions[].[opt_4]__ | __object__<br/> |
| __data[][opt_1][].functions[].[opt_4].name__ | __string__  <br/>Name of the function to create.  |
| __data[][opt_1][].functions[].[opt_4].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __data[][opt_1][].functions[].[opt_4].inputField__ | __string__  <br/>Name the field according to your needs. In a preserve function of an ingestion pipeline, Zilliz Cloud uses the value as the name of a field in the collection to create.  |
| __data[][opt_1][].functions[].[opt_4].outputField__ | __string__  <br/>Name of the output field. The value should be the same as that of `input_field`.  |
| __data[][opt_1][].functions[].[opt_4].fieldType__ | __string__  <br/>Data type of the field to create in the target collection. Possible values are `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`, and `VARCHAR`.  |
| __data[][opt_1].clusterID__ | __string__  <br/>The target cluster to which the pipeline applies.  |
| __data[][opt_1].collectionName__ | __string__  <br/>The target collection to which the pipeline applies.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |


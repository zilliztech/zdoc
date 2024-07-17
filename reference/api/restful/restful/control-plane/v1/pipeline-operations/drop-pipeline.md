---
displayed_sidebar: restfulSidebar
sidebar_position: 5
slug: /restful/drop-pipeline
title: Drop Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Drop a specific pipeline

<RestHeader method="delete" endpoint="https://${CLUSTER_ENDPOINT}/v1/pipelines/{PIPELINE_ID}" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>


```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request DELETE "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/pipelines/pipe-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${API_KEY}" 
```

Possible response is similar to the following.

```json
{
    "code": 200,
    "data": {
        "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "my_doc_ingestion_pipeline",
        "type": "INGESTION",
        "createTimestamp": 1720601290000,
        "description": "A doc ingestion pipeline",
        "status": "SERVING",
        "totalUsage": {
            "embedding": 0
        },
        "functions": [
            {
                "name": "index_my_doc",
                "action": "INDEX_DOC",
                "inputFields": [
                    "doc_url",
                    "doc_name"
                ],
                "language": "ENGLISH",
                "chunkSize": 500,
                "splitBy": [
                    "\n\n",
                    "\n",
                    " ",
                    ""
                ],
                "embedding": "zilliz/bge-base-en-v1.5"
            },
            {
                "name": "keep_doc_info",
                "action": "PRESERVE",
                "inputField": "publish_year",
                "outputField": "publish_year",
                "fieldType": "Int16"
            }
        ],
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "doc_pipeline"
    }
}
```



## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __PIPELINE_ID__  | **string**(required)<br/>|

- No header parameters required

### Request Body

No request body required

## Response

Returns information of a specific pipeline just dropped.

### Response Body

#### Option 1: 

```json
{
    "code": "integer",
    "data": {
        "pipelineId": "integer",
        "name": "string",
        "type": "string",
        "description": "string",
        "status": "string",
        "functions": {
            "oneOf": [
                {
                    "name": "string",
                    "action": "string",
                    "inputFields": [
                        {}
                    ],
                    "langauge": "string",
                    "embedding": "string"
                },
                {
                    "name": "string",
                    "action": "string",
                    "inputField": "string",
                    "langauge": "string",
                    "chunkSize": "integer",
                    "embedding": "string",
                    "splitBy": "string"
                },
                {
                    "name": "string",
                    "action": "string",
                    "inputFields": [
                        {}
                    ],
                    "embedding": "string"
                },
                {
                    "name": "string",
                    "action": "string",
                    "inputField": "string",
                    "outputField": "string",
                    "fieldType": "string"
                }
            ]
        },
        "clusterID": "string",
        "collectionName": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data.name__ | __string__  <br/>Name of the pipeline.  |
| __data.type__ | __string__  <br/>Type of the pipeline. For an ingestion pipeline, the value should be `INGESTION`.  |
| __data.description__ | __string__  <br/>Description of the pipeline.  |
| __data.status__ | __string__  <br/>Current status of the pipeline. If the value is other than `SERVING`, the pipeline is not working.  |
| __functions__ | __object__ \| __object__ \| __object__ \| __object__<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| __functions[opt_1]__ | __object__<br/> |
| __functions[opt_1].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_1].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_1][].inputFields__ | __array__<br/>Names the fields according to your needs. In an `INDEX_TEXT` function of an ingestion pipeline, use them for the user-provided texts. |
| __functions[opt_1][].inputFields[]__ | __string__  <br/>An input field.  |
| __functions[opt_1].langauge__ | __string__  <br/>Language that your document is in. Possible values are `english` or `chinese`. The parameter applies only to ingestion pipelines.  |
| __functions[opt_1].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __functions[opt_2]__ | __object__<br/> |
| __functions[opt_2].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_2].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_2].inputField__ | __string__  <br/>Name the field according to your needs. In an `INDEX_DOC` function of an ingestion pipeline, use it for pre-signed document URLs in GCS or AWS S3 buckets.  |
| __functions[opt_2].langauge__ | __string__  <br/>Language that your document is in. Possible values are `english` or `chinese`. The parameter applies only to ingestion pipelines.  |
| __functions[opt_2].chunkSize__ | __integer__  <br/>The maximum size of a splitted document segment.  |
| __functions[opt_2].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __functions[opt_2].splitBy__ | __string__  <br/>The splitters that Zilliz Cloud uses to split the specified docs.  |
| __functions[opt_3]__ | __object__<br/> |
| __functions[opt_3].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_3].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_3][].inputFields__ | __array__<br/>Names the fields according to your needs. In an `INDEX_IMAGE` function of an ingestion pipeline: `image_url` stands for pre-signed image URLs in GCS or AWS S3 buckets, and `image_id` stands for the image ID. |
| __functions[opt_3][].inputFields[]__ | __string__  <br/>An input field.  |
| __functions[opt_3].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __functions[opt_4]__ | __object__<br/> |
| __functions[opt_4].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_4].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_4].inputField__ | __string__  <br/>Name the field according to your needs. In a preserve function of an ingestion pipeline, Zilliz Cloud uses the value as the name of a field in the collection to create.  |
| __functions[opt_4].outputField__ | __string__  <br/>Name of the output field. The value should be the same as that of `input_field`.  |
| __functions[opt_4].fieldType__ | __string__  <br/>Data type of the field to create in the target collection. Possible values are `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`, and `VARCHAR`.  |
| __data.clusterID__ | __string__  <br/>The target cluster to which the pipeline applies.  |
| __data.collectionName__ | __string__  <br/>The target collection to which the pipeline applies.  |

#### Option 2: 

```json
{
    "code": "integer",
    "data": {
        "pipelineId": "integer",
        "name": "string",
        "type": "string",
        "description": "string",
        "status": "string",
        "functions": [
            {
                "name": "string",
                "action": "string",
                "inputFields": [
                    {}
                ],
                "clusterID": "string",
                "collectionName": "string",
                "reranker": "string"
            }
        ]
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data.name__ | __string__  <br/>Name of the pipeline  |
| __data.type__ | __string__  <br/>Type of the pipeline. For a search pipeline, the value should be `SEARCH`.  |
| __data.description__ | __string__  <br/>Description of the pipeline.  |
| __data.status__ | __string__  <br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working.  |
| __data[].functions__ | __array__<br/>Functions in the pipeline. For a search pipeline, each of its member functions targets at a different collection. |
| __data[].functions[]__ | __object__<br/> |
| __data[].functions[].name__ | __string__  <br/>Name of the function.  |
| __data[].functions[].action__ | __string__  <br/>Type of the function. For a search function, the value should be `SEARCH_DOC_CHUNKS`, `SEARCH_TEXT`, `SEARCH_IMAGE_BY_IMAGE`, and `SEARCH_IMAGE_BY_TEXT`.  |
| __data[].functions[][].inputFields__ | __array__<br/>Name of the input fields. |
| __data[].functions[][].inputFields[]__ | __string__  <br/>For a `SEARCH_DOC_CHUNKS` or a `SEARCH_IMAGE_BY_TEXT` function, you should include `query_text` as the value.  |
| __data[].functions[].clusterID__ | __string__  <br/>Target cluster of this function.  |
| __data[].functions[].collectionName__ | __string__  <br/>Target collection of this function.  |
| __data[].functions[].reranker__ | __string__  <br/>If you need to reorder or rank a set of candidate outputs to improve the quality of the search results, set this parameter to a reranker model. This parameter applies only to pipelines for Text and Doc Data. Currently, only `zilliz/bge-reranker-base` is available as the parameter value.  |

#### Option 3: 

```json
{
    "code": "integer",
    "data": {
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
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data.name__ | __string__  <br/>Name of the pipeline.  |
| __data.type__ | __string__  <br/>Type of the pipeline. For a deletion pipeline, the value should be `DELETION`.  |
| __data.description__ | __string__  <br/>Description of the pipeline.  |
| __data.status__ | __string__  <br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working.  |
| __data[].functions__ | __array__<br/>Functions in the pipeline. For a deletion pipeline, there can be multiple member functions with each representing a deletion request. |
| __data[].functions[]__ | __object__<br/> |
| __data[].functions[].name__ | __string__  <br/>Name of the function.  |
| __data[].functions[].action__ | __string__  <br/>Type of the function. For a deletion pipeline, its member functions should be of `PURGE_BY_EXPRESSION`, `PURGE_DOC_INDEX`, and `PURGE_IMAGE_BY_ID`.  |
| __data[].functions[].inputField__ | __string__  <br/>Name of the input field. For a `PURGE_DOC_INDEX` function, the value should be the name of the doc to delete.  |
| __data.clusterID__ | __string__  <br/>Target cluster of the pipeline.  |
| __data.collectionName__ | __string__  <br/>Target collection of the pipeline.  |

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


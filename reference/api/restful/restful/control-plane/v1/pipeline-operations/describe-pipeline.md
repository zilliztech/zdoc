---
displayed_sidebar: restfulSidebar
sidebar_position: 4
slug: /restful/describe-pipeline
title: Describe Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Describe a specific pipeline by its name.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/pipelines/{PIPELINE_ID}" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/pipelines/pipe-xxxxxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${API_KEY}" 
```

Possible return is similar to the following.

```json
{
    "code": 200,
    "data": {
        "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxxxxxx",
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
    | __PIPELINE_ID__  | **string**(required)<br/>A valid pipeline ID obtained from either the list-pipelines API endpoints or Zilliz Cloud console.|

- No header parameters required

### Request Body

No request body required

## Response

Returns a pipeline in detail.

### Response Body

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
                "functions": {
                    "oneOf": [
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
                            "inputField": "string",
                            "outputField": "string",
                            "fieldType": "string"
                        }
                    ]
                },
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
                ],
                "clusterId": "string",
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

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__ \| __object__ \| __object__<br/> |
| __data[opt_1]__ | __object__<br/> |
| __data[opt_1].pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data[opt_1].name__ | __string__  <br/>Name of the pipeline.  |
| __data[opt_1].type__ | __string__  <br/>Type of the pipeline. For an ingestion pipeline, the value should be `INGESTION`.  |
| __data[opt_1].description__ | __string__  <br/>Description of the pipeline.  |
| __data[opt_1].status__ | __string__  <br/>Current status of the pipeline. If the value is other than `SERVING`, the pipeline is not working.  |
| __functions__ | __object__ \| __object__<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| __functions[opt_1]__ | __object__<br/> |
| __functions[opt_1].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_1].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_1].inputField__ | __string__  <br/>Name the field according to your needs. In an `INDEX_DOC` function of an ingestion pipeline, use it for pre-signed document URLs in GCS or AWS S3 buckets.  |
| __functions[opt_1].langauge__ | __string__  <br/>Language that your document is in. Possible values are `english` or `chinese`. The parameter applies only to ingestion pipelines.  |
| __functions[opt_1].chunkSize__ | __integer__  <br/>The maximum size of a splitted document segment.  |
| __functions[opt_1].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __functions[opt_1].splitBy__ | __string__  <br/>The splitters that Zilliz Cloud uses to split the specified docs.  |
| __functions[opt_2]__ | __object__<br/> |
| __functions[opt_2].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_2].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_2].inputField__ | __string__  <br/>Name the field according to your needs. In a preserve function of an ingestion pipeline, Zilliz Cloud uses the value as the name of a field in the collection to create.  |
| __functions[opt_2].outputField__ | __string__  <br/>Name of the output field. The value should be the same as that of `input_field`.  |
| __functions[opt_2].fieldType__ | __string__  <br/>Data type of the field to create in the target collection. Possible values are `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`, and `VARCHAR`.  |
| __data[opt_1].clusterID__ | __string__  <br/>The target cluster to which the pipeline applies.  |
| __data[opt_1].collectionName__ | __string__  <br/>The target collection to which the pipeline applies.  |
| __data[opt_2]__ | __object__<br/> |
| __data[opt_2].pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data[opt_2].name__ | __string__  <br/>Name of the pipeline  |
| __data[opt_2].type__ | __string__  <br/>Type of the pipeline. For a search pipeline, the value should be `SEARCH`.  |
| __data[opt_2].description__ | __string__  <br/>Description of the pipeline.  |
| __data[opt_2].status__ | __string__  <br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working.  |
| __data[opt_2][].functions__ | __array__<br/>Functions in the pipeline. For a search pipeline, each of its member functions targets at a different collection. |
| __data[opt_2][].functions[]__ | __object__<br/> |
| __data[opt_2][].functions[].name__ | __string__  <br/>Name of the function.  |
| __data[opt_2][].functions[].action__ | __string__  <br/>Type of the function. For a search function, the value should be `SEARCH_DOC_CHUNKS`.  |
| __data[opt_2][].functions[].inputField__ | __string__  <br/>Name of the input field. For a `SEARCH_DOC_CHUNKS` function, the value should be your query text.  |
| __data[opt_2][].functions[].clusterID__ | __string__  <br/>Target cluster of this function.  |
| __data[opt_2][].functions[].collectionName__ | __string__  <br/>Target collection of this function.  |
| __data[opt_2].clusterId__ | __string__  <br/>Target cluster of the pipeline.  |
| __data[opt_2].collectionName__ | __string__  <br/>Target collection of the pipeline.  |
| __data[opt_3]__ | __object__<br/> |
| __data[opt_3].pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data[opt_3].name__ | __string__  <br/>Name of the pipeline.  |
| __data[opt_3].type__ | __string__  <br/>Type of the pipeline. For a deletion pipeline, the value should be `DELETION`.  |
| __data[opt_3].description__ | __string__  <br/>Description of the pipeline.  |
| __data[opt_3].status__ | __string__  <br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working.  |
| __data[opt_3][].functions__ | __array__<br/>Functions in the pipeline. For a deletion pipeline, there can be multiple member functions with each representing a deletion request. |
| __data[opt_3][].functions[]__ | __object__<br/> |
| __data[opt_3][].functions[].name__ | __string__  <br/>Name of the function.  |
| __data[opt_3][].functions[].action__ | __string__  <br/>Type of the function. For a deletion pipeline, its member functions should be of `PURGE_DOC_INDEX`.  |
| __data[opt_3][].functions[].inputField__ | __string__  <br/>Name of the input field. For a `PURGE_DOC_INDEX` function, the value should be the name of the doc to delete.  |
| __data[opt_3].clusterID__ | __string__  <br/>Target cluster of the pipeline.  |
| __data[opt_3].collectionName__ | __string__  <br/>Target collection of the pipeline.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |


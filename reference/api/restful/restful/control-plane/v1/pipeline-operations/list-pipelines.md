---
displayed_sidebar: restfulSidebar
sidebar_position: 13
slug: /restful/list-pipelines
title: List Pipelines
---

import RestHeader from '@site/src/components/RestHeader';

List all pipelines in a project.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/pipelines" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>


```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/pipelines?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${API_KEY}" 
```

Possible return is similar to the following.

```json
{
    "code": 200,
    "data": [
        {
            "pipelineId": "pipe-cf7c8f130608912949a032",
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
            "clusterId": "in03-bdfdb12c2f6cae2",
            "collectionName": "doc_pipeline"
        },
        {
            "pipelineId": "pipe-22bf025b1941499b56e73f",
            "name": "my_text_ingestion_pipeline",
            "type": "INGESTION",
            "createTimestamp": 1720601012000,
            "description": "A text ingestion pipeline",
            "status": "SERVING",
            "totalUsage": {
                "embedding": 0
            },
            "functions": [
                {
                    "name": "index_my_text",
                    "action": "INDEX_TEXT",
                    "inputFields": [
                        "text_list"
                    ],
                    "language": "ENGLISH",
                    "embedding": "zilliz/bge-base-en-v1.5"
                },
                {
                    "name": "keep_text_info",
                    "action": "PRESERVE",
                    "inputField": "source",
                    "outputField": "source",
                    "fieldType": "VarChar"
                }
            ],
            "clusterId": "in03-bdfdb12c2f6cae2",
            "collectionName": "text_pipeline"
        }
    ]
}
```



## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __projectId__  | **string**<br/>The ID of the project to which this pipeline belongs.|

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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
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
| __data[][opt_1][].functions[].[opt_2].name__ | __string__  <br/>Name of the function to create.  |
| __data[][opt_1][].functions[].[opt_2].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __data[][opt_1][].functions[].[opt_2].inputField__ | __string__  <br/>Name the field according to your needs. In an `INDEX_DOC` function of an ingestion pipeline, use it for pre-signed document URLs in GCS or AWS S3 buckets.  |
| __data[][opt_1][].functions[].[opt_2].langauge__ | __string__  <br/>Language that your document is in. Possible values are `english` or `chinese`. The parameter applies only to ingestion pipelines.  |
| __data[][opt_1][].functions[].[opt_2].chunkSize__ | __integer__  <br/>The maximum size of a splitted document segment.  |
| __data[][opt_1][].functions[].[opt_2].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __data[][opt_1][].functions[].[opt_2].splitBy__ | __string__  <br/>The splitters that Zilliz Cloud uses to split the specified docs.  |
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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |


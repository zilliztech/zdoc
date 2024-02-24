---
displayed_sidebar: restfulSidebar
sidebar_position: 26
slug: /run-pipeline
title: Run Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Trigger a specific pipeline.

<RestHeader method="post" endpoint="https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/pipeline/{PIPELINE_ID}/run" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::

- Run a data ingestion pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-6ca5dd1b4672659d3c3487/run" \
        -d '{
            "data": {
                "doc_url": "https://storage.googleapis.com/example-bucket/zilliz_concept_doc.md?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=example%40example-project.iam.gserviceaccount.com%2F20181026%2Fus-central1%2Fstorage%2Fgoog4_request&X-Goog-Date=20181026T181309Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=247a2aa45f169edf4d187d54e7cc46e4731b1e6273242c4f4c39a1d2507a0e58706e25e3a85a7dbb891d62afa8496def8e260c1db863d9ace85ff0a184b894b117fe46d1225c82f2aa19efd52cf21d3e2022b3b868dcc1aca2741951ed5bf3bb25a34f5e9316a2841e8ff4c530b22ceaa1c5ce09c7cbb5732631510c20580e61723f5594de3aea497f195456a2ff2bdd0d13bad47289d8611b6f9cfeef0c46c91a455b94e90a66924f722292d21e24d31dcfb38ce0c0f353ffa5a9756fc2a9f2b40bc2113206a81e324fc4fd6823a29163fa845c8ae7eca1fcf6e5bb48b3200983c56c5ca81fffb151cca7402beddfc4a76b133447032ea7abedc098d2eb14a7", 
                "publish_year": 2023
            }
        }'
    ```

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "doc_name": "zilliz_concept_doc.md",
            "num_chunks": 123,
            "token_usage": 200
        }
    }
    ```

- Run a semantic search pipeline.

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-26a18a66ffc8c0edfdb874/run" \
        -d '{
            "data": {
                "query_text": "How many collections can a cluster with more than 8 CUs hold?"
            },
            "params":{
                "limit": 1,
                "offset": 0,
                "outputFields": [ "chunk_text", "chunk_id", "doc_name" ],
                "filter": "chunk_id >= 0", 
            }
        }'
    ```

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "token_usage": 200,
            "result": [
                {
                    "id": "445951244000281783",
                    "distance": 0.7270776033401489,
                    "chunk_text": "After determining the CU type, you must also specify its size. Note that the\nnumber of collections a cluster can hold varies based on its CU size. A\ncluster with less than 8 CUs can hold no more than 32 collections, while a\ncluster with more than 8 CUs can hold as many as 256 collections.\n\nAll collections in a cluster share the CUs associated with the cluster. To\nsave CUs, you can unload some collections. When a collection is unloaded, its\ndata is moved to disk storage and its CUs are freed up for use by other\ncollections. You can load the collection back into memory when you need to\nquery it. Keep in mind that loading a collection requires some time, so you\nshould only do so when necessary.\n\n## Collection\n\nA collection collects data in a two-dimensional table with a fixed number of\ncolumns and a variable number of rows. In the table, each column corresponds\nto a field, and each row represents an entity.\n\nThe following figure shows a sample collection that comprises six entities and\neight fields.\n\n### Fields\n\nIn most cases, people describe an object in terms of its attributes, including\nsize, weight, position, etc. These attributes of the object are similar to the\nfields in a collection.\n\nAmong all the fields in a collection, the primary key is one of the most\nspecial, because the values stored in this field are unique throughout the\nentire collection. Each primary key maps to a different record in the\ncollection.",
                    "chunk_id": 123,
                    "doc_name": "zilliz_concept_doc.md"
                }
            ],
        }
    }
    ```

- Run a doc deletion pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-7227d0729d73e63002ed46/run" \
        -d '{
            "data": {
                "doc_name": "zilliz_concept_doc.md",
            }
        }'
    ```    

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "num_deleted_chunks": 567
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

```json
{
    "data": {
        "doc_url": "string",
        "<scalar_field_name>": "string"
    }
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `data`  | **object**(required)<br/>Data ingestion parameters.|
| `data.doc_url`  | **string**<br/>An active pre-signed URL of one of your documents in a GCS or an AWS S3 bucket. You should replace `doc_url` with the field name you have defined when you create the pipeline. Supported file types are `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, and `.pptx`|
| `data.<scalar_field_name>`  | **string**<br/>|

```json
{
    "data": {
        "query_text": "string"
    },
    "params": {
        "limit": "integer",
        "offset": "integer",
        "outputFields": [
            {}
        ],
        "filter": "string"
    }
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `data`  | **object**(required)<br/>Search data.|
| `data.query_text`  | **string**<br/>A query text. Zilliz Cloud embeds it and use the generated vector embeddings to conduct a search in the target collection.|
| `params`  | **object**(required)<br/>Search parameters.|
| `params.limit`  | **integer**<br/>Total number of records to return.|
| `params.offset`  | **integer**<br/>Total number of records to skip in the search results.|
| `params.outputFields`  | **array**<br/>A list of fields to output for each match in the search result.|
| `params.filter`  | **string**<br/>A boolean expression for Zilliz Cloud to filter records before actual searches.|

```json
{
    "data": {
        "doc_name": "string"
    }
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `data`  | **object**(required)<br/>Payload of the doc deletion request.|
| `data.doc_name`  | **string**<br/>Name of the document to delete. Note that you can delete document by its name, and all the chunks of the document will be removed.|

## Response

Returns the result of running a specific pipeline.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "num_chunks": "integer",
        "doc_name": "string",
        "token_usage": "integer"
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
| `data.num_chunks`   | **integer**<br/>Number of chunks generated. |
| `data.doc_name`   | **string**<br/>Name of the chunked document with the file extension. |
| `data.token_usage`   | **integer**<br/>Number of consumed tokens in this operation. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 10041 | (Possible pipeline errors are all under this error code.) |


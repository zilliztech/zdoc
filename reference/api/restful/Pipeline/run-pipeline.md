---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /run-pipeline
title: Run Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Trigger a specific pipeline.

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipeline/{PIPELINE_ID}/run" />

---

## Example


Run pipelines for data ingestion, semantic similarity searches, and doc deletion.

- Run a data ingestion pipeline

     ```curl
     url --http1.1 --request POST \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
     --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/pipe-cde31766ffc8b8285b841d/run" \
     -d '{
          "data": {
               "signed_url": "https://storage.googleapis.com/medium-passages/passages/0.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=storage-viewer%40anthony-364406.iam.gserviceaccount.com%2F20231130%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20231130T033222Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=843c8944347ec9825ebaf7642a19e01651fa17a30834fd480fb7b9149e75fd611fc528c9efe82b252843ddebbaa132362b80acf859a49c6adcc8b70d0dd431aeed3816760ff5dc7ed3649faaa0347b33125983d0989721f8b5e42a4c63eeecf3d60ac1dcac27f21994b4839d68db9902e81de066f19e5c511aeab41171b31dd40cf1a9a44a8bc9d6c6d812aa78d17d6cf5b2f1b836d35d466277fcefd81ecc339ff8f191cc87d0e912f759b15977029ec97f36da67f5cdd0cc74ad8e92e0cf03f6f96a80c8ad2c996ce291c7b180d2bb154c917dc53a3b5bea89351f08afe39649a1896ed62c410f4d418c9aa087a30c77262987b4be0db7951b3abe56d13989",
               "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
               "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
               "publication": "The Startup",
          }
     }'
     ```

- Run a semantic search pipeline.

     ```curl
     curl --http1.1 --request POST \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
     --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/pipe-cde31766ffc8b8285b841d/run" \
     -d '{
          "data": {
               "query_text": "How can I organize my knowledge base using vector database?"
          },
          "params": {
               "limit": 3,
               "outputFields": ["title", "doc_name", "chunk_text"]
          }
     }'
     ```

- Run a doc deletion pipeline

     ```curl
     curl --http1.1 --request POST \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
     --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/pipe-cde31766ffc8b8285b841d/run" \
     -d '{
          "data": {
               "doc_name": "0.txt"
          }
     }'
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

成功

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "num_chunks": "integer",
        "doc_name": "string"
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
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
|  | (to be added) |


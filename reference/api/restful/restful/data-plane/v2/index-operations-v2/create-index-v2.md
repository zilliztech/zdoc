---
displayed_sidebar: restfulSidebar
sidebar_position: 49
slug: /restful/create-index-v2
title: Create Index
---

import RestHeader from '@site/src/components/RestHeader';

This creates a named index for a target field, which can either be a vector field or a scalar field.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/indexes/create" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "custom_setup_not_indexed",
    "indexParams": [
        {
            "metricType": "L2",
            "fieldName": "my_vector",
            "indexName": "my_vector",
            "indexConfig": {
                "index_type": "IVF_FLAT",
                "nlist": "1024"
            }
        }
    ]
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": {}
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string",
    "indexParams": [
        {
            "metricType": "string",
            "fieldName": "string",
            "indexName": "string",
            "params": {
                "index_type": "string",
                "M": "integer",
                "efConstruction": "integer",
                "nlist": "integer"
            }
        }
    ]
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database to which the collection belongs.<br/>Setting this to a non-existing database results in an error.  |
| __collectionName__ | string  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __indexParams__ | array<br/>The parameters that apply to the index-building process. |
| __indexParams[]__ | object<br/> |
| __indexParams[].metricType__ | string  <br/>The similarity metric type used to build the index.<br/>The value defaults to COSINE  |
| __indexParams[].fieldName__ | string  <br/>The name of the target field on which an index is to be created.  |
| __indexParams[].indexName__ | string  <br/>The name of the index to create, the value defaults to the target field name.  |
| __indexParams[].params__ | object<br/>The index type and related settings. For details, refer to [Vector Indexes](https://milvus.io/docs/index.md). |
| __indexParams[].params.index_type__ | string  <br/>The type of the index to create  |
| __indexParams[].params.M__ | integer  <br/>The maximum degree of the node and applies only when index_type is set to __HNSW__.  |
| __indexParams[].params.efConstruction__ | integer  <br/>The search scope. This applies only when **index_type** is set to **HNSW**  |
| __indexParams[].params.nlist__ | integer  <br/>The number of cluster units. This applies to IVF-related index types.  |

## Response

A Status object indicating whether this operation succeeds.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {}
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
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

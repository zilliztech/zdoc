---
displayed_sidebar: restfulSidebar
sidebar_position: 15
slug: /restful/create-index-v2
title: Create Index
---

import RestHeader from '@site/src/components/RestHeader';

This creates a named index for a target field, which can either be a vector field or a scalar field.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
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

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation.
Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
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
| __collectionName__ | __string__  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __indexParams__ | __array__<br/>The parameters that apply to the index-building process. |
| __indexParams[]__ | __object__<br/> |
| __indexParams[].metricType__ | __string__  <br/>The similarity metric type used to build the index.<br/>The value defaults to COSINE  |
| __indexParams[].fieldName__ | __string__  <br/>The name of the target field on which an index is to be created.  |
| __indexParams[].indexName__ | __string__  <br/>The name of the index to create, the value defaults to the target field name.  |
| __indexParams[].params__ | __object__<br/>The index type and related settings. For details, refer to [Vector Indexes](https://milvus.io/docs/index.md). |
| __indexParams[].params.index_type__ | __string__  <br/>The type of the index to create  |
| __indexParams[].params.M__ | __integer__  <br/>The maximum degree of the node and applies only when index_type is set to __HNSW__.  |
| __indexParams[].params.efConstruction__ | __integer__  <br/>The search scope. This applies only when **index_type** is set to **HNSW**  |
| __indexParams[].params.nlist__ | __integer__  <br/>The number of cluster units. This applies to IVF-related index types.  |

## Response

A Status object indicating whether this operation succeeds.

### Response Body

```json
{
    "code": "integer",
    "data": {}
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |

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


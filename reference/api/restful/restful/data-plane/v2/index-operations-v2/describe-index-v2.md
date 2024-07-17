---
displayed_sidebar: restfulSidebar
sidebar_position: 22
slug: /restful/describe-index-v2
title: Describe Index
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the current index.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/indexes/describe" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/indexes/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "indexName": "vector",
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": [
        {
            "failReason": "",
            "fieldName": "vector",
            "indexName": "vector",
            "indexState": "Finished",
            "indexType": "AUTOINDEX",
            "indexedRows": 0,
            "metricType": "COSINE",
            "pendingRows": 0,
            "totalRows": 0
        }
    ]
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
    "indexName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of an the collection to which the index belongs.  |
| __indexName__ | __string__  <br/>The name of the index to describe.  |

## Response

An object that contains the detailed description of the current index.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {
            "fieldName": "string",
            "indexName": "string",
            "indexState": "string",
            "indexType": "string",
            "indexedRows": "integer",
            "metricType": "string",
            "pendingRows": "integer",
            "totalRows": "integer",
            "failReason": "string"
        }
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |
| __data[].fieldName__ | __string__  <br/>The name of the target field.  |
| __data[].indexName__ | __string__  <br/>The name of the index.  |
| __data[].indexState__ | __string__  <br/>The status of the indexing progress.  |
| __data[].indexType__ | __string__  <br/>The type of this index.  |
| __data[].indexedRows__ | __integer__  <br/>The total number o rows that have been indexed.  |
| __data[].metricType__ | __string__  <br/>The type of the metric.  |
| __data[].pendingRows__ | __integer__  <br/>The number of rows that are waiting to be indexed.  |
| __data[].totalRows__ | __integer__  <br/>The total number of entities/rows  |
| __data[].failReason__ | __string__  <br/>The reason for the failure to build indexes.  |

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


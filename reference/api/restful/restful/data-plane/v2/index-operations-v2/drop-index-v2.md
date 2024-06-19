---
displayed_sidebar: restfulSidebar
sidebar_position: 53
slug: /restful/drop-index-v2
title: Drop Index
---

import RestHeader from '@site/src/components/RestHeader';

This operation deletes index from a specified collection.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/indexes/drop" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/indexes/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "indexName": "my_vector",
    "collectionName": "custom_setup_not_indexed"
}'
```
Possible response is as follows:
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
    "dbName": "string",
    "collectionName": "string",
    "indexName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of the database to which the collection belongs.<br/>Setting this to a non-existing database results in an error.  |
| __collectionName__ | __string__  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __indexName__ | __string__  <br/>The name fo the target index.  |

## Response

None

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


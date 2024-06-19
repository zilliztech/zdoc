---
displayed_sidebar: restfulSidebar
sidebar_position: 58
slug: /restful/release-partitions-v2
title: Release Partitions
---

import RestHeader from '@site/src/components/RestHeader';

This operation releases the data of the current partition from memory.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/partitions/release" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/partitions/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "partitionNames": [
        "_default",
        "january"
    ],
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following
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
    "partitionNames": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of the database to which the collection belongs.<br/>Setting this to a non-existing database results in an error.  |
| __collectionName__ | __string__  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __partitionNames__ | __array__<br/>The list of names of the target partitions. |
| __partitionNames[]__ | __string__  <br/>  |

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


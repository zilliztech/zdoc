---
displayed_sidebar: restfulSidebar
sidebar_position: 61
slug: /restful/get-partition-statistics-v2
title: Get Partition Statistics
---

import RestHeader from '@site/src/components/RestHeader';

This operations gets the number of entities in a partition.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/partitions/get_stats" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/partitions/get_stats" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "partitionName": "january",
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": {
        "rowCount": 0
    }
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
    "partitionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of an existing database. The value defaults to __default__.  |
| __collectionName__ | string  <br/>The name of an existing collection.  |
| __partitionName__ | string  <br/>The name of the target partition of this operation.  |

## Response

成功

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "rowCount": "integer"
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
| __code__ | integer  <br/>  |
| __data__ | object<br/> |
| __data.rowCount__ | integer  <br/>The number of entities.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

---
displayed_sidebar: restfulSidebar
sidebar_position: 57
slug: /restful/has-partition-v2
title: Has Partition
---

import RestHeader from '@site/src/components/RestHeader';

This operation checks whether a partition exists.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/partitions/has" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/partitions/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "partitionName": "january",
    "collectionName": "test_collection"
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": {
        "has": true
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
| __partitionName__ | string  <br/>The name of the partition to test.  |

## Response

A boolean value indicating whether the specified partition exists.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "has": "boolean"
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
| __data.has__ | boolean  <br/>A boolean value indicates whether the specified partition exists.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

---
displayed_sidebar: restfulSidebar
sidebar_position: 57
slug: /restful/load-partitions-v2
title: Load Partitions
---

import RestHeader from '@site/src/components/RestHeader';

This operation loads the data of the current partition into memory.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/partitions/load" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/partitions/load" \
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
    "partitionNames": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database to which the collection belongs.<br/>Setting this to a non-existing database results in an error.  |
| __collectionName__ | string  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __partitionNames__ | array<br/>The list of names of the target partitions. |
| __partitionNames[]__ | string  <br/>  |

## Response

None

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

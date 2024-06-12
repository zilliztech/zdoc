---
displayed_sidebar: restfulSidebar
sidebar_position: 36
slug: /restful/get-v2
title: Get
---

import RestHeader from '@site/src/components/RestHeader';

This operation gets specific entities by their IDs.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/entities/get" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/entities/get" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup",
    "id": [
        1,3,5
    ],
    "outputFields": [
        "color"
    ]
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        {
            "color": "red_7025",
            "id": 1
        },
        {
            "color": "pink_9298",
            "id": 3
        },
        {
            "color": "yellow_4222",
            "id": 5
        }
    ]
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
    "outputFields": [],
    "partitionNames": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __id__ | integer | string | array | array<br/>A specific entity ID or a list of entity IDs. |
| __outputFields__ | array<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | string  <br/>  |
| __partitionNames__ | array<br/>The name of the partitions to which this operation applies. |
| __partitionNames[]__ | string  <br/>PartitionName  |

## Response

A list of dictionaries with each dictionary representing a queried entity.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": [
        {}
    ]
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
| __data__ | array<br/> |
| __data[]__ | object<br/> |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

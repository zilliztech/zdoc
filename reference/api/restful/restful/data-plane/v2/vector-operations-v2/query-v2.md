---
displayed_sidebar: restfulSidebar
sidebar_position: 31
slug: /restful/query-v2
title: Query
---

import RestHeader from '@site/src/components/RestHeader';

This operation conducts a filtering on the scalar field with a specified boolean expression.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup",
    "filter": "color like \"red_%\"",
    "outputFields": [
        "color"
    ],
    "limit": 3
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
            "color": "red_4794",
            "id": 4
        },
        {
            "color": "red_9392",
            "id": 6
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
    "filter": "string",
    "outputFields": [],
    "partitionNames": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __filter__ | string  <br/>The filter used to find matches for the search.  |
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

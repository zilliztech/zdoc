---
displayed_sidebar: restfulSidebar
sidebar_position: 60
slug: /restful/get-collection-load-state-v2
title: Get Collection Load State
---

import RestHeader from '@site/src/components/RestHeader';

This operation returns the load status of a specific collection.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/collections/get_load_state" />

---

## Example



```shell
curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": {
        "loadProgress": 100,
        "loadState": "LoadStateLoaded"
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
    "partitionNames": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of a database to which the collection belongs.  |
| __collectionName__ | string  <br/>The name of a collection.  |
| __partitionNames__ | string  <br/>A list of partition names. If any partition names are specified, releasing any of these partitions results in the return of a NotLoad state.  |

## Response

A LoadState object that indicates the load status of the specified collection.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "loadState": "string",
        "loadProgress": "integer"
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
| __data.loadState__ | string  <br/>An object that indicates the load status of the specified collection.  |
| __data.loadProgress__ | integer  <br/>An integer that indicates the load progress in the percentage of the specified collection.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

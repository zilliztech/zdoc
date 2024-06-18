---
displayed_sidebar: restfulSidebar
sidebar_position: 32
slug: /restful/has-collection-v2
title: Has Collection
---

import RestHeader from '@site/src/components/RestHeader';

This operation checks whether a collection exists.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/has" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/collections/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "dbName": "default",
    "collectionName": "quick_setup"
}'
```

The possible response is similar to the following:

```json
{
    "code": 0,
    "data": {
        "has": false
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
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database in which to check the existence of a collection.  |
| __collectionName__ | string  <br/>The name of an existing collection.  |

## Response

A boolean value indicates whether the specified partition exists.

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

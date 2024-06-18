---
displayed_sidebar: restfulSidebar
sidebar_position: 69
slug: /restful/list-aliases-v2
title: List Aliases
---

import RestHeader from '@site/src/components/RestHeader';

This operation lists all existing collection aliases in the specified database.

```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/aliases/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "dbName": "default"
}'
```
Possible response is similar to the following
```json
{
    "code": 0,
    "data": [
        "bob"
    ]
}
```

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/list" />

---

## Example



# RESTful API Examples




## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

```json
{
    "dbName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of an existing database. The value defaults to __default__.  |

## Response

A list of collection aliases. 

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
| __data[]__ | string  <br/>A list of item objects.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

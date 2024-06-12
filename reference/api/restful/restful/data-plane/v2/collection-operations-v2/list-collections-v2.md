---
displayed_sidebar: restfulSidebar
sidebar_position: 62
slug: /restful/list-collections-v2
title: List Collections
---

import RestHeader from '@site/src/components/RestHeader';

This operation lists all collections in the specified database.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/collections/list" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/collections/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "dbName": "default"
}'
```

The possible output will be similar to the following:

```json
{
  "code": 0,
  "data": [
    "quick_setup_new",
    "customized_setup_1",
    "customized_setup_2"
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
    "dbName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of an existing database.  |

## Response

This operation lists all collections in the database used in the current connection.

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
| __data__ | array<br/>A list of collection names. |
| __data[]__ | string  <br/>A collection name.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

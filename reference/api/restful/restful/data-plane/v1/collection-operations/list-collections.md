---
displayed_sidebar: restfulSidebar
sidebar_position: 19
slug: /restful/list-collections
title: List Collections
---

import RestHeader from '@site/src/components/RestHeader';

Lists collections in a cluster.

<RestHeader method="get" endpoint="https://{cluster-endpoint}/v1/vector/collections" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v1/vector/collections?dbName=default" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" 
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": [
        "custom_setup_not_indexed",
        "quick_setup",
        "custom_setup_indexed"
    ]
}
```



## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `dbName`  | **string**<br/>The name of the database|

- No path parameters required

### Request Body

No request body required

## Response

Returns a list of collections in the specified cluster.

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
| __data[]__ | string  <br/>  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

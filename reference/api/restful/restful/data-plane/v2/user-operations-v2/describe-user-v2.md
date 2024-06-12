---
displayed_sidebar: restfulSidebar
sidebar_position: 44
slug: /restful/describe-user-v2
title: Describe User
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the detailed information of a specific user.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/users/describe" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/users/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "userName": "milvusAdmin"
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        "admin"
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
    "userName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __userName__ | string  <br/>The name of the user to describe.  |

## Response

Returns the name of the roles assigned to the specified user.

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
| __data__ | array<br/>A list of roles already assigned to the user. |
| __data[]__ | string  <br/>A list of item objects.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

---
displayed_sidebar: restfulSidebar
sidebar_position: 43
slug: /restful/drop-user-v2
title: Drop User
---

import RestHeader from '@site/src/components/RestHeader';

This operation deletes an existing user.

```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/users/drop" \
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
    "data": {}
}
```

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/users/drop" />

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
    "userName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __userName__ | string  <br/>The name of the target user. The value should start with a letter and can only contain underline, letters and numbers.  |

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

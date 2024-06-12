---
displayed_sidebar: restfulSidebar
sidebar_position: 42
slug: /restful/update-user-password-v2
title: Update User Password
---

import RestHeader from '@site/src/components/RestHeader';

This operation updates the password for a specific user.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/users/update_password" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/users/update_password" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "newPassword": "P@ssw0rd!",
    "userName": "milvusAdmin",
    "password": "P@ssw0rd"
}'
```
Possible response is similar to the following.
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
    "userName": "string",
    "password": "string",
    "newPassword": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __userName__ | string  <br/>The name of the target user. The value should start with a letter and can only contain underline, letters and numbers.  |
| __password__ | string  <br/>The corresponding password to the new user to create. <br/>The password must be a string of 8 to 64 characters and must include at least three of the following character types: uppercase letters, lowercase letters, numbers, and special characters.  |
| __newPassword__ | string  <br/>The new password for the specified user.    The password must be a string of 8 to 64 characters and must include at least three of the following character types: uppercase letters, lowercase letters, numbers, and special characters.  |

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

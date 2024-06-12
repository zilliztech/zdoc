---
displayed_sidebar: restfulSidebar
sidebar_position: 48
slug: /restful/describe-role-v2
title: Describe Role
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the details of a specified role.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/roles/describe" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/roles/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "roleName": "readOnly"
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        {
             "objectType": "Collection",
             "objectName": "*",
             "privilege": "Search",
             "roleName": "readOnly"
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
    "roleName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __roleName__ | string  <br/>The name of the role.  |

## Response

An object that contains the detailed desription of a role.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": [
        {
            "object_type": "string",
            "privilege": "string",
            "object_name": "string",
            "db_name": "string",
            "grantor": "string"
        }
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
| __data__ | array<br/>A list of privilege items. |
| __data[]__ | object<br/> |
| __data[].object_type__ | string  <br/>The type of the object to which the privilege belongs.  |
| __data[].privilege__ | string  <br/>The privilege that is granted to the role.  |
| __data[].object_name__ | string  <br/>The name of the object to which the role is granted the specified privilege.  |
| __data[].db_name__ | string  <br/>The name of the database in which this operation has been executed.  |
| __data[].grantor__ | string  <br/>The name of the user who granted a specific role to a user.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

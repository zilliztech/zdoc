---
displayed_sidebar: restfulSidebar
sidebar_position: 48
slug: /restful/describe-role-v2
title: Describe Role
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the details of a specified role.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/roles/describe" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "https://${CLUSTER_ENDPOINT}/v2/vectordb/roles/describe" \
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

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation.
Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "roleName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __roleName__ | __string__  <br/>The name of the role.  |

## Response

An object that contains the detailed desription of a role.

### Response Body

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

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/>A list of privilege items. |
| __data[]__ | __object__<br/> |
| __data[].object_type__ | __string__  <br/>The type of the object to which the privilege belongs.  |
| __data[].privilege__ | __string__  <br/>The privilege that is granted to the role.  |
| __data[].object_name__ | __string__  <br/>The name of the object to which the role is granted the specified privilege.  |
| __data[].db_name__ | __string__  <br/>The name of the database in which this operation has been executed.  |
| __data[].grantor__ | __string__  <br/>The name of the user who granted a specific role to a user.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |


---
displayed_sidebar: restfulSidebar
sidebar_position: 51
slug: /restful/grant-privilege-to-role-v2
title: Grant Privilege To Role
---

import RestHeader from '@site/src/components/RestHeader';

This operation grants a privilege to the current role.

> Notes
> - To complete this operation, you need to enable authentication on your Milvus instance. For details, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md).
> - To learn more about the privileges and role objects, refer to [Users & Roles](https://milvus.io/docs/users_and_roles.md)

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/roles/grant_privilege" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/roles/grant_privilege" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "objectType": "Collection",
    "objectName": "*",
    "privilege": "Search",
    "roleName": "readOnly"
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
    "roleName": "string",
    "objectType": "string",
    "objectName": "string",
    "privilege": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __roleName__ | string  <br/>The name of the role.  |
| __objectType__ | string  <br/>The type of the object to which the privilege belongs.  |
| __objectName__ | string  <br/>The name of the object to which the role is granted the specified privilege.  |
| __privilege__ | string  <br/>The privilege that is granted to the role.  |

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

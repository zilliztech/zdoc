---
displayed_sidebar: restfulSidebar
sidebar_position: 46
slug: /restful/grant-role-to-user-v2
title: Grant Role To User
---

import RestHeader from '@site/src/components/RestHeader';

This operation grants a specified role to the current user. Once granted the role, the user gets permissions allowed for the current role and can perform certain operations.

> Notes
> To complete this operation, you need to enable authentication on your Milvus instance. For details, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md).

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/users/grant_role" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/users/grant_role" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "roleName": "admin",
    "userName": "milvusAdmin"
}'
```
Possible response is similar to the following:
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

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation.
Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "userName": "string",
    "roleName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __userName__ | __string__  <br/>The name of the target user. The value should start with a letter and can only contain underline, letters and numbers.  |
| __roleName__ | __string__  <br/>The name of the target role.  |

## Response

None

### Response Body

```json
{
    "code": "integer",
    "data": {}
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |

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


---
displayed_sidebar: restfulSidebar
sidebar_position: 50
slug: /restful/drop-role-v2
title: Drop Role
---

import RestHeader from '@site/src/components/RestHeader';

This operation drops an existing role. The operation will succeed if the specified role exists. Otherwise, this operation will fail.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/roles/drop" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/roles/drop" \
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
    "roleName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __roleName__ | string  <br/>The name of the role.  |

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

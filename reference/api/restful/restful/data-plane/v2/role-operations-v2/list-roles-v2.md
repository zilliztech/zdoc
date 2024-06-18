---
displayed_sidebar: restfulSidebar
sidebar_position: 47
slug: /restful/list-roles-v2
title: List Roles
---

import RestHeader from '@site/src/components/RestHeader';

This operation lists the information about all existing roles.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        "admin",
        "public"
    ]
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

```json
{}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|


## Response

A RoleInfo object that contains a list of RoleItem objects.

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
| __data[]__ | string  <br/>A list of item objects.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

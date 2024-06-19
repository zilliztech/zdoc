---
displayed_sidebar: restfulSidebar
sidebar_position: 45
slug: /restful/list-users-v2
title: List Users
---

import RestHeader from '@site/src/components/RestHeader';

This operation lists the information of all existing users.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/users/list" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/users/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": [
        "root"
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
    | __Authorization__  | **string**<br/>The authentication token|

### Request Body

```json
{}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|


## Response

An object that contains contains the user information.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {}
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/>A list of user names |
| __data[]__ | __string__  <br/>A user name.  |

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


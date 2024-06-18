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

### Request Body

```json
{}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|


## Response

An object that contains contains the user information.

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
| __data__ | array<br/>A list of user names |
| __data[]__ | string  <br/>A user name.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

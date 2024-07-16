---
displayed_sidebar: restfulSidebar
sidebar_position: 25
slug: /restful/list-aliases-v2
title: List Aliases
---

import RestHeader from '@site/src/components/RestHeader';

This operation lists all existing collection aliases in the specified database.

```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" 
```
Possible response is similar to the following
```json
{
    "code": 0,
    "data": [
        "bob"
    ]
}
```

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/list" />

---

## Example



# RESTful API Examples




## Request

### Parameters

- No query parameters required

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation in seconds. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|


## Response

A list of collection aliases. 

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
| __data__ | __array__<br/> |
| __data[]__ | __string__  <br/>A list of item objects.  |

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


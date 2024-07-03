---
displayed_sidebar: restfulSidebar
sidebar_position: 70
slug: /restful/describe-alias-v2
title: Describe Alias
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the details of a specific alias.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "https://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw  '{
    "aliasName": "bob"
}'
```
Possible response is similar to the following
```shell
{
    "code": 0,
    "data": {
        "aliasName": "bob",
        "collectionName": "quick_setup",
        "dbName": "default"
    }
}
```



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
{
    "dbName": "string",
    "aliasName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of the database to which the collection belongs.  |
| __aliasName__ | __string__  <br/>The name of the alias whose details are to be listed.  |

## Response

An alias object that contains the detailed description of an alias.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "dbName": "string",
        "collectionName": "string",
        "aliasName": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.dbName__ | __string__  <br/>The name of the database to which the collection belongs.  |
| __data.collectionName__ | __string__  <br/>the name of the collection to which an alias belongs.  |
| __data.aliasName__ | __string__  <br/>The name of the alias.  |

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


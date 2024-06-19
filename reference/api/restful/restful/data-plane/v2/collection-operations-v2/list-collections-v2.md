---
displayed_sidebar: restfulSidebar
sidebar_position: 66
slug: /restful/list-collections-v2
title: List Collections
---

import RestHeader from '@site/src/components/RestHeader';

This operation lists all collections in the specified database.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/collections/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "dbName": "default"
}'
```

The possible output will be similar to the following:

```json
{
  "code": 0,
  "data": [
    "quick_setup_new",
    "customized_setup_1",
    "customized_setup_2"
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
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation. Setting this to None indicates that this operation times out when any response returns or an error occurs.
|
    | __Authorization__  | **string**<br/>The authentication token|

### Request Body

```json
{
    "dbName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of an existing database.  |

## Response

This operation lists all collections in the database used in the current connection.

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
| __data__ | __array__<br/>A list of collection names. |
| __data[]__ | __string__  <br/>A collection name.  |

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


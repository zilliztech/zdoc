---
displayed_sidebar: restfulSidebar
sidebar_position: 33
slug: /restful/rename-collection-v2
title: Rename Collection
---

import RestHeader from '@site/src/components/RestHeader';

This operation renames an existing collection and optionally moves the collection to a new database.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/rename" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/collections/rename" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "dbName": "default",
    "collectionName": "test_collection",
    "newCollectionName": "quick_setup"
}'
```
Possible responses are similar to the following:

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
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation in seconds. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token|

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string",
    "newDbName": "string",
    "newCollectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of the database to which the collection belongs.<br/>Setting this to a non-existing database results in an error.  |
| __collectionName__ | __string__  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __newDbName__ | __string__  <br/>The name of the database to which the collection belongs after this operation.<br/>The value defaults to **default**. Setting this to a database rather than the one the collection belongs to before this operation moves this collection to the specified database.
Setting this to a non-existing database results in an error.  |
| __newCollectionName__ | __string__  <br/>The name of the target collection after this operation.<br/>Setting this to the value of **old_collection_name** results in an error.  |

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


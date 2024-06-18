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
| __dbName__ | string  <br/>The name of the database to which the collection belongs.<br/>Setting this to a non-existing database results in an error.  |
| __collectionName__ | string  <br/>The name of the target collection.<br/>Setting this to a non-existing collection results in an error.  |
| __newDbName__ | string  <br/>The name of the database to which the collection belongs after this operation.<br/>The value defaults to **default**. Setting this to a database rather than the one the collection belongs to before this operation moves this collection to the specified database.
Setting this to a non-existing database results in an error.  |
| __newCollectionName__ | string  <br/>The name of the target collection after this operation.<br/>Setting this to the value of **old_collection_name** results in an error.  |

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

---
displayed_sidebar: restfulSidebar
sidebar_position: 71
slug: /restful/alter-alias-v2
title: Alter Alias
---

import RestHeader from '@site/src/components/RestHeader';

This operation reassigns the alias of one collection to another.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/alter" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/aliases/alter" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw  '{
    "aliasName": "bob",
    "collectionName": "custom_setup_indexed"
}'
```
Possible response is similar to the following
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
    "aliasName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database to which the collection belongs.  |
| __collectionName__ | string  <br/>The name of the target collection to reassign an alias to.  |
| __aliasName__ | string  <br/>The alias of the collection.  |

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

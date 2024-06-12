---
displayed_sidebar: restfulSidebar
sidebar_position: 66
slug: /restful/describe-alias-v2
title: Describe Alias
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the details of a specific alias.

<RestHeader method="post" endpoint="https://{cluster-endpoint}/v2/vectordb/aliases/describe" />

---

## Example



```shell
export MILVUS_URI="localhost:19530"
export TOKEN="root:Milvus"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/aliases/describe" \
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

### Request Body

```json
{
    "dbName": "string",
    "aliasName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database to which the collection belongs.  |
| __aliasName__ | string  <br/>The name of the alias whose details are to be listed.  |

## Response

An alias object that contains the detailed description of an alias.

### Response Bodies

- Response body if we process your request successfully

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
| __data.dbName__ | string  <br/>The name of the database to which the collection belongs.  |
| __data.collectionName__ | string  <br/>the name of the collection to which an alias belongs.  |
| __data.aliasName__ | string  <br/>The name of the alias.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

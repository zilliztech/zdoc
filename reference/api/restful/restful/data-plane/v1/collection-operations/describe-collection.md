---
displayed_sidebar: restfulSidebar
sidebar_position: 21
slug: /restful/describe-collection
title: Describe Collection
---

import RestHeader from '@site/src/components/RestHeader';

Describes the details of a collection.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/collections/describe" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v1/vector/collections/describe?collectionName=quick_setup" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" 
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": {
        "collectionName": "quick_setup",
        "description": "",
        "enableDynamicField": true,
        "fields": [
            {
                "autoId": false,
                "description": "",
                "name": "id",
                "partitionKey": false,
                "primaryKey": true,
                "type": "Int64"
            },
            {
                "autoId": false,
                "description": "",
                "name": "vector",
                "partitionKey": false,
                "primaryKey": false,
                "type": "FloatVector(5)"
            }
        ],
        "indexes": [
            {
                "fieldName": "vector",
                "indexName": "vector",
                "metricType": "COSINE"
            }
        ],
        "load": "LoadStateLoaded",
        "shardsNum": 1
    }
}
```



## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `collectionName`  | **string**(required)<br/>The name of the collection to describe.|

- No path parameters required

### Request Body

No request body required

## Response

Returns the specified collection in detail.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "collectionName": "string",
        "description": "string",
        "fields": [
            {
                "autoId": "boolean",
                "description": "string",
                "name": "string",
                "primaryKey": "boolean",
                "type": "string"
            }
        ],
        "indexes": [
            {
                "fieldName": "string",
                "indexName": "string",
                "metricType": "string"
            }
        ],
        "load": "string",
        "shardsNum": "integer",
        "enableDynamicField": "boolean"
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
| __data.collectionName__ | string  <br/>The name of the collection.  |
| __data.description__ | string  <br/>An optional description of the collection.  |
| __data[].fields__ | array<br/>An field array |
| __data[].fields[]__ | object<br/> |
| __data[].fields[].autoId__ | boolean  <br/>Whether the primary key automatically increments.  |
| __data[].fields[].description__ | string  <br/>An optional description of the field.  |
| __data[].fields[].name__ | string  <br/>The name of the field.  |
| __data[].fields[].primaryKey__ | boolean  <br/>Whether the field is a primary field.  |
| __data[].fields[].type__ | string  <br/>The data type of the values in this field.  |
| __data[].indexes__ | array<br/>An index array |
| __data[].indexes[]__ | object<br/> |
| __data[].indexes[].fieldName__ | string  <br/>The name of the indexed field.  |
| __data[].indexes[].indexName__ | string  <br/>The name of the generated index files.  |
| __data[].indexes[].metricType__ | string  <br/>The metric type used in the index process.  |
| __data.load__ | string  <br/>The load status of the collection. Possible values are **unload**, **loading**, and **loaded**.  |
| __data.shardsNum__ | integer  <br/>The number of shards in the collection.  |
| __data.enableDynamicField__ | boolean  <br/>Whether the dynamic JSON feature is enabled for this collection.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

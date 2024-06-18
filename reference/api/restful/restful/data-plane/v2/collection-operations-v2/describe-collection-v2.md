---
displayed_sidebar: restfulSidebar
sidebar_position: 67
slug: /restful/describe-collection-v2
title: Describe Collection
---

import RestHeader from '@site/src/components/RestHeader';

Describes the details of a collection.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/describe" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/collections/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "dbName": "default",
    "collectionName": "test_collection"
}'
```
Possible output would be similar to the following:

```json
{
    "code": 0,
    "data": {
        "aliases": [],
        "autoId": false,
        "collectionID": 448707763883002014,
        "collectionName": "test_collection",
        "consistencyLevel": "Bounded",
        "description": "",
        "enableDynamicField": true,
        "fields": [
            {
                "autoId": false,
                "description": "",
                "id": 100,
                "name": "id",
                "partitionKey": false,
                "primaryKey": true,
                "type": "Int64"
            },
            {
                "autoId": false,
                "description": "",
                "id": 101,
                "name": "vector",
                "params": [
                    {
                        "key": "dim",
                        "value": "5"
                    }
                ],
                "partitionKey": false,
                "primaryKey": false,
                "type": "FloatVector"
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
        "partitionsNum": 1,
        "properties": [],
        "shardsNum": 1
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
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to describe.  |

## Response

Returns the specified collection in detail.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "aliases": [
            {}
        ],
        "autoID": "boolean",
        "collectionID": "integer",
        "collectionName": "string",
        "consistencyLevel": "string",
        "description": "string",
        "enableDynamicField": "boolean",
        "fields": [
            {
                "autoId": "boolean",
                "description": "string",
                "id": "integer",
                "name": "string",
                "params": [
                    {
                        "key": "string",
                        "value": "string"
                    }
                ],
                "partitionKey": "boolean",
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
        "partitionNum": "integer",
        "properties": [
            {
                "key": "string",
                "value": "string"
            }
        ],
        "shardsNum": "integer"
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
| __data[].aliases__ | array<br/>A list aliases assigned to the collection. |
| __data[].aliases[]__ | string  <br/>An alias of the collection.  |
| __data.autoID__ | boolean  <br/>Whether the primary key of this collection automatically increments.  |
| __data.collectionID__ | integer (int64) <br/>The ID assigned to the collection upon creation.  |
| __data.collectionName__ | string  <br/>The name of the current collection.  |
| __data.consistencyLevel__ | string  <br/>The consistency level of the current collection.  |
| __data.description__ | string  <br/>The description of the collection.  |
| __data.enableDynamicField__ | boolean  <br/>Whether the reserved dynamic field named $meta is enabled to save non-schema-defined fields and their values in key-value pairs.  |
| __data[].fields__ | array<br/>The collection fields in an array |
| __data[].fields[]__ | object<br/>A field object. |
| __data[].fields[].autoId__ | boolean  <br/>Whether this field automatically increments its value.  |
| __data[].fields[].description__ | string  <br/>The description of the field.  |
| __data[].fields[].id__ | integer  <br/>The field ID.  |
| __data[].fields[].name__ | string  <br/>The name of the current field.  |
| __data[].fields[][].params__ | array<br/>Other field parameters. |
| __data[].fields[][].params[]__ | object<br/>A field parameter in a key-value pair |
| __data[].fields[][].params[].key__ | string  <br/>Field parameter name.  |
| __data[].fields[][].params[].value__ | string  <br/>Field parameter value.  |
| __data[].fields[].partitionKey__ | boolean  <br/>Whether this field serves as a partition key.  |
| __data[].fields[].primaryKey__ | boolean  <br/>Whether this field serves as the primary key.  |
| __data[].fields[].type__ | string  <br/>The data type of the field.  |
| __data[].indexes__ | array<br/>The created indexes in an array |
| __data[].indexes[]__ | object<br/>A index parameter object |
| __data[].indexes[].fieldName__ | string  <br/>The target field of this index.  |
| __data[].indexes[].indexName__ | string  <br/>The name of this index.  |
| __data[].indexes[].metricType__ | string  <br/>The metric type of this index.  |
| __data.load__ | string  <br/>The load status of the current collection.  |
| __data.partitionNum__ | integer  <br/>The number of partitions in the collection.  |
| __data[].properties__ | array<br/>Extra collection properties in an array. |
| __data[].properties[]__ | object<br/>A collection property object in a key-value pair. |
| __data[].properties[].key__ | string  <br/>The property name  |
| __data[].properties[].value__ | string  <br/>The property value.  |
| __data.shardsNum__ | integer  <br/>The number of shards created along with the collection.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

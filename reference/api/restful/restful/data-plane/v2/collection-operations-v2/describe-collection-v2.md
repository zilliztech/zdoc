---
displayed_sidebar: restfulSidebar
sidebar_position: 48
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
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/collections/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
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

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation. Setting this to None indicates that this operation times out when any response returns or an error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to describe.  |

## Response

Returns the specified collection in detail.

### Response Body

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

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data[].aliases__ | __array__<br/>A list aliases assigned to the collection. |
| __data[].aliases[]__ | __string__  <br/>An alias of the collection.  |
| __data.autoID__ | __boolean__  <br/>Whether the primary key of this collection automatically increments.  |
| __data.collectionID__ | __integer__ (int64) <br/>The ID assigned to the collection upon creation.  |
| __data.collectionName__ | __string__  <br/>The name of the current collection.  |
| __data.consistencyLevel__ | __string__  <br/>The consistency level of the current collection.  |
| __data.description__ | __string__  <br/>The description of the collection.  |
| __data.enableDynamicField__ | __boolean__  <br/>Whether the reserved dynamic field named $meta is enabled to save non-schema-defined fields and their values in key-value pairs.  |
| __data[].fields__ | __array__<br/>The collection fields in an array |
| __data[].fields[]__ | __object__<br/>A field object. |
| __data[].fields[].autoId__ | __boolean__  <br/>Whether this field automatically increments its value.  |
| __data[].fields[].description__ | __string__  <br/>The description of the field.  |
| __data[].fields[].id__ | __integer__  <br/>The field ID.  |
| __data[].fields[].name__ | __string__  <br/>The name of the current field.  |
| __data[].fields[][].params__ | __array__<br/>Other field parameters. |
| __data[].fields[][].params[]__ | __object__<br/>A field parameter in a key-value pair |
| __data[].fields[][].params[].key__ | __string__  <br/>Field parameter name.  |
| __data[].fields[][].params[].value__ | __string__  <br/>Field parameter value.  |
| __data[].fields[].partitionKey__ | __boolean__  <br/>Whether this field serves as a partition key.  |
| __data[].fields[].primaryKey__ | __boolean__  <br/>Whether this field serves as the primary key.  |
| __data[].fields[].type__ | __string__  <br/>The data type of the field.  |
| __data[].indexes__ | __array__<br/>The created indexes in an array |
| __data[].indexes[]__ | __object__<br/>A index parameter object |
| __data[].indexes[].fieldName__ | __string__  <br/>The target field of this index.  |
| __data[].indexes[].indexName__ | __string__  <br/>The name of this index.  |
| __data[].indexes[].metricType__ | __string__  <br/>The metric type of this index.  |
| __data.load__ | __string__  <br/>The load status of the current collection.  |
| __data.partitionNum__ | __integer__  <br/>The number of partitions in the collection.  |
| __data[].properties__ | __array__<br/>Extra collection properties in an array. |
| __data[].properties[]__ | __object__<br/>A collection property object in a key-value pair. |
| __data[].properties[].key__ | __string__  <br/>The property name  |
| __data[].properties[].value__ | __string__  <br/>The property value.  |
| __data.shardsNum__ | __integer__  <br/>The number of shards created along with the collection.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |


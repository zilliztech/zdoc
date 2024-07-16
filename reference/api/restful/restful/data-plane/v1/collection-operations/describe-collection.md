---
displayed_sidebar: restfulSidebar
sidebar_position: 34
slug: /restful/describe-collection
title: Describe Collection
---

import RestHeader from '@site/src/components/RestHeader';

Describes the details of a collection.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/collections/describe" />

---

## Example



<include target="zilliz">
import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
You can use eitehr of the following ways to authorize:
<ul>
<li> An API Key with appropriate permissions.</li>
<li>A colon-joined username and password of the target cluster. For example, `username:passowrd`.</li>
</ul>
    
</Admonition>
</include>

```shell
<include target="milvus">
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v1/vector/collections/describe?collectionName=quick_setup" \
</include>
<include target="zilliz">
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530"
export TOKEN="db_admin:xxxxxxxxxxx"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v1/vector/collections/describe?collectionName=quick_setup" \
</include>
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
    | __collectionName__  | **string**(required)<br/>The name of the collection to describe.|

- No path parameters required

- No header parameters required

### Request Body

No request body required

## Response

Returns the specified collection in detail.

### Response Body

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

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.collectionName__ | __string__  <br/>The name of the collection.  |
| __data.description__ | __string__  <br/>An optional description of the collection.  |
| __data[].fields__ | __array__<br/>An field array |
| __data[].fields[]__ | __object__<br/> |
| __data[].fields[].autoId__ | __boolean__  <br/>Whether the primary key automatically increments.  |
| __data[].fields[].description__ | __string__  <br/>An optional description of the field.  |
| __data[].fields[].name__ | __string__  <br/>The name of the field.  |
| __data[].fields[].primaryKey__ | __boolean__  <br/>Whether the field is a primary field.  |
| __data[].fields[].type__ | __string__  <br/>The data type of the values in this field.  |
| __data[].indexes__ | __array__<br/>An index array |
| __data[].indexes[]__ | __object__<br/> |
| __data[].indexes[].fieldName__ | __string__  <br/>The name of the indexed field.  |
| __data[].indexes[].indexName__ | __string__  <br/>The name of the generated index files.  |
| __data[].indexes[].metricType__ | __string__  <br/>The metric type used in the index process.  |
| __data.load__ | __string__  <br/>The load status of the collection. Possible values are **unload**, **loading**, and **loaded**.  |
| __data.shardsNum__ | __integer__  <br/>The number of shards in the collection.  |
| __data.enableDynamicField__ | __boolean__  <br/>Whether the dynamic JSON feature is enabled for this collection.  |

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


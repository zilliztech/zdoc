---
displayed_sidebar: restfulSidebar
sidebar_position: 29
slug: /restful/create-collection-v2
title: Create Collection
---

import RestHeader from '@site/src/components/RestHeader';

This operation creates a collection in a specified cluster.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" />

---

## Example



You can choose between a quick setup or a custom setup as follows:

### Quick setup

The quick setup collection has two fields: the primary and vector fields. It also allows the insertion of undefined fields and their values in key-value pairs in a dynamic field.

```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "test_collection",
    "dimension": 5
}'
```
    
In the above setup,

- The primary and vector fields use their default names (__id__ and __vector__).
- The metric type is also set to its default value (__COSINE__).
- The primary field accepts integers and does not automatically increments.
- The reserved JSON field named __$meta__ is used to store non-schema-defined fields and their values.

You can modify the names of the primary and vector fields and change the metric type. Additionally, the primary field can be set to increment automatically.
    
```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "custom_quick_setup",
    "dimension": 5,
    "primaryFieldName": "my_id",
    "idType": "VarChar",
    "vectorFieldName": "my_vector",
    "metric_type": "L2",
    "autoId": true,
    "params": {
        "max_length": "512"
    }
}'
```

In the above code, the collection will be created and automatically loaded into memory.
    
### Custom Setup with index parameters

For a customized setup, you need to include the schema object in the request. You are advised to include the index parameters also, so that the collection will be indexed upon creation.

```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "custom_setup_indexed",
    "schema": {
        "autoId": false,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "my_id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "my_vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            }
        ]
        
    },
    "indexParams": [
        {
            "fieldName": "my_vector",
            "metricType": "COSINE",
            "indexName": "my_vector",
            "params": {
                "index_type": "AUTOINDEX",
            }
        },
        {
            "fieldName": "my_id",
            "indexName": "my_id",
            "params": {
                "index_type": "STL_SORT"
            }            
        }
    ]
}'
```

Of course, you can leave the index parameters unspecified in the request and create an index for the collection later.

```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "custom_setup_not_indexed",
    "schema": {
        "autoId": false,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "my_id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "my_vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            }
        ]
        
    }
}'
```
Possible responses for the above requests are similar to the following:

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
    | __Request-Timeout__  | **integer**(required)<br/>The timeout duration for this operation. Setting this to None indicates that this operation times out when any response returns or an error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "collectionName": "string",
    "dimension": "integer",
    "metricType": "string",
    "idType": "string",
    "autoID": "string",
    "primaryFieldName": "string",
    "vectorFieldName": "string",
    "schema": {
        "autoID": "string",
        "enableDynamicField": "string",
        "fields": [
            {
                "fieldName": "string",
                "dataType": "string",
                "elementDataType": "string",
                "isPrimary": "boolean",
                "isPartitionKey": "boolean",
                "elementTypeParams": {
                    "max_length": "integer",
                    "dim": "integer",
                    "max_capacity": "integer"
                }
            }
        ]
    },
    "indexParams": [
        {
            "metricType": "string",
            "fieldName": "string",
            "indexName": "string",
            "params": {
                "index_type": "string",
                "M": "integer",
                "efConstruction": "integer",
                "nlist": "integer"
            }
        }
    ],
    "params": {
        "max_length": "integer",
        "enableDynamicField": "boolean",
        "shardsNum": "integer",
        "consistencyLevel": "integer",
        "partitionsNum": "integer",
        "ttlSeconds": "integer"
    }
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to create.  |
| __dimension__ | __integer__  <br/>The number of dimensions a vector value should have.<br/>This is required if **dtype** of this field is set to **DataType.FLOAT_VECTOR**.  |
| __metricType__ | __string__  <br/>The metric type applied to this operation. <br/>Possible values are **L2**, **IP**, and **COSINE**.<br/>The value defaults to COSINE<br/>Possible values: "**L2**", "**IP**", "**COSINE**"  |
| __idType__ | __string__  <br/>The data type of the primary field. This parameter is designed for the quick-setup of a collection and will be ignored if __schema__ is defined.  |
| __autoID__ | __string__  <br/>Whether the primary field automatically increments. This parameter is designed for the quick-setup of a collection and will be ignored if __schema__ is defined.<br/>The value defaults to false  |
| __primaryFieldName__ | __string__  <br/>The name of the primary field. This parameter is designed for the quick-setup of a collection and will be ignored if __schema__ is defined.  |
| __vectorFieldName__ | __string__  <br/>The name of the vector field. This parameter is designed for the quick-setup of a collection and will be ignored if __schema__ is defined.  |
| __schema__ | __object__<br/>The schema is responsible for organizing data in the target collection. A valid schema should have multiple fields, which must include a primary key, a vector field, and several scalar fields. |
| __schema.autoID__ | __string__  <br/>Whether allows the primary field to automatically increment. Setting this to True makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors. Set this parameter in the field with is_primary set to True.  |
| __schema.enableDynamicField__ | __string__  <br/>Whether allows to use the reserved __$meta__ field to hold non-schema-defined fields in key-value pairs.  |
| __schema[].fields__ | __array__<br/>A list of field objects. |
| __schema[].fields[]__ | __object__<br/>A field object |
| __schema[].fields[].fieldName__ | __string__  <br/>The name of the field to create in the target collection  |
| __schema[].fields[].dataType__ | __string__  <br/>The data type of the field values. Possible values are: **DataType.BOOL**, **DataType.INT8**, **DataType.INT16**, **DataType.INT32**, **DataType.INT64**, **DataType.FLOAT**, **DataType.DOUBLE**, **DataType.VARCHAR**, **DataType.ARRAY**, **DataType.JSON**, **DataType.BINARY_VECTOR**, **DataType.FLOAT_VECTOR**, **DataType.FLOAT16_VECTOR**, **DataType.BFLOAT16_VECTOR**, **DataType.SPARSE_FLOAT_VECTOR**.  |
| __schema[].fields[].elementDataType__ | __string__  <br/>The data type of the elements in an array field. Possible values are: **DataType.BOOL**, **DataType.INT8**, **DataType.INT16**, **DataType.INT32**, **DataType.INT64**, **DataType.FLOAT**, **DataType.DOUBLE**, **DataType.VARCHAR**.  |
| __schema[].fields[].isPrimary__ | __boolean__  <br/>Whether the current field is the primary field. Setting this to True makes the current field the primary field.  |
| __schema[].fields[].isPartitionKey__ | __boolean__  <br/>Whether the current field serves as the partition key. Setting this to True makes the current field serve as the partition key. In this case, MilvusZilliz Cloud manages all partitions in the current collection.  |
| __schema[].fields[].elementTypeParams__ | __object__<br/>Extra field parameters. |
| __schema[].fields[].elementTypeParams.max_length__ | __integer__  <br/>An optional parameter for VarChar values that determines the maximum length of the value in the current field.  |
| __schema[].fields[].elementTypeParams.dim__ | __integer__  <br/>An optional parameter for FloatVector or BinaryVector fields that determines the vector dimension.  |
| __schema[].fields[].elementTypeParams.max_capacity__ | __integer__  <br/>An optional parameter for Array field values that determines the maximum number of elements in the current array field.  |
| __indexParams__ | __array__<br/>The parameters that apply to the index-building process. |
| __indexParams[]__ | __object__<br/> |
| __indexParams[].metricType__ | __string__  <br/>The similarity metric type used to build the index.<br/>The value defaults to COSINE<br/>Possible values: "**L2**", "**IP**", "**COSINE**"  |
| __indexParams[].fieldName__ | __string__  <br/>The name of the target field on which an index is to be created.  |
| __indexParams[].indexName__ | __string__  <br/>The name of the index to create, the value defaults to the target field name.  |
| __indexParams[].params__ | __object__<br/>The index type and related settings. For details, refer to [Vector Indexes](https://milvus.io/docs/index.md). |
| __indexParams[].params.index_type__ | __string__  <br/>The type of the index to create  |
| __indexParams[].params.M__ | __integer__  <br/>The maximum degree of the node and applies only when index_type is set to __HNSW__.  |
| __indexParams[].params.efConstruction__ | __integer__  <br/>The search scope. This applies only when **index_type** is set to **HNSW**  |
| __indexParams[].params.nlist__ | __integer__  <br/>The number of cluster units. This applies to IVF-related index types.  |
| __params__ | __object__<br/>Extra parameters for the collection. |
| __params.max_length__ | __integer__  <br/>The maximum number of characters in a VarChar field. This parameter is mandatory when the current field type is VarChar.  |
| __params.enableDynamicField__ | __boolean__  <br/>Whether to enable the reserved dynamic field. If set to true, non-schema-defined fields are saved in the reserved dynamic field as key-value pairs.  |
| __params.shardsNum__ | __integer__  <br/>The number of shards to create along with the current collection.  |
| __params.consistencyLevel__ | __integer__  <br/>The consistency level of the collection. Possible values are __STRONG__, __BOUNDED__, __SESSION__, and __EVENTUALLY__.  |
| __params.partitionsNum__ | __integer__  <br/>The number of partitions to create along with the current collection. This parameter is mandatory if one field of the collection has been designated as the partition key.  |
| __params.ttlSeconds__ | __integer__  <br/>The time-to-live (TTL) period of the collection. If set, the collection is to be dropped once the period ends.  |

## Response

Returns A collection object.

### Response Body

```json
{
    "code": "integer",
    "data": {}
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |


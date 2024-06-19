---
displayed_sidebar: restfulSidebar
sidebar_position: 75
slug: /restful/hybrid-search-v2
title: Hybrid Search
---

import RestHeader from '@site/src/components/RestHeader';



<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" />

---

## Example



```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="user:password"

curl --location --request POST "http://${MILVUS_URI}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "color"
    ]
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        {
            "color": "pink_8682",
            "distance": 1,
            "id": 0
        },
        {
            "color": "red_7025",
            "distance": 0.6290165,
            "id": 1
        },
        {
            "color": "red_4794",
            "distance": 0.5975797,
            "id": 4
        }
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
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation.
Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string",
    "partitionNames": [],
    "search": [
        {
            "data": [],
            "annsField": "string",
            "filter": "string",
            "groupingField": "string",
            "metricType": "string",
            "limit": "integer",
            "offset": "integer",
            "ignoreGrowing": "boolean",
            "params": {
                "radius": "integer",
                "range_filter": "integer"
            }
        }
    ],
    "rerank": "string",
    "limit": "integer",
    "outputFields": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | __string__  <br/>The name of the database.  |
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __partitionNames__ | __array__<br/>The name of the partitions to which this operation applies. |
| __partitionNames[]__ | __string__  <br/>PartitionName  |
| __search__ | __array__<br/> |
| __search[]__ | __object__<br/>The parameter settings specific to this operation. |
| __search[][].data__ | __array__<br/>A list of vector embeddings.<include target="milvus">Milvus</include><include target="zilliz">Zilliz Cloud</include> searches for the most similar vector embeddings to the specified ones. |
| __search[][].data[]__ | __number__ (float32) <br/>A vector embedding  |
| __search[].annsField__ | __string__  <br/>  |
| __search[].filter__ | __string__  <br/>  |
| __search[].groupingField__ | __string__  <br/>  |
| __search[].metricType__ | __string__  <br/>The name of the metric type that applies to the current search. The value should be the same as the metric type of the target collection.<br/>The value defaults to COSINE  |
| __search[].limit__ | __integer__  <br/>  |
| __search[].offset__ | __integer__  <br/>  |
| __search[].ignoreGrowing__ | __boolean__  <br/>  |
| __search[].params__ | __object__<br/>Extra search parameters. |
| __search[].params.radius__ | __integer__  <br/>Determines the threshold of least similarity. When setting metric_type to L2, ensure that this value is greater than that of range_filter. Otherwise, this value should be lower than that of range_filter.  |
| __search[].params.range_filter__ | __integer__  <br/>Refines the search to vectors within a specific similarity range. When setting metric_type to IP or COSINE, ensure that this value is greater than that of radius. Otherwise, this value should be lower than that of radius.  |
| __rerank__ | __string__  <br/>  |
| __limit__ | __integer__  <br/>The total number of entities to return.<br/>You can use this parameter in combination with **offset** in **param** to enable pagination.
The sum of this value and **offset** in **param** should be less than 16,384.  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>A field name  |

## Response

Returns the search results.

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
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |

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


---
displayed_sidebar: restfulSidebar
sidebar_position: 37
slug: /restful/search-v2
title: Search
---

import RestHeader from '@site/src/components/RestHeader';

This operation conducts a vector similarity search with an optional scalar filtering expression.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" />

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

### Request Body

```json
{
    "dbName": "string",
    "collectionName": "string",
    "data": [],
    "annsField": "string",
    "filter": "string",
    "limit": "integer",
    "offset": "integer",
    "groupingField": "string",
    "outputFields": [],
    "searchParams": {
        "metricType": "string",
        "params": {
            "radius": "integer",
            "range_filter": "integer"
        }
    },
    "partitionNames": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __dbName__ | string  <br/>The name of the database.  |
| __collectionName__ | string  <br/>The name of the collection to which this operation applies.  |
| __data__ | array<br/>A list of vector embeddings.<br/><include target="milvus">Milvus</include><include target="zilliz">Zilliz Cloud</include> searches for the most similar vector embeddings to the specified ones. |
| __data[]__ | number (float32) <br/>A vector embedding  |
| __annsField__ | string  <br/>The name of the vector field.  |
| __filter__ | string  <br/>The filter used to find matches for the search.  |
| __limit__ | integer  <br/>The total number of entities to return.<br/>You can use this parameter in combination with **offset** in **param** to enable pagination.
The sum of this value and **offset** in **param** should be less than 16,384.  |
| __offset__ | integer  <br/>The number of records to skip in the search result.      You can use this parameter in combination with limit to enable pagination.     The sum of this value and limit should be less than 16,384.  |
| __groupingField__ | string  <br/>The name of the field that serves as the aggregation criteria.  |
| __outputFields__ | array<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | string  <br/>A field name  |
| __searchParams__ | object<br/>The parameter settings specific to this operation. |
| __searchParams.metricType__ | string  <br/>The name of the metric type that applies to the current search. The value should be the same as the metric type of the target collection.<br/>The value defaults to COSINE  |
| __searchParams.params__ | object<br/>Extra search parameters. |
| __searchParams.params.radius__ | integer  <br/>Determines the threshold of least similarity. When setting metric_type to L2, ensure that this value is greater than that of range_filter. Otherwise, this value should be lower than that of range_filter.  |
| __searchParams.params.range_filter__ | integer  <br/>Refines the search to vectors within a specific similarity range. When setting metric_type to IP or COSINE, ensure that this value is greater than that of radius. Otherwise, this value should be lower than that of radius.  |
| __partitionNames__ | array<br/>The name of the partitions to which this operation applies. |
| __partitionNames[]__ | string  <br/>PartitionName  |

## Response

Returns the search results.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": [
        {}
    ]
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
| __data__ | array<br/> |
| __data[]__ | object<br/> |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
